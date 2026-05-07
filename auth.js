/* ════════════════════════════════════════════════════════════════════════════════
   AUTH - 360 PLATFORM
   Client-side demo auth using SHA-256 (Web Crypto API).
   Passwords are never stored in plaintext — only SHA-256 hex hashes below.
   Session lives in sessionStorage so it clears when the tab/browser closes.
   ════════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Hardcoded users: email → SHA-256(password) ────────────────────────────── */
  const USERS = {
    'demo@justbaat.com':   '3ea6f0816f17590d6f44f26f12c8390e3d95411f5c54e11a58c8a1e6f549b6bc',
    'pm@justbaat.com':     '3e696be1f5e17d818d5a465e28ca5d395e09cacf23efd123db4b29e1a4b20d71',
    'client@justbaat.com': '6fe45a702470ed4b70f74430abcfbf57d53c040941f03d1f3289e0fcc8bd1fa6'
  };

  /* ── Constants ──────────────────────────────────────────────────────────────── */
  const SESSION_KEY    = '360_sess';      // sessionStorage key for token
  const SESSION_META   = '360_sess_meta'; // sessionStorage key for metadata (email, expiry)
  const RATE_KEY       = '360_rate';      // localStorage key for rate-limit state
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000;   // 8 hours
  const MAX_ATTEMPTS   = 5;
  const LOCKOUT_MS     = 15 * 60 * 1000;  // 15 minutes

  /* ── SHA-256 helper (Web Crypto — built-in, no dependency) ─────────────────── */
  async function sha256hex(str) {
    const buf    = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /* ── Random hex nonce ───────────────────────────────────────────────────────── */
  function randomHex(bytes) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ── Rate limiting ──────────────────────────────────────────────────────────── */
  function getRateState() {
    try {
      return JSON.parse(localStorage.getItem(RATE_KEY)) || { attempts: 0, lockedUntil: 0 };
    } catch { return { attempts: 0, lockedUntil: 0 }; }
  }

  function saveRateState(state) {
    localStorage.setItem(RATE_KEY, JSON.stringify(state));
  }

  function recordFailedAttempt() {
    const s = getRateState();
    s.attempts += 1;
    if (s.attempts >= MAX_ATTEMPTS) {
      s.lockedUntil = Date.now() + LOCKOUT_MS;
      s.attempts = 0; // reset counter so after lockout they get fresh 5 tries
    }
    saveRateState(s);
  }

  function resetRateLimit() {
    localStorage.removeItem(RATE_KEY);
  }

  /* Returns ms remaining in lockout, 0 if not locked */
  function lockoutRemaining() {
    const s = getRateState();
    const remaining = s.lockedUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /* ── Session management ─────────────────────────────────────────────────────── */
  function getSession() {
    try {
      const token = sessionStorage.getItem(SESSION_KEY);
      const meta  = JSON.parse(sessionStorage.getItem(SESSION_META) || 'null');
      if (!token || !meta) return null;
      if (Date.now() > meta.expiry) { clearSession(); return null; }
      return { token, email: meta.email, expiry: meta.expiry };
    } catch { return null; }
  }

  function saveSession(email, token) {
    const meta = { email, expiry: Date.now() + SESSION_TTL_MS };
    sessionStorage.setItem(SESSION_KEY, token);
    sessionStorage.setItem(SESSION_META, JSON.stringify(meta));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_META);
  }

  /* ── Public API ─────────────────────────────────────────────────────────────── */

  /**
   * Attempt login. Returns { ok, error, lockoutMs }
   * ok: true on success
   * error: human-readable string on failure
   * lockoutMs: ms remaining if currently locked out
   */
  window.Auth = {

    async login(email, password) {
      const locked = lockoutRemaining();
      if (locked > 0) {
        return { ok: false, lockoutMs: locked, error: 'Too many failed attempts.' };
      }

      const normalizedEmail = (email || '').trim().toLowerCase();
      const expectedHash    = USERS[normalizedEmail];

      if (!expectedHash) {
        recordFailedAttempt();
        return { ok: false, error: 'Invalid email or password.' };
      }

      const inputHash = await sha256hex(password || '');
      if (inputHash !== expectedHash) {
        recordFailedAttempt();
        const remaining = lockoutRemaining();
        if (remaining > 0) {
          return { ok: false, lockoutMs: remaining, error: 'Too many failed attempts. Account temporarily locked.' };
        }
        const state = getRateState();
        const attemptsLeft = MAX_ATTEMPTS - state.attempts;
        return { ok: false, error: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.` };
      }

      // Success — build session token: sha256(email + passwordHash + nonce)
      const nonce = randomHex(32);
      const token = await sha256hex(normalizedEmail + inputHash + nonce);
      saveSession(normalizedEmail, token);
      resetRateLimit();
      return { ok: true, email: normalizedEmail };
    },

    isAuthenticated() {
      return getSession() !== null;
    },

    getEmail() {
      const s = getSession();
      return s ? s.email : null;
    },

    logout() {
      clearSession();
      window.location.href = 'login.html';
    },

    /* Call this at the top of every protected page */
    guard() {
      if (!this.isAuthenticated()) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace('login.html?next=' + next);
      }
    }
  };
})();
