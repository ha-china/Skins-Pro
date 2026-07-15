const STYLE_ID = 'skins-pro-kiosk';

function removeStyle(root: Document | ShadowRoot | HTMLElement | null | undefined): void {
  if (!root) return;
  for (const child of Array.from(root.children)) {
    if (child instanceof HTMLStyleElement && child.id === STYLE_ID) {
      child.remove();
    }
  }
}

function injectStyle(root: Document | ShadowRoot | HTMLElement | null | undefined, css: string): void {
  if (!root) return;
  removeStyle(root);
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  root.appendChild(style);
}

export function toggleKiosk(): boolean {
  const isKiosk = document.body.classList.toggle('skins-pro-kiosk');

  try {
    const ha = document.querySelector('home-assistant')?.shadowRoot
      ?.querySelector('home-assistant-main')?.shadowRoot;
    if (!ha) return isKiosk;

    const drawer = ha.querySelector('ha-drawer') as HTMLElement | null;
    const lovelace = (ha.querySelector('ha-panel-lovelace') || ha.querySelector('ha-panel-sections')) as HTMLElement | null;
    const huiShadow = lovelace?.shadowRoot?.querySelector('hui-root')?.shadowRoot;

    if (isKiosk) {
      injectStyle(ha,
        `:host {
           --ha-sidebar-width: 0px !important;
           --mdc-drawer-width: 0px !important;
         }`
      );
      if (drawer) {
        injectStyle(drawer,
          `:host {
             --ha-sidebar-width: 0px !important;
             --mdc-drawer-width: 0px !important;
           }
           ha-drawer > ha-sidebar { display: none !important; }
           partial-panel-resolver { --mdc-top-app-bar-width: 100% !important; }`
        );
        injectStyle(drawer.shadowRoot,
          `.mdc-drawer, wa-drawer, .sidebar-shell { display: none !important; }
           mwc-top-app-bar-fixed, mwc-top-app-bar, header { display: none !important; }`
        );
      }
      if (huiShadow) {
        injectStyle(huiShadow,
          `:host {
             --safe-area-inset-top: 0px !important;
             --app-safe-area-inset-top: 0px !important;
             --view-container-padding-top: 0px !important;
           }
           #view {
             min-height: 100vh !important;
             height: 100vh !important;
             margin: 0 !important;
             padding: 0 !important;
             box-sizing: border-box !important;
           }
           #view > hui-view,
           #view hui-panel-view,
           #view hui-card,
           #view skins-pro-card {
             margin-top: 0 !important;
             padding-top: 0 !important;
           }
           .header { display: none !important; }`
        );
      }
    } else {
      removeStyle(drawer?.shadowRoot);
      removeStyle(drawer);
      removeStyle(huiShadow);
      // Remove the parent style last. Older cleanup code searched descendants,
      // so removing the parent first could delete the drawer style and leave
      // --mdc-drawer-width: 0px stuck on home-assistant-main.
      removeStyle(ha);
    }
  } catch {
    // Kiosk manipulation failed silently; dashboard remains functional
  }

  return isKiosk;
}
