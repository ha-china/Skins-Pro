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
  preloadDarkAssets,
  selectedSkin,
  setDarkAssetSkin,
  skinSupportsDark,
  stateValue,
  t,
  moreInfo,
  navigatePath,
  runScene,
  toggleEntity,
  turnOnService,
  turnOffService,
  turnOffAreaType as turnOffAreaTypeAction,
  loadSkinMetadata,
  BUNDLED_SKINS,
} from './utils';

import { mergeConfig } from './config';
import { fetchEnergyHistory, fetchEnergySources, loadWeatherForecast, loadAreas, loadDeviceRegistry, loadEntityRegistry, loadFloors, isFullscreen, toggleFullscreen as enterFullscreen } from './ha';

import type { RenderContext } from './render/context';
import { applyLayoutHeight, applyThemeVariables } from './render/layout';
import { STRUCTURE_CSS } from './render/structure';
import { isPortrait, isShortLandscape, subscribeOrientation } from './utils/breakpoints';
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
import { loadStoreThemes, STORE_PAGE_SIZE, type SkinStoreState, renderSkinStore } from './editor/skin-store';
import { bindSkinStoreActions, type EditorHost } from './editor/events';
import { EDITOR_CSS as STORE_CSS } from './editor/template';

// The subset of RenderContext callbacks that only close over `this` (they read
// live state at call time), so they can be created once and reused across
// renders instead of being rebuilt on every hass push.
type CtxHandlers = Readonly<Pick<
  RenderContext,
  | 'onNavigate'
  | 'onNavigatePath'
  | 'onRunScene'
  | 'onToggleEntity'
  | 'onHandleAction'
  | 'onBatchControl'
  | 'onToggleFullscreen'
  | 'onToggleSidebar'
  | 'onWelcomeClick'
  | 'onMoreInfo'
  | 'onTurnOffAreaType'
  | 'onRoomSelect'
  | 'onOpenSearch'
  | 'onCloseSearch'
  | 'setDeviceGrouping'
  | 'setFilterRoom'
  | 'setFilterType'
  | 'setHideUnassigned'
  | 'setSelectedFloor'
