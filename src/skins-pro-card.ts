import { LitElement, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import type { PropertyValues, TemplateResult } from 'lit';
import './skins-pro-card-editor';

import type {
  AreaRegistryEntry,
  DashboardConfig,
  DeviceRegistryEntry,
  EnergySourceData,
  EntityRegistryEntry,
  FloorRegistryEntry,
  HomeAssistant,
  ViewName,
  WeatherForecastDay,
} from './types';
import type { TranslationKey } from './types';
import type { Language } from './i18n';

import {
  assetHref,
  formatNumber,
  getTranslate,
  normalizeLanguage,
  selectedSkin,
  setDarkAssetSkin,
  skinSupportsDark,
  stateValue,
  weatherIcon,
  t,
  moreInfo,
  navigatePath,
  runScene,
  toggleEntity,
  turnOffAreaType as turnOffAreaTypeAction,
  loadSkinMetadata,
  BUNDLED_SKINS,
} from './utils';

import { mergeConfig } from './config';
import { fetchEnergyHistory, fetchEnergySources, loadWeatherForecast, loadAreas, loadDeviceRegistry, loadEntityRegistry, loadFloors, toggleKiosk } from './ha';

import type { RenderContext } from './render/context';
import { applyFullscreenHeight, applyKioskExitHeight, applyLayoutHeight, applyThemeVariables } from './render/layout';
import { getRealDevicesForRender } from './selectors/devices';
import { CONTROLLABLE_DOMAINS } from './components/device-card';
import { renderHomeView, renderSidebar, renderMobileNav } from './views/home';
import { renderDevicesView } from './views/devices';
import { renderRoomsView } from './views/rooms';
import { renderScenesView } from './views/scenes';
import { renderAutomationsView } from './views/automations';
import { renderEnergyView } from './views/energy';
import { renderSecurityView } from './views/security';
import { renderSearchOverlay } from './views/search';

export class SkinsProCard extends LitElement {
  private _config?: DashboardConfig;
  private _hass?: HomeAssistant;

  @state() private _view: ViewName = 'home';
  @state() private _deviceGrouping: 'area' | 'domain' = 'area';
  @state() private _filterRoom = '';
  @state() private _filterType = '';
  @state() private _hideUnassigned = true;

  @state() private _areas?: AreaRegistryEntry[];
  @state() private _entityRegistry?: EntityRegistryEntry[];
  @state() private _deviceRegistry?: DeviceRegistryEntry[];
  @state() private _floors?: FloorRegistryEntry[];
  @state() private _selectedFloor = '';

  private _areasLoaded = false;
  private _areasLoading = false;
  private _entityRegistryLoaded = false;
  private _entityRegistryLoading = false;
  private _deviceRegistryLoaded = false;
  private _deviceRegistryLoading = false;
  private _floorsLoaded = false;
  private _floorsLoading = false;

  @state() private _energyHistory?: number[];
  @state() private _energyYesterday?: string;
  private _energyHistoryDone = false;
  private _energyHistoryLoading = false;

  @state() private _energySources: EnergySourceData[] = [];
  private _energyPrefsDone = false;
  private _energyPrefsLoading = false;

  @state() private _weatherForecast?: WeatherForecastDay[];
  private _weatherForecastEntity?: string;
  private _weatherForecastUnsub?: () => Promise<void>;

  @state() private _searchOpen = false;
  @state() private _searchQuery = '';
  @state() private _searchFilter = 'all';

  private _autoFullscreenDone = false;
  private _loadedSkinMetadata?: string;
  private readonly _handleWindowResize = () => this._applyLayout();

  public get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  public set hass(value: HomeAssistant | undefined) {
    const old = this._hass;
    this._hass = value;
    this.requestUpdate('hass', old);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('resize', this._handleWindowResize);
    if (this._hass && this._config?.weather?.entity && this._weatherForecastEntity !== this._config.weather.entity) {
      void this.loadWeatherForecast();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._handleWindowResize);
    void this.unsubscribeWeatherForecast();
  }

  public setConfig(config: DashboardConfig): void {
    if (!config || config.type !== 'custom:skins-pro-card') {
      throw new Error('Card type must be custom:skins-pro-card');
    }
    this._config = mergeConfig(config);
    this._energyHistory = undefined;
    this._energyYesterday = undefined;
    this._energyHistoryDone = false;
    this._energySources = [];
    this._energyPrefsDone = false;
    this._weatherForecast = undefined;
    this._weatherForecastEntity = undefined;
    this._autoFullscreenDone = false;
    this._loadedSkinMetadata = undefined;
    void this.unsubscribeWeatherForecast();
    this.requestUpdate();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!this._hass) return;

    if (changed.has('hass') || (this._view === 'energy' && !this._energySources.length)) {
      void this.fetchEnergyPrefs();
    }
    if (changed.has('hass')) {
      void this.loadAreas();
      void this.loadEntityRegistry();
      void this.loadDeviceRegistry();
      void this.loadFloorsRegistry();
      void this.loadEnergyHistory();
    }
    const weatherEntity = this._config?.weather?.entity;
    if (weatherEntity && this._weatherForecastEntity !== weatherEntity) {
      void this.loadWeatherForecast();
    }

    const skin = this._config ? selectedSkin(this._config) : undefined;
    if (skin && skin !== this._loadedSkinMetadata) {
      this._loadedSkinMetadata = skin;
      if (!BUNDLED_SKINS.includes(skin)) {
        void loadSkinMetadata(skin).then((changed) => {
          if (changed) this.requestUpdate();
        });
      }
    }
  }

  public getCardSize(): number {
    return 12;
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('skins-pro-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return { type: 'custom:skins-pro-card' };
  }

  // ─── Registry loading ───────────────────────────────────

  private async loadAreas(): Promise<void> {
    if (!this._hass || this._areasLoaded || this._areasLoading) return;
    this._areasLoading = true;
    try {
      this._areas = await loadAreas(this._hass);
      this._areasLoaded = true;
    } catch {
    } finally {
      this._areasLoading = false;
    }
  }

  private async loadEntityRegistry(): Promise<void> {
    if (!this._hass || this._entityRegistryLoaded || this._entityRegistryLoading) return;
    this._entityRegistryLoading = true;
    try {
      this._entityRegistry = await loadEntityRegistry(this._hass);
      this._entityRegistryLoaded = true;
    } catch {
    } finally {
      this._entityRegistryLoading = false;
    }
  }

  private async loadDeviceRegistry(): Promise<void> {
    if (!this._hass || this._deviceRegistryLoaded || this._deviceRegistryLoading) return;
    this._deviceRegistryLoading = true;
    try {
      this._deviceRegistry = await loadDeviceRegistry(this._hass);
      this._deviceRegistryLoaded = true;
    } catch {
    } finally {
      this._deviceRegistryLoading = false;
    }
  }

  private async loadFloorsRegistry(): Promise<void> {
    if (!this._hass || this._floorsLoaded || this._floorsLoading) return;
    this._floorsLoading = true;
    try {
      this._floors = await loadFloors(this._hass);
      this._floorsLoaded = true;
    } catch {
    } finally {
      this._floorsLoading = false;
    }
  }

  // ─── Energy ─────────────────────────────────────────────

  private async fetchEnergyPrefs(): Promise<void> {
    if (!this._hass || this._energyPrefsDone || this._energyPrefsLoading) return;
    this._energyPrefsLoading = true;
    try {
      const result = await fetchEnergySources(this._hass, this._config!);
      this._energySources = result.sources;
      this._energyHistory = result.history;
      this._energyYesterday = result.yesterday;
      this._energyPrefsDone = result.sources.length > 0;
    } catch {
    } finally {
      this._energyPrefsLoading = false;
    }
  }

  private async loadEnergyHistory(): Promise<void> {
    const entityId = this._config?.energy?.entity;
    if (!entityId || !this._hass || this._energyPrefsDone || this._energyHistoryDone || this._energyHistoryLoading) return;
    this._energyHistoryLoading = true;
    try {
      const result = await fetchEnergyHistory(this._hass, this._config!);
      this._energyHistory = result.history;
      this._energyYesterday = result.yesterday;
      this._energyHistoryDone = result.history.length > 0;
    } catch {
    } finally {
      this._energyHistoryLoading = false;
    }
  }

  // ─── Weather forecast ───────────────────────────────────

  private async loadWeatherForecast(): Promise<void> {
    const entityId = this._config?.weather?.entity;
    if (!entityId || !this._hass) return;
    if (this._weatherForecastEntity === entityId) return;

    await this.unsubscribeWeatherForecast();
    this._weatherForecastEntity = entityId;

    const result = await loadWeatherForecast(
      this._hass, entityId,
      (forecast) => {
        this._weatherForecast = forecast;
        this.requestUpdate();
      },
    );
    this._weatherForecastUnsub = result.unsub;
    if (result.initial) {
      this._weatherForecast = result.initial;
    }
  }

  private async unsubscribeWeatherForecast(): Promise<void> {
    if (this._weatherForecastUnsub) {
      try {
        await this._weatherForecastUnsub();
      } catch {
      } finally {
        this._weatherForecastUnsub = undefined;
      }
    }
  }

  // ─── Layout ─────────────────────────────────────────────

  private _host(): HTMLElement | null | undefined {
    return this.shadowRoot?.host as HTMLElement | undefined;
  }

  private _applyLayout(): void {
    applyLayoutHeight(this._host());
  }

  // ─── Render context ─────────────────────────────────────

  private _buildContext(language: Language, translate: (key: TranslationKey) => string): RenderContext {
    const hass = this._hass!;
    const resolvedTheme = this._resolveTheme();
    setDarkAssetSkin(resolvedTheme === 'dark' ? selectedSkin(this._config) : null);
    return {
      config: this._config!,
      hass,
      language,
      translate,
      areas: this._areas,
      entityRegistry: this._entityRegistry,
      deviceRegistry: this._deviceRegistry,
      floors: this._floors,
      view: this._view,
      deviceGrouping: this._deviceGrouping,
      filterRoom: this._filterRoom,
      filterType: this._filterType,
      hideUnassigned: this._hideUnassigned,
      selectedFloor: this._selectedFloor,
      weatherForecast: this._weatherForecast,
      energyHistory: this._energyHistory,
      energyYesterday: this._energyYesterday,
      energySources: this._energySources,
      onNavigate: (target) => this.navigateTo(target),
      onNavigatePath: (path) => navigatePath(path),
      onRunScene: (entityId) => { void runScene(this._hass, entityId); },
      onToggleEntity: (entityId) => { void toggleEntity(this._hass, entityId); },
      onHandleAction: (entityId, action) => this.handleAction(entityId, action),
      onBatchControl: (state) => { void this.batchControl(state, translate); },
      onToggleKiosk: () => this.toggleKioskFullscreen(),
      onMoreInfo: (entityId) => moreInfo(this, entityId),
      onTurnOffAreaType: (entityIds) => turnOffAreaTypeAction(this._hass, entityIds),
      searchOpen: this._searchOpen,
      onOpenSearch: () => { this._searchOpen = true; },
      onCloseSearch: () => { this._searchOpen = false; this._searchQuery = ''; this._searchFilter = 'all'; },
      setDeviceGrouping: (g) => { this._deviceGrouping = g; },
      setFilterRoom: (r) => { this._filterRoom = r; },
      setFilterType: (t) => { this._filterType = t; },
      setHideUnassigned: (h) => { this._hideUnassigned = h; },
      setSelectedFloor: (f) => { this._selectedFloor = f; },
      resolvedTheme: this._resolveTheme(),
    };
  }

  // ─── Main render ────────────────────────────────────────

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    if (!this._hass) {
      return html`
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
        <ha-card><div class="loading-state">Loading...</div></ha-card>
      `;
    }

    const language = normalizeLanguage(
      this._config.language === 'auto' ? this._hass.language : this._config.language,
    );
    const translate = getTranslate(language);
    const ctx = this._buildContext(language, translate);

    const weatherIconName = weatherIcon(stateValue(this._hass, this._config.weather?.entity, language));
    const quote = stateValue(this._hass, this._config.info?.entity, language) || translate('loadingQuote');
    const energyEntityId = this._config.energy?.entity || '';
    const energyValue = this._config.energy?.entity ? formatNumber(stateValue(this._hass, this._config.energy.entity, language), 1) : '--';
    const energyUnit = (this._hass?.states[energyEntityId]?.attributes?.unit_of_measurement as string | undefined) || this._config.energy?.unit || 'kWh';
    const compareValue = this._energyYesterday || '';
    const registriesLoading = this.renderRegistryLoading(language);

    let stage: TemplateResult;
    switch (this._view) {
      case 'devices': stage = renderDevicesView(ctx); break;
      case 'rooms': stage = renderRoomsView(ctx); break;
      case 'scenes': stage = renderScenesView(ctx); break;
      case 'automations': stage = renderAutomationsView(ctx); break;
      case 'security': stage = renderSecurityView(ctx); break;
      case 'energy': stage = renderEnergyView(ctx, energyValue, energyUnit, compareValue); break;
      default: stage = renderHomeView(ctx, weatherIconName, quote, energyValue, energyUnit, compareValue);
    }

    return html`
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
      <ha-card>
        ${registriesLoading}
        <div class="mc-app" data-view=${this._view}>
          ${renderSidebar(ctx)}
          <main class="stage">${stage}</main>
          ${renderMobileNav(ctx)}
        </div>
        ${this._searchOpen
          ? renderSearchOverlay(
              ctx,
              this._searchQuery,
              this._searchFilter,
              (q) => { this._searchQuery = q; },
              (f) => { this._searchFilter = f; },
            )
          : nothing}
      </ha-card>
    `;
  }

  private renderRegistryLoading(language: Language): TemplateResult | typeof nothing {
    if (!this._hass) return nothing;
    const allLoaded = this._areasLoaded && this._entityRegistryLoaded && this._deviceRegistryLoaded;
    if (allLoaded) return nothing;
    return html`<div class="loading-state loading-registry">${t(language, 'loadingRegistry')}</div>`;
  }

  // ─── Lifecycle ──────────────────────────────────────────

  protected updated(): void {
    applyThemeVariables(this._host(), this._config);
    this._applyLayout();
    this._applyThemeAttribute();
    if (this._config?.fullscreen && !this._autoFullscreenDone) {
      this._autoFullscreenDone = true;
      applyFullscreenHeight(this._host());
      toggleKiosk();
    }
  }

  private _resolveTheme(): 'light' | 'dark' {
    if (!skinSupportsDark(selectedSkin(this._config))) return 'light';
    const mode = this._config?.skin_mode || 'auto';
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    // auto: use sun entity, fallback to hour-based
    const sun = this._hass?.states?.['sun.sun'];
    if (sun?.state === 'above_horizon') return 'light';
    if (sun?.state === 'below_horizon') return 'dark';
    // no sun data: 6:00-17:59 = light, 18:00-5:59 = dark
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  }

  private _applyThemeAttribute(): void {
    this.setAttribute('data-sp-theme', this._resolveTheme());
  }

  private handleAction(entityId: string, action: string): void {
    if (action === 'toggle') {
      void toggleEntity(this._hass, entityId);
    } else if (action === 'play-pause') {
      void this._hass?.callService('media_player', 'media_play_pause', { entity_id: entityId });
    } else {
      moreInfo(this, entityId);
    }
  }

  private navigateTo(target: string): void {
    const valid: ViewName[] = ['home', 'devices', 'rooms', 'scenes', 'automations', 'security', 'energy'];
    if (valid.includes(target as ViewName)) {
      this._view = target as ViewName;
    }
  }

  private toggleKioskFullscreen(): void {
    const host = this._host();
    if (document.body.classList.contains('skins-pro-kiosk')) {
      toggleKiosk();
      if (host) applyKioskExitHeight(host);
    } else {
      if (host) applyFullscreenHeight(host);
      toggleKiosk();
    }
  }

  private async batchControl(state: 'on' | 'off', translate: (key: TranslationKey) => string): Promise<void> {
    const devices = getRealDevicesForRender(this._hass, this._deviceRegistry, this._entityRegistry, this._areas, {
      filterRoom: this._filterRoom,
      filterType: this._filterType,
      hideUnassigned: this._hideUnassigned,
    });
    const controllable = devices.filter((d) => CONTROLLABLE_DOMAINS.has(d.detail));
    if (controllable.length === 0) return;
    if (!confirm(translate('confirmAction'))) return;
    const service = state === 'on' ? 'turn_on' : 'turn_off';
    await Promise.all(controllable.map((d) => this._hass?.callService(d.detail, service, { entity_id: d.entityId })));
  }
}
