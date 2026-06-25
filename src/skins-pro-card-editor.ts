import { buildAutoConfig } from './skins-pro-card';

type HassEntity = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
};

type HomeAssistant = {
  states: Record<string, HassEntity | undefined>;
};

type DashboardConfig = Record<string, any>;

const fireConfigChanged = (element: HTMLElement, config: DashboardConfig) => {
  element.dispatchEvent(new CustomEvent('config-changed', {
    bubbles: true,
    composed: true,
    detail: { config },
  }));
};

export class MinecraftDashboardCardEditor extends HTMLElement {
  private _config: DashboardConfig = { type: 'custom:skins-pro-card' };
  private _hass?: HomeAssistant;

  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  public setConfig(config: DashboardConfig): void {
    this._config = { type: 'custom:skins-pro-card', ...config };
    this.render();
  }

  public set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.render();
  }

  private themeCssUrl(): string {
    try {
      return new URL('default/theme.css', import.meta.url).toString();
    } catch {
      return '/local/community/skins-pro/default/theme.css';
    }
  }

  private updateValue(path: string, value: any): void {
    const next = JSON.parse(JSON.stringify(this._config));
    const parts = path.split('.');
    let current: Record<string, any> = next;

    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      if (!part) {
        return;
      }

      current[part] = current[part] || {};
      current = current[part] as Record<string, any>;
    }

    const lastPart = parts[parts.length - 1];
    if (!lastPart) {
      return;
    }

    current[lastPart] = value;
    this._config = next;
    fireConfigChanged(this, this._config);
    this.render();
  }

  private csvInput(label: string, path: string, values: string[]): string {
    return `
      <label>
        <span>${label}</span>
        <input data-csv-path="${path}" value="${(values || []).join(', ').replace(/"/g, '&quot;')}">
      </label>
    `;
  }

  private applyAutoDetect(): void {
    if (!this._hass) {
      return;
    }

    this._config = buildAutoConfig(this._hass as any);
    fireConfigChanged(this, this._config);
    this.render();
  }

  private input(label: string, path: string, value: string): string {
    return `
      <label>
        <span>${label}</span>
        <input data-path="${path}" value="${(value || '').replace(/"/g, '&quot;')}">
      </label>
    `;
  }

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    const config = this._config || {};
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${this.themeCssUrl()}">
      <div class="sp-wrap">
        <div class="sp-card">
          <h3>Quick setup</h3>
          <p>Auto-detect common Home Assistant entities and fill the dashboard config.</p>
          <div><button id="auto-detect">Auto detect entities</button></div>
        </div>
        <div class="sp-card">
          <h3>Basic</h3>
          <div class="sp-grid">
            ${this.input('Language', 'language', config.language || 'auto')}
            ${this.input('Resource pack base path', 'resource_pack.base_path', config.resource_pack?.base_path || '__AUTO__')}
            ${this.input('Chinese title', 'title_zh', config.title_zh || '')}
            ${this.input('English title', 'title_en', config.title_en || '')}
          </div>
        </div>
        <div class="sp-card">
          <h3>Entities</h3>
          <div class="sp-grid">
            ${this.input('Weather entity', 'weather.entity', config.weather?.entity || '')}
            ${this.input('Outdoor temperature entity', 'weather.temperature_entity', config.weather?.temperature_entity || '')}
            ${this.input('Quote entity', 'quote.entity', config.quote?.entity || '')}
            ${this.input('Quote source entity', 'quote.source_entity', config.quote?.source_entity || '')}
            ${this.input('Energy entity', 'energy.entity', config.energy?.entity || '')}
            ${this.input('Energy compare entity', 'energy.compare_value_entity', config.energy?.compare_value_entity || '')}
          </div>
        </div>
        <div class="sp-card">
          <h3>Home selection</h3>
          <p>Comma-separated values. Leave empty to auto-pick.</p>
          <div class="sp-grid">
            ${this.csvInput('Home devices', 'home_selection.devices', config.home_selection?.devices || [])}
            ${this.csvInput('Home rooms', 'home_selection.rooms', config.home_selection?.rooms || [])}
            ${this.csvInput('Home scenes', 'home_selection.scenes', config.home_selection?.scenes || [])}
            ${this.csvInput('Home environment entities', 'home_selection.environment', config.home_selection?.environment || [])}
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#auto-detect')?.addEventListener('click', () => this.applyAutoDetect());
    this.shadowRoot.querySelectorAll<HTMLInputElement>('input[data-path]').forEach((input) => {
      input.addEventListener('change', () => {
        this.updateValue(input.dataset.path || '', input.value);
      });
    });
    this.shadowRoot.querySelectorAll<HTMLInputElement>('input[data-csv-path]').forEach((input) => {
      input.addEventListener('change', () => {
        const values = input.value.split(',').map((item) => item.trim()).filter(Boolean);
        this.updateValue(input.dataset.csvPath || '', values);
      });
    });
  }
}
