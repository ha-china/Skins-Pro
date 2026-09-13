// Skins-Pro structural stylesheet — injected by the card itself, NOT part of
// any skin's theme.css.
//
// Why this exists: with 90+ community skins, responsive layout used to be
// duplicated inside every skin's theme.css. This stylesheet moves the DEFAULT
// skeleton into the card so that:
//   1. Skins that style layout keep winning (all rules here use :where(), i.e.
//      zero specificity — any skin rule beats them).
//   2. Skins that DON'T define responsive rules inherit a sane skeleton for
//      free, instead of a broken fixed-width grid.
//   3. The card-owned classes at the bottom (.sp-*) replace the old JS
//      render-time breakpoint branches; CSS reacts to rotation/resize
//      instantly without a re-render.
//
// Skin contract: theme your skin with the --sp-* custom properties (colors,
// radii, fonts, spacing, --sp-sidebar-width, ...). Only add layout rules if you
// really want a different skeleton — they will override everything here.
//
// The card also reflects runtime viewport state on .mc-app as data attributes
// (data-sp-size="sm|md|lg", data-sp-orient="portrait|landscape",
// data-sp-short="true|false", data-sp-zoom="std|mid|hi" from devicePixelRatio)
// so skins can write attribute selectors instead of window media queries —
// those track the CARD's real box, which fixes the "wide window, narrow
// column" problem, and the zoom bucket lets skins thicken hairlines or bump
// targets under OS scaling.

const BASE = `
:where(.mc-app) { width:100%; height:var(--sp-runtime-height); min-height:var(--sp-runtime-min-height); box-sizing:border-box; display:grid; grid-template-columns:var(--sp-sidebar-width,280px) minmax(0,1fr); gap:16px; overflow:clip; }
/* Default container so framework + skins can always use @container sp rules.
   Modern already declares this; harmless duplication for other skins. */
:where(.mc-app) { container: sp / inline-size; }
:where(.mc-app[data-sidebar="hidden"]) { grid-template-columns:0 minmax(0,1fr); gap:0; }
:where(.mc-app .sidebar) { min-height:0; height:100%; overflow:hidden; box-sizing:border-box; }
:where(.mc-app .stage) { min-height:0; height:100%; position:relative; overflow:clip; }
:where(.mc-app .mobile-nav) { display:none; }
/* Transparent decorations float over the stage texture by design; let the
   weather/time block wrap instead of colliding when the welcome column gets
   narrow. */
:where(.weather-with-meta) { flex-wrap:wrap; }
/* Card tiles that pair aspect-ratio with min-height (e.g. .room 4/3 + 160px)
   transfer that min-height through the ratio into a transferred MINIMUM
   WIDTH (160×4/3 ≈ 213px) which beats track stretch — the tile then paints
   over the neighbouring card and the side rail on narrow layouts. Cap the
   transferred width at the track: the tile keeps its taller height, nothing
   overlaps. */
:where(.room, .scene, .device) { min-width:0; max-width:100%; }
/* Same transferred-width problem one level up: a rooms/devices grid whose
   tiles have a transferred min width makes the SECTION's min-content exceed
   the bottom area on narrow layouts, overflowing the grid area into the side
   rail. Let the sections shrink to their area. */
:where(.bottom-stack > *) { min-width:0; max-width:100%; }
`;

const RAIL_1180 = `
@media (max-width: 1180px) {
  :where(.mc-app) { grid-template-columns:80px minmax(0,1fr); }
}
`;

const AUTO_1024 = `
@media (max-width: 1024px) {
  :where(.mc-app) { height:auto; min-height:100vh; overflow:visible; }
  :where(.mc-app .stage) { height:auto; overflow:visible; }
}
`;

const PORTRAIT = `
@media (orientation: portrait) {
  :where(.mc-app) { grid-template-columns:minmax(0,1fr); height:auto; min-height:100dvh; overflow:visible; }
  :where(.mc-app .sidebar) { display:none; }
  :where(.mc-app .stage) { height:auto; overflow:visible; padding-bottom:64px; }
  :where(.mc-app .mobile-nav) { display:flex; flex-direction:row; flex-wrap:nowrap; position:fixed; bottom:0; left:0; right:0; width:100%; z-index:100; padding:var(--sp-space-xs,4px) var(--sp-space-sm,8px) calc(var(--sp-space-xs,4px) + env(safe-area-inset-bottom)) var(--sp-space-sm,8px); justify-content:space-around; }
}
`;

const SMALL_480 = `
@media (max-width: 480px) {
  :where(.mc-app .device) { min-height:90px; }
}
`;

