import { SKINS } from './skins.generated';
import type { AreaRegistryEntry, HomeAssistant } from './types';

type DashboardConfigRecord = Record<string, any>;

const fire = (el: HTMLElement, config: DashboardConfigRecord) => {
  el.dispatchEvent(new CustomEvent('config-changed', {
    bubbles: true,
    composed: true,
    detail: { config },
  }));
};

const deepClone = <T,>(obj: T): T => {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
};

const ENTITY_PICKER_TAG = 'ha-entity-picker';
const CONTROLLABLE_DOMAINS = ['light', 'switch', 'fan', 'cover', 'lock', 'climate', 'media_player', 'vacuum', 'humidifier', 'water_heater', 'valve', 'siren', 'automation', 'group', 'input_boolean'];

export class SkinsProCardEditor extends HTMLElement {
  private _config: DashboardConfigRecord = { type: 'custom:skins-pro-card' };
  private _hass?: HomeAssistant;
  private _areas: AreaRegistryEntry[] = [];
  private _areasLoaded = false;

  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  public setConfig(config: DashboardConfigRecord): void {
    const next = { type: 'custom:skins-pro-card', ...config };
    if (JSON.stringify(next) === JSON.stringify(this._config)) return;
    this._config = next;
    this.render();
  }

  public set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll(ENTITY_PICKER_TAG).forEach((el: any) => {
        if (el) el.hass = hass;
      });
    }
    void this._loadAreas();
  }

  private async _loadAreas(): Promise<void> {
    if (this._areasLoaded || !this._hass) return;
    try {
      const conn = (this._hass as any).connection;
      if (!conn?.sendMessagePromise) return;
      const areas: AreaRegistryEntry[] = await conn.sendMessagePromise({ type: 'config/area_registry/list' });
      if (Array.isArray(areas)) {
        this._areas = areas;
        this._areasLoaded = true;
        this.render();
      }
    } catch { /* area registry not available */ }
  }

  private themeCssUrl(): string {
    const skin = this._config.resource_pack?.skin || 'modern';
    try {
      return new URL(`${skin}/theme.css`, import.meta.url).toString();
    } catch {
      return `/local/community/skins-pro/${skin}/theme.css`;
    }
  }

  private setField(path: string, value: any): void {
    const next = deepClone(this._config);
    const parts = path.split('.');
    let cur: Record<string, any> = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (!p) return;
      cur[p] = cur[p] || {};
      cur = cur[p] as Record<string, any>;
    }
    const last = parts[parts.length - 1];
    if (last) cur[last] = value;
    this._config = next;
    fire(this, this._config);
    this.render();
  }

  private setListItem(path: string, index: number, value: string): void {
    const next = deepClone(this._config);
    const parts = path.split('.');
    let cur: Record<string, any> = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (!p) return;
      cur[p] = cur[p] || {};
      cur = cur[p] as Record<string, any>;
    }
    const last = parts[parts.length - 1];
    if (!last) return;
    const arr: string[] = cur[last] || [];
    if (value) {
      arr[index] = value;
      cur[last] = arr;
      this._config = next;
      fire(this, this._config);
      return;
    }
    arr.splice(index, 1);
    cur[last] = arr;
    this._config = next;
    fire(this, this._config);
    this.render();
  }

  private addListItem(path: string, max?: number): void {
    const next = deepClone(this._config);
    const parts = path.split('.');
    let cur: Record<string, any> = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (!p) return;
      cur[p] = cur[p] || {};
      cur = cur[p] as Record<string, any>;
    }
    const last = parts[parts.length - 1];
    if (!last) return;
    const arr: string[] = cur[last] || [];
    if (max !== undefined && arr.length >= max) return;
    arr.push('');
    cur[last] = arr;
    this._config = next;
    fire(this, this._config);
    this.render();
  }

  private entityPicker(label: string, path: string, value: string, domains?: string[]): string {
    const filter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
    return `
      <label>
        <span>${label}</span>
        <${ENTITY_PICKER_TAG} data-path="${path}"${filter} value="${value || ''}"></${ENTITY_PICKER_TAG}>
      </label>
    `;
  }

  private listPicker(label: string, path: string, values: string[], domains?: string[], max?: number): string {
    const filter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
    const arr = Array.isArray(values) ? values : [];
    const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
      <div class="selector-row">
        <${ENTITY_PICKER_TAG} data-list-path="${path}" data-list-index="${i}"${filter} value="${val || ''}"></${ENTITY_PICKER_TAG}>
        <button class="sp-del" data-del-path="${path}" data-del-index="${i}">✕</button>
      </div>
    `).join('');
    const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-path="${path}" data-add-max="${max ?? ''}">+</button>`;
    return `
      <label>
        <span>${label}</span>
        <div class="sp-list">${rows}</div>
        ${addBtn}
      </label>
    `;
  }

  private areaPicker(values: string[], max?: number): string {
    if (!this._areasLoaded || this._areas.length === 0) {
      return `<p class="muted">Loading areas...</p>`;
    }
    const arr = Array.isArray(values) ? values : [];
    const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
      <div class="selector-row">
        <select data-area-path="home_selection.rooms" data-area-index="${i}">
          <option value="">—</option>
          ${this._areas.map(a => `<option value="${a.area_id}"${a.area_id === val ? ' selected' : ''}>${a.name}</option>`).join('')}
        </select>
        <button class="sp-del" data-del-area-path="home_selection.rooms" data-del-area-index="${i}">✕</button>
      </div>
    `).join('');
    const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-area-path="home_selection.rooms" data-add-max="${max ?? ''}">+</button>`;
    return `
      <div class="sp-list">${rows}</div>
      ${addBtn}
    `;
  }

  private render(): void {
    if (!this.shadowRoot) return;
    const c = this._config || {};
    const hs = c.home_selection || {};
    const hl = c.home_limits || {};

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${this.themeCssUrl()}">
      <style>.bg-preview{max-width:100%;max-height:100px;border-radius:8px;margin-top:8px;display:block}</style>
      <div class="sp-wrap">
        <div class="sp-card">
          <h3>皮肤 / Skin</h3>
          <div class="sp-card-row">
            <label class="sp-field">
              <span>Skin</span>
              <select data-text-path="resource_pack.skin">
                ${(SKINS as readonly string[]).map((s: string) => `<option value="${s}"${s === (c.resource_pack?.skin || 'modern') ? ' selected' : ''}>${s}</option>`).join('')}
              </select>
            </label>
            ${this.entityPicker('Weather', 'weather.entity', c.weather?.entity || hs.weather_entity || '', ['weather'])}
          ${this.entityPicker('信息展示 / Info', 'info.entity', c.info?.entity || '', ['input_text', 'sensor'])}
          <label>
            <input type="checkbox" data-path="fullscreen"${c.fullscreen ? ' checked' : ''}>
            <span>全屏</span>
          </label>
          </div>
        </div>

        <div class="sp-row">
          <div class="sp-card">
            <h3>能源 / Energy</h3>
            ${this.entityPicker('Energy Entity', 'energy.entity', c.energy?.entity || hs.energy_entity || '', ['sensor'])}
          </div>
          <div class="sp-card">
            <h3>房间图片 / Room Images</h3>
            <label>
              <input type="checkbox" data-path="use_area_pictures"${c.use_area_pictures ? ' checked' : ''}>
              <span>使用 Home Assistant 区域图片</span>
            </label>
          </div>
        </div>

        <div class="sp-row">
          <div class="sp-card">
            <h3>背景图 / Background</h3>
            <div class="sp-card-row">
              <input type="file" accept="image/*" data-bg-upload>
              ${c.background_image ? `<img class="bg-preview" src="${c.background_image}"><button class="sp-del" data-bg-clear>✕</button>` : ''}
              ${!c.background_image ? '' : ''}
            </div>
          </div>
        </div>

        <div class="sp-row">
          <div class="sp-card">
            <h3>首页设备 / Home Devices</h3>
            ${this.listPicker('Devices', 'home_selection.devices', hs.devices || [], CONTROLLABLE_DOMAINS, hl.devices || 5)}
          </div>
          <div class="sp-card">
            <h3>首页房间 / Home Rooms</h3>
            ${this.areaPicker(hs.rooms || [], hl.rooms || 4)}
          </div>
        </div>

        <div class="sp-row">
          <div class="sp-card">
            <h3>首页场景 / Home Scenes</h3>
            ${this.listPicker('Scenes', 'home_selection.scenes', hs.scenes || [], ['scene'], hl.scenes || 6)}
          </div>
          <div class="sp-card">
            <h3>首页环境 / Home Environment</h3>
            ${this.listPicker('Environment', 'home_selection.environment', hs.environment || [], ['sensor'], hl.environment || 5)}
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll(ENTITY_PICKER_TAG).forEach((el: any) => {
      if (this._hass) el.hass = this._hass;
      el.addEventListener('value-changed', (ev: CustomEvent) => {
        const path = el.dataset.path || el.dataset.listPath;
        if (!path) return;
        if (el.dataset.listIndex !== undefined) {
          this.setListItem(path, Number(el.dataset.listIndex), ev.detail.value);
        } else {
          this.setField(path, ev.detail.value);
        }
      });
    });

    this.shadowRoot.querySelectorAll<HTMLSelectElement>('select[data-area-path]').forEach((el) => {
      el.addEventListener('change', () => {
        const path = el.dataset.areaPath;
        if (!path || el.dataset.areaIndex === undefined) return;
        this.setListItem(path, Number(el.dataset.areaIndex), el.value);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLInputElement>('input[data-text-path], select[data-text-path]').forEach((el) => {
      el.addEventListener('change', () => {
        const path = el.getAttribute('data-text-path') || '';
        const value: any = el.value;
        if (path === 'resource_pack.skin') {
          const next = deepClone(this._config);
          next.resource_pack = next.resource_pack || {};
          next.resource_pack.skin = value;
          next.resource_pack.base_path = '__AUTO__';
          this._config = next;
          fire(this, this._config);
          return;
        }
        this.setField(path, value);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-path]').forEach((el) => {
      el.addEventListener('change', () => {
        this.setField(el.getAttribute('data-path') || '', el.checked);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-add-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.addListItem(btn.getAttribute('data-add-path') || '', Number(btn.getAttribute('data-add-max')) || undefined));
    });
    this.shadowRoot.querySelectorAll<HTMLElement>('[data-del-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.setListItem(btn.getAttribute('data-del-path') || '', Number(btn.getAttribute('data-del-index')), ''));
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-add-area-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.addListItem(btn.getAttribute('data-add-area-path') || '', Number(btn.getAttribute('data-add-max')) || undefined));
    });
    this.shadowRoot.querySelectorAll<HTMLElement>('[data-del-area-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.setListItem(btn.getAttribute('data-del-area-path') || '', Number(btn.getAttribute('data-del-area-index')), ''));
    });

    const uploadInput = this.shadowRoot.querySelector<HTMLInputElement>('input[data-bg-upload]');
    if (uploadInput) {
      uploadInput.addEventListener('change', async () => {
        const file = uploadInput.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
          const resp = await fetch('/api/file_upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${this._hass?.auth?.data?.access_token || ''}` },
            body: formData,
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const text = await resp.text();
          let path = text.trim();
          try {
            const j = JSON.parse(text);
            path = j.path || j.content_id || path;
          } catch { /* plain text response */ }
          if (path && !path.startsWith('{') && !path.startsWith('<')) {
            this.setField('background_image', path);
            return;
          }
          throw new Error('Invalid path');
        } catch {
          // fallback: read as data URL if upload API fails
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            if (dataUrl) this.setField('background_image', dataUrl);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const clearBtn = this.shadowRoot.querySelector<HTMLElement>('[data-bg-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.setField('background_image', ''));
    }
  }
}

if (!customElements.get('skins-pro-card-editor')) {
  customElements.define('skins-pro-card-editor', SkinsProCardEditor);
}