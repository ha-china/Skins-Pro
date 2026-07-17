import type { AreaRegistryEntry, TranslationKey } from '../types';
import type { Language } from '../i18n';
import { entityPicker, listPicker, areaPicker, CONTROLLABLE_DOMAINS } from './pickers';

const HOME_DEVICE_DOMAINS = CONTROLLABLE_DOMAINS.filter((d) => !['automation', 'group', 'input_boolean', 'siren', 'lock'].includes(d));
import { buildSkinOptions, type DashboardConfigRecord } from './config';
import { renderNavDialog } from './nav-dialog';
import { renderSkinStore, type SkinStoreState } from './skin-store';
import { skinSupportsDark, selectedSkin } from '../utils';

const EDITOR_CSS = `.bg-preview{max-width:120px;max-height:60px;border-radius:6px;display:block;flex-shrink:0}.sp-card input[type=checkbox]{width:auto;min-height:auto;margin:0}.sp-card label:has(input[type=checkbox]){display:flex;align-items:center;gap:8px}.sp-btn-configure{cursor:pointer}.nav-overlay{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center}.nav-dialog{background:var(--sp-card-bg,var(--sp-panel-bg,var(--glass-regular,var(--ha-card-background,#fff))));border-radius:var(--sp-radius-lg);padding:var(--sp-space-xl);min-width:280px;max-width:380px;box-shadow:var(--sp-shadow-card);border:var(--sp-border-width,1px) solid var(--sp-border-device,var(--sp-border-glass,var(--divider-color,rgba(0,0,0,0.12))));backdrop-filter:var(--sp-blur-lg,none);-webkit-backdrop-filter:var(--sp-blur-lg,none)}.nav-dialog h3{margin:0 0 var(--sp-space-md);font-size:var(--sp-font-md);font-weight:700;color:var(--sp-text-main,var(--sp-text-primary,inherit))}.nav-dialog-item{display:flex;align-items:center;gap:var(--sp-space-sm);padding:var(--sp-space-2xs) 0}.nav-dialog-item span{font-size:var(--sp-font-xs);color:var(--sp-text-main,var(--sp-text-primary,inherit))}.nav-dialog-item input[type=checkbox]{width:auto;min-height:auto;margin:0;margin-left:auto;accent-color:var(--sp-accent)}.nav-dialog-actions{display:flex;gap:var(--sp-space-sm);justify-content:flex-end;margin-top:var(--sp-space-lg)}.nav-dialog-actions button{min-height:38px;border:0;border-radius:var(--sp-radius-sm,8px);padding:0 var(--sp-space-lg);cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-xs);white-space:nowrap}.nav-dialog-actions .nav-cancel{background:var(--sp-device-bg,rgba(128,128,128,0.1));color:var(--sp-text-main,var(--sp-text-primary,inherit));border:var(--sp-border-width,1px) solid var(--sp-border-muted,var(--sp-border-glass,transparent))}.nav-dialog-actions .nav-cancel:hover{filter:brightness(0.96)}.nav-dialog-actions .nav-save{background:var(--sp-accent);color:var(--sp-text-on-accent,#fff)}.nav-dialog-actions .nav-save:hover{filter:brightness(1.08)}.store-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-height:70vh;overflow-y:auto}.store-card{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:8px;background:var(--sp-device-bg,rgba(128,128,128,0.06))}.store-thumb{width:100%;height:auto;border-radius:6px;display:block}.store-info{display:flex;align-items:center;justify-content:space-between;gap:8px}.store-name{font-size:var(--sp-font-xs,13px);font-weight:600;color:var(--sp-text-main,var(--sp-text-primary,inherit))}.store-author{margin-left:6px;font-weight:400;font-size:var(--sp-font-2xs,12px);color:var(--sp-accent,#8ab8cc);text-decoration:none}.store-author:hover{text-decoration:underline}.store-download{min-height:32px;border:0;border-radius:6px;padding:0 12px;cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-2xs,12px);white-space:nowrap;background:var(--sp-accent,#8ab8cc);color:#fff}.store-download:hover{filter:brightness(1.1)}.store-installed{border:1px solid var(--sp-accent,#8ab8cc)}.store-remove{min-height:32px;border:0;border-radius:6px;padding:0 12px;cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-2xs,12px);white-space:nowrap;background:var(--sp-error,#e44);color:#fff}.store-remove:hover{filter:brightness(1.1)}.store-actions{display:flex;gap:10px;align-items:center}.store-dl-count{font-size:var(--sp-font-2xs,11px);color:var(--sp-text-muted,#999)}.store-like{background:none;border:none;cursor:pointer;font:inherit;font-size:var(--sp-font-2xs,12px);display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;color:var(--sp-text-muted,#999);transition:color .15s}.store-like:hover{color:var(--sp-accent,#e44)}.store-like.liked{color:var(--sp-error,#e44)}.store-like-count{font-weight:600}`;

export interface EditorTemplateData {
  config: DashboardConfigRecord;
  areas: AreaRegistryEntry[];
  areasLoaded: boolean;
  language: Language;
  translate: (key: TranslationKey) => string;
  themeCssUrl: string;
  navDialogOpen: boolean;
  skinStore: SkinStoreState;
}