// ─── Portrait safety net (framework-enforced, applies to every skin) ──────
// Some skins' @container rules (meant for narrow LANDSCAPE columns) come
// later in the file than their own portrait @media rules and re-assert a
// two-column stage-grid in portrait — the welcome column and the side rail
// then co-exist on a phone-width screen and panels collide. The framework
// owns data-sp-orient, so this higher-specificity rule (0,3,0 — beats any
// skin class selector regardless of file order) restores single-column
// stacking whenever the CARD is physically portrait. Landscape container
// behaviour is untouched.
const PORTRAIT_SAFETY = `
@media (orientation: portrait) {
  .mc-app[data-sp-orient="portrait"] .stage-grid {
    grid-template-columns: minmax(0,1fr);
    grid-template-rows: auto auto auto;
    grid-template-areas: "welcome" "side" "bottom";
  }
}
`;

// ─── HiDPI / zoom compensation (framework-level, gated) ───────────────────
// OS display scaling and browser zoom shrink the LOGICAL viewport while the
// user physically wants BIGGER content; vw/vh-based fluid tokens decouple
// from that logical width (desktop-scale type on phone-width layout). At
// >=1.5dppx re-anchor the shared token contract to rem so the whole card
// scales uniformly with zoom/root font size. Injected via `:host` in the
// card's <style>, which comes AFTER the skin <link>: same specificity, later
// cascade — so this only takes effect under the dppx condition and never at
// 100% zoom / 100% OS scaling. Values equal what modern's formulas produce
// at a ~1280px logical viewport.
const HIDPI_TOKENS = `
@media (min-resolution: 1.5dppx) {
  :host {
    --sp-app-padding: clamp(6px, 0.7rem, 16px);
    --sp-font-xxl: clamp(20px, 1.9rem, 34px);
    --sp-font-xl: clamp(17px, 1.4rem, 30px);
    --sp-font-lg: clamp(14px, 1.15rem, 24px);
    --sp-font-md: clamp(12px, 0.9rem, 17px);
    --sp-font-sm: clamp(11px, 0.875rem, 16px);
    --sp-font-xs: clamp(10px, 0.8rem, 15px);
    --sp-font-2xs: clamp(9px, 0.72rem, 14px);
    --sp-font-3xs: clamp(8px, 0.66rem, 13px);
    --sp-font-4xs: clamp(7px, 0.6rem, 12px);
    --sp-space-xl: clamp(12px, 1.15rem, 24px);
    --sp-space-lg: clamp(10px, 0.88rem, 18px);
    --sp-space-md: clamp(6px, 0.7rem, 14px);
    --sp-space-sm: clamp(4px, 0.5rem, 12px);
    --sp-space-xs: clamp(3px, 0.43rem, 10px);
    --sp-space-2xs: clamp(2px, 0.38rem, 8px);
    --sp-space-3xs: clamp(2px, 0.25rem, 6px);
  }
}
@media (min-resolution: 1.5dppx) and (orientation: landscape) and (max-height: 768px) {
  :host {
    --sp-font-xxl: clamp(18px, 1.35rem, 30px);
    --sp-font-xl: clamp(16px, 1.125rem, 26px);
    --sp-font-lg: clamp(13px, 0.9rem, 21px);
    --sp-font-md: clamp(11px, 0.77rem, 17px);
    --sp-font-sm: clamp(10px, 0.68rem, 15px);
    --sp-font-xs: clamp(9px, 0.63rem, 14px);
    --sp-font-2xs: clamp(8px, 0.54rem, 13px);
    --sp-font-3xs: clamp(7px, 0.5rem, 12px);
    --sp-font-4xs: clamp(6px, 0.45rem, 11px);
  }
}
`;

// ─── Card-owned responsive classes (migrated from JS render branches) ────
// These are NOT skin extension points; names are sp-prefixed and the markup
// lives in the card, so normal specificity is fine here.

