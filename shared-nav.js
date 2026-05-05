/* ════════════════════════════════════════════════════════════════════════════════
   SHARED NAVIGATION UTILITY - 360 PLATFORM
   Handles back navigation, theme toggle (body.light), and logo switching
   ════════════════════════════════════════════════════════════════════════════════ */

class PlatformNav {
  constructor() {
    this.themeKey = '360theme';
  }

  /* ── Page detection ────────────────────────────────────────────────────────── */
  getCurrentPage() {
    const url = window.location.pathname;
    const filename = url.split('/').pop().replace('.html', '');
    return filename || 'index';
  }

  /* ── URL parameters ────────────────────────────────────────────────────────── */
  getUrlParams() {
    const p = new URLSearchParams(window.location.search);
    return {
      brand:    p.get('brand')    || '',
      name:     p.get('name')     || '',
      campaign: p.get('campaign') || '',
      cname:    p.get('cname')    || '',
      v:        p.get('v')        || '1',
      plan:     p.get('plan')     || ''
    };
  }

  /* ── Smart back navigation ─────────────────────────────────────────────────── */
  goBack() {
    const page   = this.getCurrentPage();
    const params = this.getUrlParams();

    // plan-output → campaign-detail
    if (page === 'plan-output' && params.campaign) {
      window.location.href =
        `campaign-detail.html?brand=${params.brand}&name=${encodeURIComponent(params.name)}&campaign=${params.campaign}&cname=${encodeURIComponent(params.cname)}`;
      return;
    }

    // campaign pages → brand-detail
    if (['campaign-detail','campaign-quick','campaign-detailed'].includes(page) && params.brand) {
      window.location.href =
        `brand-detail.html?brand=${params.brand}&name=${encodeURIComponent(params.name)}`;
      return;
    }

    // brand / onboarding → agency
    if (['brand-detail','brand-onboarding','brand-onboarding-flow'].includes(page)) {
      window.location.href = 'agency.html';
      return;
    }

    // default
    window.location.href = 'agency.html';
  }

  /* ── Build plan-output URL ─────────────────────────────────────────────────── */
  linkToPlanOutput(brandId, brandName, campaignId, campaignName, version) {
    return `plan-output.html?brand=${brandId}&name=${encodeURIComponent(brandName)}&campaign=${campaignId}&cname=${encodeURIComponent(campaignName)}&v=${version || 1}`;
  }

  /* ── Theme toggle (body.light / body = dark) ────────────────────────────────── */
  initThemeToggle() {
    // Restore saved theme first
    const saved = localStorage.getItem(this.themeKey);
    if (saved === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    this._updateThemeUI();

    // Attach handler to any theme-toggle button
    const btn = document.querySelector('#themeBtn, #themeToggle, .btn-theme-toggle');
    if (btn) {
      // Remove any existing onclick to avoid duplicate calls
      btn.removeAttribute('onclick');
      btn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light');
        localStorage.setItem(this.themeKey, isLight ? 'light' : 'dark');
        this._updateThemeUI();
      });
    }
  }

  _updateThemeUI() {
    const isLight = document.body.classList.contains('light');
    // Update button emoji
    const btn = document.querySelector('#themeBtn, #themeToggle, .btn-theme-toggle');
    if (btn) btn.textContent = isLight ? '☀️' : '🌙';
    // Update nav logo image
    const logo = document.querySelector('#navLogo');
    if (logo) logo.src = isLight ? 'logo-light.png' : 'logo-dark.png';
  }

  /* ── Exit / back button ─────────────────────────────────────────────────────── */
  initExitButton() {
    const btn = document.querySelector('[data-action="exit"]');
    if (btn) {
      btn.removeAttribute('onclick');
      btn.addEventListener('click', () => this.goBack());
    }
  }

  /* ── Breadcrumbs ──────────────────────────────────────────────────────────── */
  updateBreadcrumbs() {
    const params = this.getUrlParams();

    // Brand link in breadcrumb
    const brandLink = document.querySelector('#navBrandLink');
    if (brandLink && params.brand) {
      brandLink.textContent = params.name || params.brand;
      brandLink.href = `brand-detail.html?brand=${params.brand}&name=${encodeURIComponent(params.name)}`;
    }

    // Campaign link in breadcrumb
    const campaignLink = document.querySelector('#navCampaignLink');
    if (campaignLink && params.campaign) {
      campaignLink.textContent = params.cname || params.campaign;
      campaignLink.href = `campaign-detail.html?brand=${params.brand}&name=${encodeURIComponent(params.name)}&campaign=${params.campaign}&cname=${encodeURIComponent(params.cname)}`;
    }

    // Current page name labels
    const brandName = document.querySelector('#navBrandName, #navCampaignName, #navPlanName');
    if (brandName) {
      const page = this.getCurrentPage();
      if (page === 'brand-detail')     brandName.textContent = params.name || 'Brand';
      if (page === 'campaign-detail')  brandName.textContent = params.cname || 'Campaign';
      if (page === 'plan-output')      brandName.textContent = `Plan v${params.v}`;
    }
  }

  /* ── Init all ───────────────────────────────────────────────────────────────── */
  init() {
    this.initThemeToggle();
    this.initExitButton();
    this.updateBreadcrumbs();
  }
}

// Auto-init
window.addEventListener('DOMContentLoaded', () => {
  window.platformNav = new PlatformNav();
  window.platformNav.init();
});

// Expose toggleTheme globally so any remaining inline onclicks still work
window.toggleTheme = function() {
  if (window.platformNav) {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('360theme', isLight ? 'light' : 'dark');
    window.platformNav._updateThemeUI();
  }
};
