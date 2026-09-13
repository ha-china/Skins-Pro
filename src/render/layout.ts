import type { DashboardConfig } from '../types';
import { assetUrl } from '../utils';
import { isPortrait, isShortLandscape } from '../utils/breakpoints';

// Layout floors — kept intentionally low so small containers
// (narrow HA columns, sections dashboards, half-height panels)
// don't get force-stretched past their actual box.
const FLOOR_NORMAL = 320;
const FLOOR_SHORT_LANDSCAPE = 240;

export function applyLayoutHeight(host: HTMLElement | null | undefined): void {
  if (!host) return;

  // Portrait: let the document flow; use 100dvh (mobile-friendly, accounts for URL bar).
  if (isPortrait()) {
    host.style.setProperty('--sp-runtime-height', 'auto');
    host.style.setProperty('--sp-runtime-min-height', '100dvh');
    return;
  }

  const rect = host.getBoundingClientRect();
  const shortLand = isShortLandscape();
  const floor = shortLand ? FLOOR_SHORT_LANDSCAPE : FLOOR_NORMAL;

  // host may not be laid out yet (top/width == 0); skip this pass — ResizeObserver
  // or the next updated() cycle will pick it up.
  if (rect.width === 0 && rect.top === 0 && rect.height === 0) return;

  // Use viewport-minus-top as the primary signal (Lovelace cards aren't height-constrained
  // by their parent), but never go below the floor.
  const available = Math.max(floor, Math.floor(window.innerHeight - rect.top));
  host.style.setProperty('--sp-runtime-height', `${available}px`);
  host.style.setProperty('--sp-runtime-min-height', `${available}px`);
}

export function applyThemeVariables(host: HTMLElement | null | undefined, config: DashboardConfig | undefined): void {
  if (!host) return;

  const theme = config?.resource_pack?.theme;
  if (theme) {
    for (const [key, value] of Object.entries(theme)) {
      host.style.setProperty(key, value);
    }
  }
  const stageUrl = config?.background_image || assetUrl(config, 'stage');
  host.style.setProperty('--sp-stage-texture', `url("${stageUrl}")`);
  host.style.setProperty('--sp-base-texture', `url("${assetUrl(config, 'base')}")`);
}

// Fullscreen needs no special height handling: when the card element is the
// fullscreen element its rect.top is 0, so applyLayoutHeight naturally sizes
// it to the full viewport. The old kiosk-mode height helpers existed only to
// compensate the shadow-DOM injection approach and are gone with it.