export function renderEditorTemplate(data: EditorTemplateData): string {
  const c = data.config || {};
  const hs = c.home_selection || {};
  const hl = c.home_limits || {};
  const loc = data.translate;

  return `
    <link rel="stylesheet" href="${data.themeCssUrl}">
    <style>${EDITOR_CSS}</style>
    <div class="sp-wrap">
      <div class="sp-card">
        <h3>${loc('editorSkin')}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">
          <label class="sp-field" style="min-width:auto">
            <span>&nbsp;</span>
            <button class="sp-btn-configure" data-skin-store style="min-height:40px;padding:0 14px">${loc('editorSkinStore')}</button>
          </label>
          <label class="sp-field" style="flex:1;min-width:140px">
            <span>${loc('editorSkin')}</span>
            <select data-text-path="resource_pack.skin">
              ${buildSkinOptions(c)}
            </select>
          </label>
          <label class="sp-field" style="min-width:120px;display:grid;justify-items:center;align-content:center">
            <span>${loc('editorUseAreaPictures')}</span>
            <input type="checkbox" data-path="use_area_pictures"${c.use_area_pictures ? ' checked' : ''} style="width:18px;height:18px;margin:0">
          </label>
          <label class="sp-field" style="min-width:80px;display:grid;justify-items:center;align-content:center">
            <span>${loc('editorFullscreen')}</span>
            <input type="checkbox" data-path="fullscreen"${c.fullscreen ? ' checked' : ''} style="width:18px;height:18px;margin:0">
          </label>
        </div>
        <div class="sp-row" style="grid-template-columns:1fr 1fr;gap:12px">
          <label class="sp-field">
            <span>${loc('editorBackground')}</span>
            <div style="display:flex;flex-wrap:nowrap;align-items:center;gap:8px">
              <input type="file" accept="image/*" data-bg-upload style="flex:1;min-width:0">
              ${c.background_image ? `<img class="bg-preview" src="${c.background_image}"><button class="sp-del" data-bg-clear>✕</button>` : ''}
            </div>
          </label>
          <div style="display:flex;gap:12px;align-items:flex-end">
            <label class="sp-field" style="flex:1">
              <span>${loc('editorNavigation')}</span>
              <button class="sp-btn-configure" data-nav-configure>${loc('editorNavigationConfigure')}</button>
            </label>
            ${skinSupportsDark(selectedSkin(c as any)) ? `<label class="sp-field" style="min-width:120px">
              <span>${loc('editorSkinMode')}</span>
              <select data-text-path="skin_mode">
                <option value="auto"${(c.skin_mode || 'auto') === 'auto' ? ' selected' : ''}>${loc('editorSkinModeAuto')}</option>
                <option value="light"${c.skin_mode === 'light' ? ' selected' : ''}>${loc('editorSkinModeLight')}</option>
                <option value="dark"${c.skin_mode === 'dark' ? ' selected' : ''}>${loc('editorSkinModeDark')}</option>
              </select>
            </label>` : ''}
          </div>
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">${entityPicker(loc('editorWeather'), 'weather.entity', c.weather?.entity || hs.weather_entity || '', ['weather'])}</div>
        <div class="sp-card">${entityPicker(loc('editorInfo'), 'info.entity', c.info?.entity || '', ['input_text', 'sensor'])}</div>
      </div>

      <div class="sp-row" style="grid-template-columns:1fr 1fr 1fr">
        <div class="sp-card">
          <h3>${loc('editorEnergy')}</h3>
          ${entityPicker(loc('editorEnergyEntity'), 'energy.entity', c.energy?.entity || hs.energy_entity || '', ['sensor'], ['energy', 'power'])}
        </div>
        <div class="sp-card">
          <h3>${loc('editorMediaPlayer')}</h3>
          ${entityPicker(loc('editorMediaPlayer'), 'media_player.entity', c.media_player?.entity || '', ['media_player'])}
        </div>
        <div class="sp-card">
          <h3>${loc('editorCamera')}</h3>
          ${entityPicker(loc('editorCamera'), 'camera.entity', c.camera?.entity || '', ['camera'])}
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">
          <h3>${loc('editorHomeDevices')}</h3>
          ${listPicker(loc('devices'), 'home_selection.devices', hs.devices || [], HOME_DEVICE_DOMAINS, hl.devices || 5)}
        </div>
        <div class="sp-card">
          <h3>${loc('editorHomeRooms')}</h3>
          ${areaPicker(data.areas, data.areasLoaded, hs.rooms || [], hl.rooms || 4, data.language)}
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">
          <h3>${loc('editorHomeScenes')}</h3>
          ${listPicker(loc('scenes'), 'home_selection.scenes', hs.scenes || [], ['scene'], hl.scenes || 6)}
        </div>
        <div class="sp-card">
          <h3>${loc('editorHomeEnv')}</h3>
          ${listPicker(loc('environment'), 'home_selection.environment', hs.environment || [], ['sensor'], hl.environment || 5)}
        </div>
      </div>

      ${renderNavDialog(c, data.language, data.navDialogOpen)}
      ${renderSkinStore(data.skinStore, c, data.language)}
    </div>
  `;
}
