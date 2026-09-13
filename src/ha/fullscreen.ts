// Fullscreen via the standard Fullscreen API. The card element itself becomes
// the fullscreen element, so there is nothing to inject into HA's shadow DOM
// and the browser's own exit semantics (ESC / back gesture) just work. The old approach punched styles
// into home-assistant → ha-drawer → hui-root, which broke on every HA
// frontend refactor.

export function isFullscreen(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

/**
 * Toggle element fullscreen. Returns the resulting state; resolves to false
 * when the browser refused (no user gesture yet, unsupported, denied) so
 * callers can stay in normal mode without throwing.
 */
export async function toggleFullscreen(el: HTMLElement): Promise<boolean> {
  try {
    if (isFullscreen()) {
      await document.exitFullscreen();
      return false;
    }
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    // Older WebKit (Safari < 16.4 desktop, iPad) prefix.
    const webkit = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
    if (webkit.webkitRequestFullscreen) {
      webkit.webkitRequestFullscreen();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
