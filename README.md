# 360° Platform — Production Build

## Overview
This is the clean, production-ready build of the 360° Media Planning Platform. All files are optimized and ready for deployment.

## Files Included

### Core Pages
- **index.html** — Central landing/dashboard (START HERE)
- **agency.html** — Agency workspace, brand management
- **brand-detail.html** — Individual brand dashboard
- **campaign-detail.html** — Campaign management center
- **campaign-quick.html** — Quick template-based campaign builder
- **campaign-detailed.html** — Advanced campaign builder
- **plan-output.html** — Media plan output and forecasts
- **brand-onboarding.html** — Brand profile setup
- **brand-onboarding-flow.html** — Multi-step brand onboarding

### Shared Resources
- **shared-styles.css** — Unified CSS system (variables, components, responsiveness)
- **shared-nav.js** — Navigation controller (routing, theme toggle, breadcrumbs)
- **logo-dark.png** — Dark mode logo (1.9 MB)
- **logo-light.png** — Light mode logo (2.5 MB)

## Setup & Deployment

### Local Development
1. Open `index.html` in a web browser
2. Or use a simple HTTP server:
   ```bash
   python -m http.server 8000
   # Navigate to http://localhost:8000/index.html
   ```

### Theme System
- Dark mode (default) — Stored as `360theme: 'dark'` in localStorage
- Light mode — Activated via theme toggle button (🌙/☀️) in nav
- Automatic persistence across page loads and sessions

### Navigation System
Uses URL parameters to maintain context through the hierarchy:
- `?brand=<id>&name=<name>` — Brand context
- `?campaign=<id>&cname=<name>` — Campaign context  
- `?v=<version>` — Plan version

Smart back button navigates: Plan → Campaign → Brand → Agency

## CSS Architecture

### Variables (Dark/Light Modes)
```css
--bg, --surface, --surface2, --surface3    /* Background colors */
--border, --border2                        /* Border colors */
--text, --text2, --text3                   /* Text colors */
--blue, --cyan, --green, --purple, --red   /* Brand colors */
--radius, --radius-sm                      /* Border radius */
```

### Component Classes
- `.nav-*` — Navigation styling
- `.badge` variants — Status indicators
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` — Buttons
- `.card`, `.modal-*` — Cards and modals
- `.form-*` — Form elements
- `.grid-2`, `.grid-3`, `.grid-4` — Grid layouts
- `.badge-*` — Badge variants (blue, green, amber, red, etc.)

## How It Works

### Theme Toggle
1. User clicks theme button (🌙)
2. `shared-nav.js` toggles `.light` class on `<body>`
3. CSS variables auto-switch via `body.light` overrides
4. Preference saved to localStorage (`360theme`)
5. Logo automatically switches (logo-dark.png ↔ logo-light.png)

### Back Navigation
Intelligent routing based on URL parameters:
- From plan-output.html → go to campaign-detail.html (keep brand/campaign params)
- From campaign pages → go to brand-detail.html (keep brand param)
- From brand pages → go to agency.html (clear params)
- Default → agency.html

### Breadcrumbs
Automatically populated from URL params:
- Shows: Agency › Brand › Campaign › Plan
- Each step is clickable and links to correct page
- Updates dynamically based on current page

## Optimization Status

✓ CSS Duplication removed — All files use shared-styles.css  
✓ Theme system unified — Single source of truth in shared-styles.css  
✓ Navigation centralized — All logic in shared-nav.js  
✓ Logo switching automated — Handled by shared-nav.js  
✓ Page-specific styles kept — Minimal, focused CSS per page  
✓ No toggleTheme() conflicts — Single implementation in shared-nav.js  

## File Size Summary

| File | Size |
|------|------|
| index.html | 8.3 KB |
| agency.html | 16.1 KB |
| brand-detail.html | 20.6 KB |
| campaign-detail.html | 35.1 KB |
| campaign-quick.html | 54.8 KB |
| campaign-detailed.html | 81.8 KB |
| plan-output.html | 65.5 KB |
| brand-onboarding.html | 25.8 KB |
| brand-onboarding-flow.html | 70.1 KB |
| **Total HTML** | **377.1 KB** |
| shared-styles.css | 17.4 KB |
| shared-nav.js | 7.3 KB |
| logo-dark.png | 1,896.4 KB |
| logo-light.png | 2,581.1 KB |
| **Total Build** | **4,879.3 KB** |

## Deployment Checklist

- [ ] Test index.html loads and displays properly
- [ ] Verify all 8 platform pages are accessible from index.html
- [ ] Test dark/light theme toggle works
- [ ] Test back button navigation maintains URL params
- [ ] Verify logos switch correctly with theme
- [ ] Test on mobile (responsive breakpoint: 768px)
- [ ] Test in Chrome, Firefox, Safari
- [ ] Verify no console errors
- [ ] Check localStorage persistence (theme setting)
- [ ] Deploy to server/CDN

## Support & Troubleshooting

**Theme not persisting:** Check browser localStorage permissions

**Back button not working:** Ensure URL params are set correctly in page links

**Logo not switching:** Verify logo files (logo-dark.png, logo-light.png) are in same directory

**CSS not loading:** Ensure shared-styles.css is in same directory, not in subfolder

**Navigation errors:** Check browser console for shared-nav.js errors

---

**Version:** 1.0 | **Build Date:** May 5, 2026 | **Platform:** 360° Media Planning