>>;

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

  // Registry load state (loaded/loading per slot). Intentionally NOT reset by
  // setConfig — matches the previous per-field behaviour.
  private _reg = {
    areas: { loaded: false, loading: false },
    entities: { loaded: false, loading: false },
    devices: { loaded: false, loading: false },
    floors: { loaded: false, loading: false },
  };

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

  @state() private _sidebarHidden = false;
  @state() private _isFullscreen = false;
  @state() private _storeOpen = false;
  @state() private _storeState: SkinStoreState = { open: false, loading: false, error: '', themes: [], searchQuery: '', hasMore: false, displayedCount: STORE_PAGE_SIZE };
  // Store state objects are replaced (never mutated) on every change, so identity
  // lets us skip innerHTML rebuilds on hass-only updates.
  private _lastRenderedStore: SkinStoreState | null = null;
  private _lastRenderedConfig?: DashboardConfig;
  private _lastThemeApplied = '';
  private _lastLayoutKey = '';
  private _escapeHandler?: (e: KeyboardEvent) => void;
  private _fns?: CtxHandlers;
  // Manual double-click detector state. We can't rely on the native `dblclick`
  // event because DevTools device-emulation mode (and real touch devices)
  // translate clicks to touch events where `dblclick` is suppressed to make
  // room for double-tap-to-zoom. Manual timing works everywhere.
  private _lastWelcomeClick = 0;

  private _handleWelcomeClick(): void {
    const now = Date.now();
    if (now - this._lastWelcomeClick < 350) {
      this._sidebarHidden = !this._sidebarHidden;
      this._lastWelcomeClick = 0;
    } else {
      this._lastWelcomeClick = now;
    }
  }

  private _autoFullscreenDone = false;
  private _loadedSkinMetadata?: string;
  private _raf = 0;
  private _ro?: ResizeObserver;
  private _lastWidth = 0;
  private _lastZoomBucket: 'std' | 'mid' | 'hi' | '' = '';
  private _unsubOrientation?: () => void;
  // rAF-throttled resize handler: avoids layout thrash when the window
  // or container is being dragged.
  private readonly _handleWindowResize = (): void => {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      this._raf = 0;
      this._applyLayout();
      // Re-render only when the zoom bucket crosses a step (OS scaling change
      // or browser zoom), not on every resize frame.
      const bucket = this._zoomBucket();
      if (bucket !== this._lastZoomBucket) {
        this._lastZoomBucket = bucket;
        this.requestUpdate();
      }
    });
  };

  private _zoomBucket(): 'std' | 'mid' | 'hi' {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    return dpr >= 2 ? 'hi' : dpr >= 1.5 ? 'mid' : 'std';
  }

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
    window.addEventListener('orientationchange', this._handleWindowResize);
    document.addEventListener('fullscreenchange', this._handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this._handleFullscreenChange);
    this.addEventListener('config-changed', this._handleStoreConfigChanged as EventListener);
    // ResizeObserver watches the card's own box — this fires when HA's sidebar
    // opens/closes, when the card is placed inside a Sections dashboard column,
    // or whenever the parent reflows. Width changes are the responsive signal;
    // height is something WE set, so we filter on width to avoid feedback loops.
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (Math.abs(w - this._lastWidth) > 0.5) {
            this._lastWidth = w;
            this._handleWindowResize();
          }
        }
      });
      this._ro.observe(this);
    }
    // Also re-measure on portrait ⇄ landscape flips (covers cases where
    // window.resize fires before orientationchange settles).
    // requestUpdate keeps render-time decisions (view templates) in sync with
    // the new orientation instead of waiting for the next hass update.
    this._unsubOrientation = subscribeOrientation(() => {
      this._handleWindowResize();
      this.requestUpdate();
    });
    if (this._hass && this._config?.weather?.entity && this._weatherForecastEntity !== this._config.weather.entity) {
      void this.loadWeatherForecast();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._handleWindowResize);
    window.removeEventListener('orientationchange', this._handleWindowResize);
    document.removeEventListener('fullscreenchange', this._handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this._handleFullscreenChange);
    this.removeEventListener('config-changed', this._handleStoreConfigChanged as EventListener);
    if (this._autoFullscreenHandler) {
      this.removeEventListener('pointerdown', this._autoFullscreenHandler);
      this._autoFullscreenHandler = undefined;
    }
    this._ro?.disconnect();
    this._ro = undefined;
    this._unsubOrientation?.();
    this._unsubOrientation = undefined;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = 0;
    }
    if (this._escapeHandler) {
      document.removeEventListener('keydown', this._escapeHandler);
      this._escapeHandler = undefined;
    }
    this._unlockKiosk();
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

  private async _loadOnce<T>(
    slot: { loaded: boolean; loading: boolean },
    load: (hass: HomeAssistant) => Promise<T>,
    apply: (data: T) => void,
  ): Promise<void> {
    if (!this._hass || slot.loaded || slot.loading) return;
    slot.loading = true;
    try {
      apply(await load(this._hass));
      // `apply` writes a @state field, but the render it triggers evaluates
      // the loading flags BEFORE `loaded = true` below — without an explicit
      // requestUpdate the "loading" overlay stays up until the next unrelated
      // hass update (forever on a quiet dashboard).
      slot.loaded = true;
      this.requestUpdate();
    } catch {
      // Silent failure keeps the current behaviour (error states are separate
      // work), but `loading` must always be reset.
    } finally {
      slot.loading = false;
    }
  }

  private loadAreas(): Promise<void> {
    return this._loadOnce(this._reg.areas, (hass) => loadAreas(hass), (data) => { this._areas = data; });
  }

  private loadEntityRegistry(): Promise<void> {
    return this._loadOnce(this._reg.entities, (hass) => loadEntityRegistry(hass), (data) => { this._entityRegistry = data; });
  }

  private loadDeviceRegistry(): Promise<void> {
    return this._loadOnce(this._reg.devices, (hass) => loadDeviceRegistry(hass), (data) => { this._deviceRegistry = data; });
  }

  private loadFloorsRegistry(): Promise<void> {
    return this._loadOnce(this._reg.floors, (hass) => loadFloors(hass), (data) => { this._floors = data; });
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
        if (!this.isConnected) return;
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
    // Layout only depends on these three inputs; skip the measure/style write
    // when none of them moved (hass pushes arrive several times a second).
    const host = this._host();
    const key = `${isPortrait()}|${window.innerHeight}|${Math.round(host?.getBoundingClientRect().top ?? 0)}`;
    if (key === this._lastLayoutKey) return;
    this._lastLayoutKey = key;
    applyLayoutHeight(host);
  }

  // ─── Render context ─────────────────────────────────────

  private _ctxFns(): CtxHandlers {
    if (!this._fns) {
      // Handlers only reference `this` and read live state at call time, so a
      // single frozen instance can be shared by every render.
      this._fns = Object.freeze({
        onNavigate: (target: string): void => this.navigateTo(target),
        onNavigatePath: (path: string): void => navigatePath(path),
        onRunScene: (entityId: string): void => { void runScene(this._hass, entityId); },
        onToggleEntity: (entityId: string): void => { void toggleEntity(this._hass, entityId); },
        onHandleAction: (entityId: string, action: string): void => this.handleAction(entityId, action),
        onBatchControl: (state: 'on' | 'off'): void => { void this.batchControl(state); },
        onToggleFullscreen: (): void => { void this.toggleFullscreenView(); },
        onToggleSidebar: (): void => { this._sidebarHidden = !this._sidebarHidden; },
        onWelcomeClick: (): void => this._handleWelcomeClick(),
        onMoreInfo: (entityId: string): void => moreInfo(this, entityId),
        onTurnOffAreaType: (entityIds: string[]): void => turnOffAreaTypeAction(this._hass, entityIds),
        onRoomSelect: (room: string): void => { this._filterRoom = room; this._deviceGrouping = 'domain'; this._view = 'devices'; },
        onOpenSearch: (): void => { this._searchOpen = true; },
        onCloseSearch: (): void => { this._searchOpen = false; this._searchQuery = ''; this._searchFilter = 'all'; },
        setDeviceGrouping: (g: 'area' | 'domain'): void => { this._deviceGrouping = g; },
        setFilterRoom: (room: string): void => { this._filterRoom = room; },
        setFilterType: (filterType: string): void => { this._filterType = filterType; },
        setHideUnassigned: (hide: boolean): void => { this._hideUnassigned = hide; },
        setSelectedFloor: (floor: string): void => { this._selectedFloor = floor; },
      });
    }
    return this._fns;
  }

  private _buildContext(language: Language, translate: (key: TranslationKey) => string): RenderContext {
    const hass = this._hass!;
    const resolvedTheme = this._resolveTheme();
    setDarkAssetSkin(resolvedTheme === 'dark' ? selectedSkin(this._config) : null);
    return {
      ...this._ctxFns(),
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
      sidebarHidden: this._sidebarHidden,
      searchOpen: this._searchOpen,
      resolvedTheme,
    };
  }

  // ─── Main render ────────────────────────────────────────

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    if (!this._hass) {
      // No hass yet: 'auto' has nothing to resolve against, so it falls back
      // to the default language inside normalizeLanguage.
      const lang = normalizeLanguage(this._config.language === 'auto' ? undefined : this._config.language);
      return html`
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
        <ha-card><div class="loading-state">${t(lang, 'loading')}</div></ha-card>
      `;
    }

    const language = normalizeLanguage(
      this._config.language === 'auto' ? this._hass.language : this._config.language,
    );
    const translate = getTranslate(language);
    const ctx = this._buildContext(language, translate);

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
      default: stage = renderHomeView(ctx, quote, energyValue, energyUnit, compareValue);
    }

    return html`
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
      <style>
        .sp-store-fab{position:fixed;bottom:12px;right:12px;z-index:998;width:36px;height:36px;border-radius:50%;border:1px solid var(--sp-border-device,var(--sp-border-glass,rgba(0,0,0,0.12)));background:var(--sp-card-bg,var(--ha-card-background,#fff));box-shadow:0 1px 3px rgba(0,0,0,0.15);cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0.5;transition:opacity 0.2s}.sp-store-fab:hover{opacity:1}.store-tags{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px}.store-tag{padding:1px 5px;border-radius:3px;background:var(--sp-badge-bg,rgba(0,0,0,0.08));font-size:var(--sp-font-4xs,9px);color:var(--sp-text-muted,#888)}.store-update-badge{display:inline-block;margin-left:4px;padding:0 4px;border-radius:3px;background:var(--sp-warning,#f90);color:#fff;font-size:var(--sp-font-4xs,9px);font-weight:700;vertical-align:middle}${STORE_CSS}
${STRUCTURE_CSS}
      </style>
      <ha-card>
        ${registriesLoading}
        <div class="mc-app" data-view=${this._view} data-sidebar=${this._sidebarHidden ? 'hidden' : 'visible'}>
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
        ${this._isFullscreen
          ? html`
            <button class="sp-store-fab" @click=${() => void this._openStore()} title="${translate('editorSkinStore')}" aria-label="${translate('editorSkinStore')}">
              <ha-icon icon="mdi:palette-swatch" style="--mdc-icon-size:18px"></ha-icon>
            </button>
          `
          : nothing}
        ${this._storeOpen ? html`<div id="store-container"></div>` : nothing}
      </ha-card>
    `;
  }

  private _openStore(): void {
    this._storeOpen = true;
    this._storeState = { ...this._storeState, open: true, loading: true, error: '', searchQuery: '', hasMore: true, displayedCount: STORE_PAGE_SIZE };
    void this._loadStore();
  }

  private async _loadStore(): Promise<void> {
    try {
      const merged = await loadStoreThemes(this._config?.downloaded_skins || []);
      const hasMore = merged.length > STORE_PAGE_SIZE;
      this._storeState = { ...this._storeState, loading: false, error: '', themes: merged, searchQuery: '', hasMore, displayedCount: STORE_PAGE_SIZE };
    } catch (err) {
      this._storeState = { ...this._storeState, loading: false, error: String(err), displayedCount: STORE_PAGE_SIZE, hasMore: false };
    }
    this._renderStoreBody();
  }

  private _handleStoreConfigChanged = (e: CustomEvent): void => {
    if (!e.detail?.config) return;
    this._config = e.detail.config as DashboardConfig;
    this.requestUpdate();
  };

  private _createStoreHost(): EditorHost {
    return {
      el: this,
      root: this.shadowRoot!,
      state: {
        config: this._config as any,
        hass: this._hass,
        language: this._getLanguage(),
        navDialogOpen: false,
        skinStore: this._storeState,
      },
      onChange: (next) => {
        if (next.skinStore) {
          this._storeState = next.skinStore;
          if (!next.skinStore.open) this._storeOpen = false;
        }
        if (next.config) this._config = next.config as any;
      },
      reload: () => this._renderStoreBody(),
      renderSkinStoreOnly: () => this._renderStoreBody(),
    };
  }

  private renderRegistryLoading(language: Language): TemplateResult | typeof nothing {
    if (!this._hass) return nothing;
    const allLoaded = this._reg.areas.loaded && this._reg.entities.loaded && this._reg.devices.loaded;
    if (allLoaded) return nothing;
    return html`<div class="loading-state loading-registry">${t(language, 'loadingRegistry')}</div>`;
  }

  // ─── Lifecycle ──────────────────────────────────────────

  protected updated(): void {
    // applyThemeVariables writes several CSS custom properties derived from
    // resource_pack (skin, base_path, assets overrides, theme vars) plus the
    // background image — skip it unless any of those actually changed.
    const resolvedTheme = this._resolveTheme();
    const themeKey = `${this._config !== undefined ? selectedSkin(this._config) : ''}|${resolvedTheme}|${JSON.stringify(this._config?.resource_pack ?? {})}|${this._config?.background_image ?? ''}`;
    if (themeKey !== this._lastThemeApplied) {
      this._lastThemeApplied = themeKey;
      applyThemeVariables(this._host(), this._config);
    }
    // Warm the `-dark` asset cache while still in light mode (no-op afterwards;
    // preloadDarkAssets itself dedupes and checks skinSupportsDark).
    if (this._config && resolvedTheme === 'light') {
      preloadDarkAssets(this._config);
    }
    this._applyLayout();
    this._applyThemeAttribute();
    this._applyResponsiveAttributes();
    if (!this._hass?.user?.is_admin) {
      this._lockKiosk();
    }
    // Auto-fullscreen (config.fullscreen, or demo mode for non-admin users).
    // The Fullscreen API requires a transient user gesture, so unlike the old
    // shadow-DOM kiosk we cannot force it on load: try immediately (fails
    // silently without a gesture) and retry on the first card interaction.
    const hass = this._hass;
    if (!this._autoFullscreenDone && hass) {
      const wants = this._config?.fullscreen === true || hass.user?.is_admin !== true;
      if (wants) {
        this._autoFullscreenDone = true;
        void this.toggleFullscreenView();
        this._armAutoFullscreen();
      }
    }
    if (this._searchOpen || this._storeOpen) {
      if (!this._escapeHandler) {
        this._escapeHandler = (e: KeyboardEvent): void => {
          if (e.key !== 'Escape') return;
          if (this._storeOpen) {
            this._storeOpen = false;
            this._storeState = { ...this._storeState, open: false };
          } else if (this._searchOpen) {
            this._searchOpen = false;
            this._searchQuery = '';
            this._searchFilter = 'all';
          }
        };
        document.addEventListener('keydown', this._escapeHandler);
      }
    } else if (this._escapeHandler) {
      document.removeEventListener('keydown', this._escapeHandler);
      this._escapeHandler = undefined;
    }
    this._renderStoreBody();
  }

  // Reflect the card's live viewport state on .mc-app as data attributes.
  // The structural stylesheet and skins can key off these with attribute
  // selectors — they track the CARD's real box (width bucket cached from the
  // ResizeObserver), unlike window media queries which are wrong when a wide
  // window hosts a narrow column. Cheap: setAttribute is skipped on no-change.
  private _applyResponsiveAttributes(): void {
    const app = this.shadowRoot?.querySelector('.mc-app');
    if (!app) return;
    const w = this._lastWidth;
    const size = w > 0 && w <= 480 ? 'sm' : w <= 1180 ? 'md' : 'lg';
    const orient = isPortrait() ? 'portrait' : 'landscape';
    const short = isShortLandscape() ? 'true' : 'false';
    const zoom = this._zoomBucket();
    const el = app as HTMLElement;
    if (el.getAttribute('data-sp-size') !== size) el.setAttribute('data-sp-size', size);
    if (el.getAttribute('data-sp-orient') !== orient) el.setAttribute('data-sp-orient', orient);
    if (el.getAttribute('data-sp-short') !== short) el.setAttribute('data-sp-short', short);
    if (el.getAttribute('data-sp-zoom') !== zoom) el.setAttribute('data-sp-zoom', zoom);
  }

  private _renderStoreBody(): void {
    const container = this.shadowRoot?.getElementById('store-container');
    if (!container) return;
    const store = this._storeState;
    // hass-only updates must not rebuild the store DOM: store objects are
    // replaced wholesale on every store state change, so identity is a valid
    // key — but config changes (remove/download skin, downloaded_skins) must
    // re-render, so the config reference is part of the key too.
    if (this._lastRenderedStore === store && this._lastRenderedConfig === this._config) return;
    this._lastRenderedStore = store;
    this._lastRenderedConfig = this._config;
    if (!store.open) { container.innerHTML = ''; return; }
    const oldGrid = container.querySelector('.store-grid');
    const savedScroll = oldGrid ? oldGrid.scrollTop : 0;
    container.innerHTML = renderSkinStore(store, this._config as any, this._getLanguage());
    const newGrid = container.querySelector('.store-grid');
    if (newGrid && savedScroll > 0) newGrid.scrollTop = savedScroll;
    bindSkinStoreActions(this.shadowRoot!, this._createStoreHost());
  }

  private _getLanguage(): Language {
    const lang = this._config?.language === 'auto' ? this._hass?.language : this._config?.language;
    return normalizeLanguage(lang || 'en');
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

  private async toggleFullscreenView(): Promise<void> {
    await enterFullscreen(this._host() ?? this);
    this._isFullscreen = isFullscreen();
    // Viewport geometry changed with the transition; re-measure.
    this._applyLayout();
  }

  // Browsers reject requestFullscreen without a transient user gesture, so
  // auto-fullscreen is re-armed on the first tap anywhere on the card.
  private _autoFullscreenHandler?: () => void;

  private _armAutoFullscreen(): void {
    if (this._autoFullscreenHandler || this._isFullscreen) return;
    this._autoFullscreenHandler = (): void => {
      this._autoFullscreenHandler = undefined;
      if (!isFullscreen()) void this.toggleFullscreenView();
    };
    this.addEventListener('pointerdown', this._autoFullscreenHandler, { once: true });
  }

  private readonly _handleFullscreenChange = (): void => {
    const next = isFullscreen();
    if (next !== this._isFullscreen) {
      this._isFullscreen = next;
      this.requestUpdate();
    }
    this._applyLayout();
  };

  // Demo-mode guard for non-admin users: block context menu and the common
  // DevTools shortcuts. This is convenience-only (a determined user can always
  // open DevTools via the browser menu), so register once and always clean up.
  private _kioskLocked = false;
  private readonly _kioskContextMenu = (e: Event): void => { e.preventDefault(); };
  private readonly _kioskKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key))) {
      e.preventDefault();
    }
  };

  private _lockKiosk(): void {
    if (this._kioskLocked) return;
    this._kioskLocked = true;
    document.addEventListener('contextmenu', this._kioskContextMenu);
    document.addEventListener('keydown', this._kioskKeyDown);
  }

  private _unlockKiosk(): void {
    if (!this._kioskLocked) return;
    this._kioskLocked = false;
    document.removeEventListener('contextmenu', this._kioskContextMenu);
    document.removeEventListener('keydown', this._kioskKeyDown);
  }

  private async batchControl(state: 'on' | 'off'): Promise<void> {
    // Resolved internally (not via the cached ctx handler) so handlers stay
    // shareable across renders.
    const translate = getTranslate(this._getLanguage());
    const devices = getRealDevicesForRender(this._hass, this._deviceRegistry, this._entityRegistry, this._areas, {
      filterRoom: this._filterRoom,
      filterType: this._filterType,
      hideUnassigned: this._hideUnassigned,
    });
    const controllable = devices.filter((d) => CONTROLLABLE_DOMAINS.has(d.detail));
    if (controllable.length === 0) return;
    if (!confirm(translate('confirmAction'))) return;
    await Promise.all(controllable.map((d) => this._hass?.callService(d.detail, state === 'on' ? turnOnService(d.detail) : turnOffService(d.detail), { entity_id: d.entityId })));
  }
}