const CARD_CLASSES = `
/* Home: global search pill — landscape centers it over the stage, portrait
   pins it top-right. Previously an inline style chosen at render time, which
   went stale until the next hass update after a rotation. */
.sp-search-entry {
  position:absolute; top:var(--sp-space-sm,8px); left:37.5%; transform:translateX(-50%); width:37.5%;
  z-index:10; display:flex; align-items:center; gap:10px; padding:10px 20px;
  border-radius:var(--sp-radius-pill,999px);
  background:var(--sp-glass-bg,rgba(255,255,255,0.12));
  border:1px solid var(--sp-glass-border,rgba(255,255,255,0.15));
  cursor:pointer; color:var(--sp-text-secondary,rgba(255,255,255,0.5)); font-size:15px;
}
@media (orientation: portrait) {
  .sp-search-entry {
    right:var(--sp-space-sm,8px); left:auto; transform:none; width:auto; max-width:60%;
  }
}
/* When the card is narrow the side rail occupies the top-right of the stage —
   confine the pill to the welcome column instead of letting it slide under
   the rail's first panel. Card width via @container sp (not viewport), so it
   is correct even in a narrow Sections column. */
@container sp (max-width: 1024px) {
  .sp-search-entry { left:var(--sp-space-sm,8px); right:268px; transform:none; width:auto; max-width:none; }
}
@container sp (max-width: 560px) {
  .sp-search-entry { right:var(--sp-space-sm,8px); }
}

/* Home: shortcut devices strip — horizontal scroller in landscape, plain
   stacked grid in portrait. */
.sp-devices-strip { padding:var(--sp-space-xs); }
@media (orientation: landscape) {
  .sp-devices-strip {
    display:grid; grid-auto-flow:column; grid-auto-columns:minmax(140px,1fr);
    grid-template-columns:none; overflow-x:auto; overflow-y:hidden;
    padding:var(--sp-space-xs);
  }
}

/* Home energy card: shown unless portrait + no data (data-visibility decision
   migrated out of JS; .sp-energy-nodata is added by the view when value '--'). */
.sp-energy-home-card { height:auto; min-height:0; flex:0 0 auto; align-self:auto; }
@media (orientation: portrait) {
  .sp-energy-home-card.sp-energy-nodata { display:none; }
}
/* Bars sized with vw track the PHYSICAL viewport and stop growing under
   OS scaling / browser zoom (dppx > 1 decouples vw from logical layout
   width). Re-anchor to rem at >=1.5dppx so they scale with everything else. */
.sp-energy-bars { height:clamp(12px,4vw,48px); margin-top:clamp(4px,1.2vw,12px); }
@media (min-resolution: 1.5dppx) {
  .sp-energy-bars { height:clamp(12px,1.5rem,48px); margin-top:clamp(4px,0.75rem,12px); }
}

/* Global search overlay: backdrop, panel and results grid. Panel spans nearly
   the full width in portrait and is a centered 768px sheet in landscape;
   results switch 1-col / 2-col. Heights use dvh with a vh fallback. */
.sp-search-overlay {
  position:fixed; inset:0; z-index:9999; display:flex; flex-direction:column;
  background:rgba(0,0,0,0.3);
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
}
.sp-search-panel {
  margin:auto; width:100vw; max-height:80vh; max-height:80dvh;
  display:flex; flex-direction:column;
  background:var(--sp-glass-bg,rgba(255,255,255,0.12));
  border:1px solid var(--sp-glass-border,rgba(255,255,255,0.18));
  border-radius:var(--sp-radius-card,20px); overflow:hidden;
}
.sp-search-results { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:16px 20px; display:grid; grid-template-columns:1fr; gap:12px; }
@media (orientation: landscape) {
  .sp-search-panel { width:min(768px,92vw); }
  .sp-search-results { grid-template-columns:repeat(2,1fr); }
}
.sp-search-header { display:flex; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid var(--sp-glass-border,rgba(255,255,255,0.1)); }
.sp-search-input {
  flex:1; border:none; background:transparent; color:var(--sp-text-primary,#fff);
  font-size:18px; outline:none; min-width:0;
}
.sp-search-close {
  background:none; border:0; padding:0; cursor:pointer; display:flex; flex-shrink:0;
  color:var(--sp-text-primary,#fff); opacity:0.7;
}
.sp-search-close:hover { opacity:1; }
.sp-search-chips { display:flex; gap:8px; padding:12px 20px; overflow-x:auto; -webkit-overflow-scrolling:touch; border-bottom:1px solid var(--sp-glass-border,rgba(255,255,255,0.08)); }
.sp-search-chip {
  flex-shrink:0; display:flex; align-items:center; gap:4px; padding:8px 16px; border:none;
  border-radius:var(--sp-radius-pill,999px); font-size:14px; cursor:pointer; transition:all 0.2s;
  background:var(--sp-chip-bg,rgba(255,255,255,0.1)); color:var(--sp-text-primary,#fff);
}
.sp-search-chip.active { background:var(--sp-accent,#007aff); color:#fff; }
.sp-search-chip .sp-chip-count { opacity:0.6; font-size:12px; }
`;

export const STRUCTURE_CSS = [BASE, RAIL_1180, AUTO_1024, PORTRAIT, SMALL_480, PORTRAIT_SAFETY, CARD_CLASSES, HIDPI_TOKENS].join('\n');
