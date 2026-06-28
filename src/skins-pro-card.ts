import { LitElement, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import type { PropertyValues, TemplateResult } from 'lit';

type HassEntity = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
};

type HomeAssistant = {
  language?: string;
  states: Record<string, HassEntity | undefined>;
  callService: (domain: string, service: string, data?: Record<string, any>) => Promise<unknown>;
  callApi?: (method: string, path: string, body?: unknown) => Promise<unknown>;
  connection?: {
    sendMessagePromise: <T>(message: Record<string, any>) => Promise<T>;
  };
  auth?: { data?: { access_token?: string } };
};

type AreaRegistryEntry = {
  area_id: string;
  name: string;
  picture?: string | null;
};

type EntityRegistryEntry = {
  entity_id: string;
  area_id?: string | null;
  device_id?: string | null;
  hidden_by?: string | null;
  disabled_by?: string | null;
};

type DeviceRegistryEntry = {
  id: string;
  area_id?: string | null;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  disabled_by?: string | null;
};

type NavItemConfig = {
  key?: string;
  label?: string;
  label_zh?: string;
  label_en?: string;
  icon?: string;
  target?: string;
};

type DeviceConfig = {
  entity: string;
  name?: string;
  name_zh?: string;
  name_en?: string;
  area?: string;
  area_zh?: string;
  area_en?: string;
  image?: string;
  icon?: string;
  color?: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown';
  temperature_entity?: string;
};

type RoomConfig = {
  name?: string;
  name_zh?: string;
  name_en?: string;
  image?: string;
  target?: string;
  info_entity?: string;
};

type SceneConfig = {
  entity: string;
  icon?: string;
  tone?: 'morning' | 'night' | 'movie' | 'game';
  name?: string;
  name_zh?: string;
  name_en?: string;
  subtitle?: string;
  subtitle_zh?: string;
  subtitle_en?: string;
  confirm?: boolean;
};

type EnvironmentMetricConfig = {
  entity: string;
  icon?: string;
  unit?: string;
  variant?: 'temp' | 'hum' | 'pm';
  label?: string;
  label_zh?: string;
  label_en?: string;
};

type ResourcePackConfig = {
  base_path?: string;
  skin?: string;
  assets?: Record<string, string>;
  theme?: Record<string, string>;
};

type DashboardConfig = {
  type: string;
  language?: 'zh-CN' | 'en' | 'auto';
  title?: string;
  title_zh?: string;
  title_en?: string;
  subtitle?: string;
  subtitle_zh?: string;
  subtitle_en?: string;
  profile_name?: string;
  profile_name_zh?: string;
  profile_name_en?: string;
  profile_subtitle?: string;
  profile_subtitle_zh?: string;
  profile_subtitle_en?: string;
  resource_pack?: ResourcePackConfig;
  weather?: {
    entity?: string;
    temperature_entity?: string;
  };
  info?: {
    entity?: string;
  };
  fullscreen?: boolean;
  use_area_pictures?: boolean;
  environment?: EnvironmentMetricConfig[];
  devices?: DeviceConfig[];
  rooms?: RoomConfig[];
  scenes?: SceneConfig[];
  nav?: NavItemConfig[];
  energy?: {
    entity?: string;
    unit?: string;
    compare_text?: string;
    compare_text_zh?: string;
    compare_text_en?: string;
  };
  home_limits?: {
    devices?: number;
    rooms?: number;
    scenes?: number;
    environment?: number;
  };
  home_selection?: {
    devices?: string[];
    rooms?: string[];
    scenes?: string[];
    environment?: string[];
    weather_entity?: string;
    weather_temperature_entity?: string;
    energy_entity?: string;
  };
};

type TranslationKey =
  | 'home'
  | 'devices'
  | 'scenes'
  | 'automations'
  | 'rooms'
  | 'security'
  | 'energy'
  | 'environment'
  | 'quickControl'
  | 'roomSnapshots'
  | 'modes'
  | 'todayEnergy'
  | 'maintenance'
  | 'compareYesterday'
  | 'loadingQuote'
  | 'offline'
  | 'noDevices'
  | 'noScenes'
  | 'noAutomations'
  | 'byArea'
  | 'byType'
  | 'securityOverview'
  | 'on'
  | 'off'
  | 'open'
  | 'closed'
  | 'confirmScene';

const DEFAULT_ASSETS: Record<string, string> = {
  base: 'base-texture.jpg',
  stage: 'stage-background.jpg',
  theme_css: 'theme.css',
  avatar: 'avatar.jpg',
  decor: 'decoration.jpg',
  light: 'icon-light.jpg',
  switch: 'icon-switch.jpg',
  button: 'icon-button.jpg',
  climate: 'icon-ac.jpg',
  water_heater: 'icon-water_heater.jpg',
  humidifier: 'icon-humidifier.jpg',
  fan: 'icon-fan.jpg',
  speaker: 'icon-speaker.jpg',
  remote: 'icon-remote.jpg',
  lock: 'icon-lock.jpg',
  camera: 'icon-camera.jpg',
  garden: 'icon-garden-light.jpg',
  room_living: 'room-living.jpg',
  room_bedroom: 'room-bedroom.jpg',
  room_kitchen: 'room-kitchen.jpg',
  room_garden: 'room-garden.jpg',
};

const STRINGS: Record<'zh-CN' | 'en', Record<TranslationKey, string>> = {
  'zh-CN': {
    home: '首页',
    devices: '设备',
    scenes: '场景',
    automations: '自动化',
    rooms: '房间',
    security: '安全',
    energy: '能源',
    environment: '环境信息',
    quickControl: '快捷控制',
    roomSnapshots: '视窗快照',
    modes: '模式',
    todayEnergy: '今日用电',
    maintenance: '维护信息',
    compareYesterday: '较昨日',
    loadingQuote: '加载中',
    offline: '离线',
    noDevices: '暂无设备',
    noScenes: '暂无场景',
    noAutomations: '暂无自动化',
    byArea: '按房间',
    byType: '按类型',
    securityOverview: '摄像头、门锁与布撤防',
    on: '开启',
    off: '关闭',
    open: '打开',
    closed: '关闭',
    confirmScene: '确认执行场景：{name}？',
  },
  en: {
    home: 'Home',
    devices: 'Devices',
    scenes: 'Scenes',
    automations: 'Automations',
    rooms: 'Rooms',
    security: 'Security',
    energy: 'Energy',
    environment: 'Environment',
    quickControl: 'Quick control',
    roomSnapshots: 'Snapshots',
    modes: 'Modes',
    todayEnergy: 'Energy Today',
    maintenance: 'Maintenance',
    compareYesterday: 'vs yesterday',
    loadingQuote: 'Loading',
    offline: 'Offline',
    noDevices: 'No devices',
    noScenes: 'No scenes',
    noAutomations: 'No automations',
    byArea: 'By area',
    byType: 'By type',
    securityOverview: 'Cameras, locks and arming status',
    on: 'On',
    off: 'Off',
    open: 'Open',
    closed: 'Closed',
    confirmScene: 'Run scene: {name}?',
  },
};

const DEFAULT_NAV: NavItemConfig[] = [
  { key: 'home', icon: 'mdi:home' },
  { key: 'devices', icon: 'mdi:devices' },
  { key: 'scenes', icon: 'mdi:palette-swatch' },
  { key: 'automations', icon: 'mdi:robot' },
  { key: 'rooms', icon: 'mdi:door' },
  { key: 'security', icon: 'mdi:shield-home' },
  { key: 'energy', icon: 'mdi:lightning-bolt' },
];

const DEFAULT_DEVICES: DeviceConfig[] = [
  { entity: 'light.living_room_lights', image: 'light', color: 'yellow' },
  { entity: 'climate.living_room_ac', image: 'climate', color: 'blue', temperature_entity: 'sensor.living_room_temperature' },
  { entity: 'media_player.living_room_speaker', image: 'speaker', color: 'purple' },
  { entity: 'lock.front_door', image: 'lock', color: 'red' },
  { entity: 'light.garden_light_strip', image: 'garden', color: 'green' },
];

const DEFAULT_ROOMS: RoomConfig[] = [
  { image: 'room_living', info_entity: 'sensor.living_room_summary' },
  { image: 'room_bedroom', info_entity: 'sensor.bedroom_summary' },
  { image: 'room_kitchen', info_entity: 'sensor.kitchen_summary' },
  { image: 'room_garden', info_entity: 'sensor.garden_summary' },
];

const DEFAULT_SCENES: SceneConfig[] = [
  { entity: 'scene.home_mode', tone: 'morning', icon: 'mdi:home-import-outline', confirm: true },
  { entity: 'scene.good_night', tone: 'night', icon: 'mdi:weather-night', confirm: true },
  { entity: 'scene.welcome_home', tone: 'movie', icon: 'mdi:home-heart', confirm: true },
  { entity: 'scene.away_mode', tone: 'game', icon: 'mdi:exit-run', confirm: true },
];

const DEFAULT_ENVIRONMENT: EnvironmentMetricConfig[] = [
  { entity: 'sensor.living_room_temperature', icon: 'mdi:thermometer', unit: '°C', variant: 'temp' },
  { entity: 'sensor.living_room_humidity', icon: 'mdi:water-percent', unit: '%', variant: 'hum' },
  { entity: 'sensor.pm25', icon: 'mdi:leaf', unit: '', variant: 'pm' },
];

const DEFAULT_CONFIG: DashboardConfig = {
  type: 'custom:skins-pro-card',
  language: 'auto',
  resource_pack: {
    skin: 'modern',
    base_path: '__AUTO__',
    assets: DEFAULT_ASSETS,
  },
  weather: {
    entity: 'weather.home',
    temperature_entity: 'sensor.outdoor_temperature',
  },
  info: {
    entity: 'input_text.daily_quote',
  },
  fullscreen: false,
  use_area_pictures: false,
  devices: DEFAULT_DEVICES,
  rooms: DEFAULT_ROOMS,
  scenes: DEFAULT_SCENES,
  environment: DEFAULT_ENVIRONMENT,
  nav: DEFAULT_NAV,
  energy: {
    entity: 'sensor.energy_cost_today',
    unit: 'kWh',
    compare_text_zh: '较昨日',
    compare_text_en: 'vs yesterday',
  },
  home_limits: {
    devices: 5,
    rooms: 4,
    scenes: 6,
    environment: 5,
  },
  home_selection: {
    devices: [],
    rooms: [],
    scenes: [],
    environment: [],
  },
};

import { SKINS, DEFAULT_SKIN, SKIN_STRINGS, SKIN_ICON_MAPS } from './skins.generated';
import './skins-pro-card-editor';

const BUNDLED_SKINS: readonly string[] = SKINS;


const normalizeLanguage = (language?: string): 'zh-CN' | 'en' => {
  if ((language || '').toLowerCase().startsWith('zh')) {
    return 'zh-CN';
  }

  return 'en';
};

const defaultResourceBasePath = (): string => {
  try {
    return new URL(DEFAULT_SKIN, import.meta.url).toString();
  } catch (_error) {
    return `/local/community/skins-pro/${DEFAULT_SKIN}`;
  }
};

const bundledAssetsRootPath = (): string => defaultResourceBasePath().replace(/\/[^/]+\/?$/, '');

const bundledSkinBasePath = (skin: string): string => `${bundledAssetsRootPath().replace(/\/$/, '')}/${skin}`;

const mergeConfig = (config: DashboardConfig): DashboardConfig => ({
  ...DEFAULT_CONFIG,
  ...config,
  resource_pack: {
    ...DEFAULT_CONFIG.resource_pack,
    ...config.resource_pack,
    assets: {
      ...DEFAULT_CONFIG.resource_pack?.assets,
      ...config.resource_pack?.assets,
    },
    theme: {
      ...DEFAULT_CONFIG.resource_pack?.theme,
      ...config.resource_pack?.theme,
    },
  },
  weather: {
    ...DEFAULT_CONFIG.weather,
    ...config.weather,
  },
  info: {
    ...DEFAULT_CONFIG.info,
    ...config.info,
  },
  energy: {
    ...DEFAULT_CONFIG.energy,
    ...config.energy,
  },
  home_limits: {
    ...DEFAULT_CONFIG.home_limits,
    ...config.home_limits,
  },
  home_selection: {
    ...DEFAULT_CONFIG.home_selection,
    ...config.home_selection,
  },
  devices: config.devices && config.devices.length > 0 ? config.devices : DEFAULT_CONFIG.devices,
  rooms: config.rooms && config.rooms.length > 0 ? config.rooms : DEFAULT_CONFIG.rooms,
  scenes: config.scenes && config.scenes.length > 0 ? config.scenes : DEFAULT_CONFIG.scenes,
  environment: config.environment && config.environment.length > 0 ? config.environment : DEFAULT_CONFIG.environment,
  nav: config.nav && config.nav.length > 0
    ? [...config.nav, ...(DEFAULT_CONFIG.nav || []).filter((defaultItem) => !config.nav?.some((item) => (item.key || item.target) === (defaultItem.key || defaultItem.target)))]
    : DEFAULT_CONFIG.nav,
});

const findEntity = (states: Record<string, HassEntity | undefined>, candidates: string[]): string | undefined => {
  const ids = Object.keys(states);

  for (const candidate of candidates) {
    const exact = ids.find((id) => id === candidate);
    if (exact) {
      return exact;
    }
  }

  for (const candidate of candidates) {
    const lowerCandidate = candidate.toLowerCase();
    const partial = ids.find((id) => id.toLowerCase().includes(lowerCandidate));
    if (partial) {
      return partial;
    }
  }

  return undefined;
};

const findEntities = (states: Record<string, HassEntity | undefined>, domain: string, keywords: string[], limit: number): string[] => {
  const ids = Object.keys(states).filter((id) => id.startsWith(`${domain}.`));
  const scored = ids.map((id) => {
    const lower = id.toLowerCase();
    const score = keywords.reduce((total, keyword) => total + (lower.includes(keyword) ? 1 : 0), 0);
    return { id, score };
  }).filter((entry) => entry.score > 0);

  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((entry) => entry.id);
};

export const buildAutoConfig = (hass: HomeAssistant): DashboardConfig => {
  const states = hass.states || {};
  const defaultDevice0 = DEFAULT_DEVICES[0] as DeviceConfig;
  const defaultDevice1 = DEFAULT_DEVICES[1] as DeviceConfig;
  const defaultDevice2 = DEFAULT_DEVICES[2] as DeviceConfig;
  const defaultDevice3 = DEFAULT_DEVICES[3] as DeviceConfig;
  const defaultDevice4 = DEFAULT_DEVICES[4] as DeviceConfig;
  const defaultEnv0 = DEFAULT_ENVIRONMENT[0] as EnvironmentMetricConfig;
  const defaultEnv1 = DEFAULT_ENVIRONMENT[1] as EnvironmentMetricConfig;
  const defaultEnv2 = DEFAULT_ENVIRONMENT[2] as EnvironmentMetricConfig;

  const weatherEntity = findEntity(states, ['weather.home', 'weather.forecast_home', 'weather.']);
  const outdoorTemp = findEntity(states, ['sensor.outdoor_temperature', 'sensor.outside_temperature', 'sensor.weather_temperature']);
  const quoteEntity = findEntity(states, ['input_text.daily_quote', 'sensor.daily_quote', 'sensor.hitokoto']);
  const energyEntity = findEntity(states, ['sensor.energy_cost_today', 'sensor.energy_today', 'sensor.daily_energy']);

  const livingTemp = findEntity(states, ['sensor.living_room_temperature', 'sensor.living_temperature', 'sensor.temperature_living']);
  const livingHumidity = findEntity(states, ['sensor.living_room_humidity', 'sensor.living_humidity', 'sensor.humidity_living']);
  const pm25 = findEntity(states, ['sensor.pm25', 'sensor.pm2_5', 'sensor.air_pm25']);

  const lightEntities = findEntities(states, 'light', ['living', 'garden', 'bedroom', 'kitchen'], 2);
  const climateEntity = findEntity(states, ['climate.living_room_ac', 'climate.living_room', 'climate.ac']);
  const mediaEntity = findEntity(states, ['media_player.living_room_speaker', 'media_player.speaker', 'media_player.living']);
  const lockEntity = findEntity(states, ['lock.front_door', 'lock.door']);
  const gardenLight = findEntity(states, ['light.garden_light_strip', 'light.garden', 'light.outdoor']);

  const sceneEntities = findEntities(states, 'scene', ['home', 'night', 'welcome', 'away', 'movie'], 4);
  const mappedScenes = DEFAULT_SCENES.map((scene, index) => ({
    ...scene,
    entity: sceneEntities[index] || scene.entity,
  }));

  return mergeConfig({
    type: 'custom:skins-pro-card',
    weather: {
      entity: weatherEntity || DEFAULT_CONFIG.weather?.entity,
      temperature_entity: outdoorTemp || DEFAULT_CONFIG.weather?.temperature_entity,
    },
    info: {
      entity: quoteEntity || DEFAULT_CONFIG.info?.entity,
    },
    energy: {
      ...DEFAULT_CONFIG.energy,
      entity: energyEntity || DEFAULT_CONFIG.energy?.entity,
    },
    devices: [
      { ...defaultDevice0, entity: lightEntities[0] || defaultDevice0.entity, temperature_entity: livingTemp || defaultDevice0.temperature_entity },
      { ...defaultDevice1, entity: climateEntity || defaultDevice1.entity, temperature_entity: livingTemp || defaultDevice1.temperature_entity },
      { ...defaultDevice2, entity: mediaEntity || defaultDevice2.entity },
      { ...defaultDevice3, entity: lockEntity || defaultDevice3.entity },
      { ...defaultDevice4, entity: gardenLight || lightEntities[1] || defaultDevice4.entity },
    ],
    rooms: [
      { image: 'room_living', info_entity: findEntity(states, ['sensor.living_room_summary', 'sensor.living_summary']) },
      { image: 'room_bedroom', info_entity: findEntity(states, ['sensor.bedroom_summary', 'sensor.bed_summary']) },
      { image: 'room_kitchen', info_entity: findEntity(states, ['sensor.kitchen_summary']) },
      { image: 'room_garden', info_entity: findEntity(states, ['sensor.garden_summary']) },
    ],
    scenes: mappedScenes,
    environment: [
      { ...defaultEnv0, entity: livingTemp || defaultEnv0.entity },
      { ...defaultEnv1, entity: livingHumidity || defaultEnv1.entity },
      { ...defaultEnv2, entity: pm25 || defaultEnv2.entity },
    ],
  });
};

export class MinecraftDashboardCard extends LitElement {
  private _config?: DashboardConfig;
  private _hass?: HomeAssistant;
  @state() private _view: 'home' | 'devices' | 'rooms' | 'scenes' | 'automations' | 'security' | 'energy' = 'home';
  @state() private _deviceGrouping: 'area' | 'domain' = 'area';
  @state() private _areas?: AreaRegistryEntry[];
  @state() private _entityRegistry?: EntityRegistryEntry[];
  @state() private _deviceRegistry?: DeviceRegistryEntry[];
  private _areasRequest?: Promise<void>;
  private _entityRegistryRequest?: Promise<void>;
  private _deviceRegistryRequest?: Promise<void>;
  @state() private _energyHistory?: number[];
  @state() private _energyYesterday?: string;
  private _energyHistoryEntity?: string;
  private _energyHistoryRequest?: Promise<void>;
  private _autoFullscreenDone = false;
  private readonly _handleWindowResize = () => this.applyLayoutHeight();

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
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._handleWindowResize);
  }

  public setConfig(config: DashboardConfig): void {
    if (!config || config.type !== 'custom:skins-pro-card') {
      throw new Error('Card type must be custom:skins-pro-card');
    }

    this._config = mergeConfig(config);
    this._energyHistory = undefined;
    this._energyYesterday = undefined;
    this._energyHistoryEntity = undefined;
    this.requestUpdate();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('hass') && this._hass) {
      void this.loadAreas();
      void this.loadEntityRegistry();
      void this.loadDeviceRegistry();
      void this.loadEnergyHistory();
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

  private skinString(key: string): string {
    const skin = this.selectedSkin();
    return SKIN_STRINGS[skin]?.[key] || SKIN_STRINGS[DEFAULT_SKIN]?.[key] || '';
  }

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    if (!this._hass) {
      return html`
        <link rel="stylesheet" href="${this.assetHref('theme_css')}">
        <ha-card><div class="loading-state">Loading...</div></ha-card>
      `;
    }

    const language = this._config.language === 'auto'
      ? normalizeLanguage(this._hass.language)
      : normalizeLanguage(this._config.language);
    const translate = (key: TranslationKey): string => STRINGS[language][key];
    const weatherState = this.stateValue(this._config.weather?.entity);
    const weatherIcon = this.weatherIcon(weatherState);
    const quote = this.stateValue(this._config.info?.entity) || translate('loadingQuote');
    const energyValue = this._config.energy?.entity ? this.formatNumber(this.stateValue(this._config.energy.entity), 1) : '--';
    const energyUnit = this._config.energy?.unit || 'kWh';
    const compareValue = this._energyYesterday || '';
    const energyBars = this.renderBars(this._energyHistory || []);
    return html`
      <link rel="stylesheet" href="${this.assetHref('theme_css')}">
      <ha-card>
        <div class="mc-app" data-view=${this._view}>
          <aside class="sidebar">
            <div class="profile">
              ${this.renderImage('avatar', 'Avatar', 'profile-img')}
              <div class="meta">
                <h2>${this._config.profile_name || this.localizedText(undefined, this._config.profile_name_zh || this.skinString('profile_name_zh'), this._config.profile_name_en || this.skinString('profile_name_en'), language)}</h2>
                <p class="muted">${this._config.profile_subtitle || this.localizedText(undefined, this._config.profile_subtitle_zh || this.skinString('profile_subtitle_zh'), this._config.profile_subtitle_en || this.skinString('profile_subtitle_en'), language)}</p>
              </div>
            </div>
            <nav class="menu">
              ${this.renderNav(language)}
            </nav>
            <div class="sidebar-art" @click=${() => this.toggleKiosk()}>${this.renderImage('decor', 'Decor', '')}</div>
          </aside>
          <main class="stage">
            ${this.renderStageContent(language, translate, weatherIcon, quote, energyValue, energyUnit, compareValue, energyBars)}
          </main>
        </div>
      </ha-card>
    `;
  }

  private renderStageContent(
    language: 'zh-CN' | 'en',
    translate: (key: TranslationKey) => string,
    weatherIcon: string,
    quote: string,
    energyValue: string,
    energyUnit: string,
    compareValue: string,
    energyBars: TemplateResult,
  ): TemplateResult {
    if (this._view === 'devices') {
      return this.renderDevicesPage(language, translate);
    }

    if (this._view === 'rooms') {
      return this.renderRoomsPage(language, translate);
    }

    if (this._view === 'scenes') {
      return this.renderScenesPage(language, translate);
    }

    if (this._view === 'automations') {
      return this.renderAutomationsPage(language, translate);
    }

    if (this._view === 'security') {
      return this.renderSecurityPage(language, translate);
    }

    if (this._view === 'energy') {
      return this.renderEnergyPage(language, translate, energyValue, energyUnit, compareValue, energyBars);
    }

    return html`
      <div class="stage-grid">
        <section class="welcome" data-section="home">
          <h1>${this._config?.title || this.localizedText(undefined, this._config?.title_zh || this.skinString('title_zh'), this._config?.title_en || this.skinString('title_en'), language)}</h1>
          <p class="quote">${quote}</p>
          <div class="weather-row" @click=${() => this.moreInfo(this._config?.weather?.entity || '')}>
            <div class="weather-state-icon"><ha-icon icon="${weatherIcon}"></ha-icon></div>
            <div class="weather-text">${this.weatherDisplayText(this._config?.weather?.entity)} ${this.weatherTemperature(this._config?.weather?.entity)}</div>
          </div>
        </section>
        <section class="bottom-stack">
          <section class="bottom-block bottom-devices">
            <div class="section-title"><h2>${translate('devices')}</h2><p class="muted">${translate('quickControl')}</p></div>
            <div class="devices">${this.renderShortcutDevices(language)}</div>
          </section>
          <section class="bottom-block">
            <div class="section-title"><h2>${translate('rooms')}</h2><p class="muted">${translate('roomSnapshots')}</p></div>
            <div class="rooms">${this.renderRooms(language)}</div>
          </section>
        </section>
        <aside class="side">
          <section class="time-card">
            <div>
              <div class="time-main">${this.timeText(language)}</div>
              <div class="time-sub">${this.dateText(language)}</div>
            </div>
            <div class="time-icon"><ha-icon icon="mdi:clock-outline"></ha-icon></div>
          </section>
          <section class="glass-card">
            <div class="section-title"><h2>${translate('environment')}</h2></div>
            <div class="env-list">${this.renderEnvironment(language)}</div>
          </section>
          <section class="glass-card panel-energy">
            <div class="section-title"><h2>${translate('todayEnergy')}</h2></div>
            <div class="energy-value">${energyValue}<small> ${energyUnit}</small></div>
            <div class="bars">${energyBars}</div>
            <div class="energy-footer"><span class="muted">${this.localizedText(this._config?.energy?.compare_text, this._config?.energy?.compare_text_zh, this._config?.energy?.compare_text_en, language, translate('compareYesterday'))}</span><span class="down">${compareValue || '--'}</span></div>
          </section>
          ${this.renderMaintenanceCard(language, translate)}
          <section class="glass-card panel-scenes" data-section="scenes">
            <div class="section-title"><h2>${translate('scenes')}</h2><p class="muted">${translate('modes')}</p></div>
            <div class="scene-grid">${this.renderHomeScenes(language, translate)}</div>
          </section>
        </aside>
      </div>
    `;
  }

  private applyLayoutHeight(): void {
    const host = this.shadowRoot?.host as HTMLElement | undefined;
    if (!host) {
      return;
    }

    if (window.innerWidth <= 760 || this._view === 'rooms') {
      host.style.setProperty('--sp-runtime-height', 'auto');
      host.style.setProperty('--sp-runtime-min-height', '100vh');
      return;
    }

    const rect = this.getBoundingClientRect();
    const paddingBottom = 0;
    const availableHeight = Math.max(560, Math.floor(window.innerHeight - rect.top - paddingBottom));
    host.style.setProperty('--sp-runtime-height', `${availableHeight}px`);
    host.style.setProperty('--sp-runtime-min-height', `${availableHeight}px`);
  }

  private applyThemeVariables(): void {
    const host = this.shadowRoot?.host as HTMLElement | undefined;
    if (!host) {
      return;
    }

    const theme = this._config?.resource_pack?.theme;
    if (theme) {
      Object.entries(theme).forEach(([key, value]) => {
        host.style.setProperty(key, value);
      });
    }
    host.style.setProperty('--sp-base-texture', `url("${this.assetUrl('base')}")`);
    host.style.setProperty('--sp-stage-texture', `url("${this.assetUrl('stage')}")`);
  }

  private localizedText(base: string | undefined, zh: string | undefined, en: string | undefined, language: 'zh-CN' | 'en', fallback = ''): string {
    if (language === 'zh-CN') {
      return zh || base || en || fallback;
    }

    return en || base || zh || fallback;
  }

  private stateValue(entityId?: string): string {
    if (!entityId || !this._hass) {
      return '';
    }

    return this._hass.states[entityId]?.state || '';
  }

  private formatNumber(value: string, decimals: number): string {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(decimals) : '--';
  }

  private timeText(language: 'zh-CN' | 'en'): string {
    return new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }

  private dateText(language: 'zh-CN' | 'en'): string {
    return new Intl.DateTimeFormat(language, { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).format(new Date());
  }

  private assetUrl(key: string): string {
    const configuredBasePath = this._config?.resource_pack?.base_path || '';
    const basePath = configuredBasePath === '__AUTO__' || !configuredBasePath
      ? bundledSkinBasePath(this.selectedSkin())
      : configuredBasePath;
    const asset = this._config?.resource_pack?.assets?.[key] || DEFAULT_ASSETS[key] || '';
    if (!asset) {
      return '';
    }

    if (/^https?:\/\//.test(asset) || asset.startsWith('/')) {
      return asset;
    }

    return `${basePath.replace(/\/$/, '')}/${asset}`;
  }

  private assetHref(key: string): string {
    const url = this.assetUrl(key);
    if (!url) {
      return '';
    }

    if (key !== 'theme_css') {
      return url;
    }

    const cacheKey = encodeURIComponent(`${this.selectedSkin()}|${this._config?.resource_pack?.base_path || '__AUTO__'}`);
    return `${url}${url.includes('?') ? '&' : '?'}skin=${cacheKey}`;
  }

  private selectedSkin(): string {
    const configuredSkin = this._config?.resource_pack?.skin;
    if (configuredSkin) {
      return configuredSkin;
    }

    const configuredBasePath = this._config?.resource_pack?.base_path || '';
    const matchedSkin = BUNDLED_SKINS.find((skin) => configuredBasePath === bundledSkinBasePath(skin) || configuredBasePath.endsWith(`/${skin}`));
    return matchedSkin || DEFAULT_SKIN;
  }

  private renderImage(key: string, alt: string, className?: string): TemplateResult | typeof nothing {
    const url = this.assetUrl(key);
    if (!url) {
      return nothing;
    }

    return html`<img class=${className || nothing} alt=${alt} src=${url}>`;
  }

  private renderNav(language: 'zh-CN' | 'en'): TemplateResult {
    return html`${(this._config?.nav || []).map((item, index) => {
      const label = this.localizedText(item.label, item.label_zh, item.label_en, language, STRINGS[language][(item.key as TranslationKey) || 'home'] || item.key || '');
      const target = item.target || item.key || 'home';
      const isActive = target === this._view || (index === 0 && this._view === 'home' && target === 'home');
      return html`
        <button class="nav-button${isActive ? ' active' : ''}" @click=${() => this.navigateTo(target)}>
          <ha-icon icon=${item.icon || 'mdi:circle'}></ha-icon><span>${label}</span>
        </button>
      `;
    })}`;
  }

  private renderPageShell(title: string, subtitle: string, controls: TemplateResult, body: TemplateResult): TemplateResult {
    return html`
      <div class="page-shell">
        <div class="page-header">
          <div>
            <h1>${title}</h1>
            <p class="quote">${subtitle}</p>
          </div>
          <div class="page-controls">${controls}</div>
        </div>
        <div class="page-body">${body}</div>
      </div>
    `;
  }

  private renderDevicesPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult {
    return this.renderPageShell(
      translate('devices'),
      translate('quickControl'),
      html`
        <div class="chip-group">
          <button class="chip${this._deviceGrouping === 'area' ? ' active' : ''}" @click=${() => { this._deviceGrouping = 'area'; }}>${translate('byArea')}</button>
          <button class="chip${this._deviceGrouping === 'domain' ? ' active' : ''}" @click=${() => { this._deviceGrouping = 'domain'; }}>${translate('byType')}</button>
        </div>
      `,
      html`
        <div class="page-scroll themed-scrollbar">
          ${this.renderRealDeviceGroups(language, translate)}
        </div>
      `
    );
  }

  private renderRoomsPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult {
    const roomsMarkup = this.renderAreaRooms(language, true, undefined, [], false);
    const roomCount = this._areas?.length || 0;
    const roomPageClass = roomCount > 8 ? 'rooms-page rooms-page-dense' : (roomCount > 4 ? 'rooms-page rooms-page-medium' : 'rooms-page');

    return this.renderPageShell(
      translate('rooms'),
      translate('roomSnapshots'),
      html``,
      html`
        <div class="rooms-page-wrap">
          ${roomsMarkup !== nothing
            ? html`<div class="rooms ${roomPageClass}">${roomsMarkup}</div>`
            : html`<div class="empty-state">${language === 'zh-CN' ? '没有读取到 Home Assistant 房间' : 'No Home Assistant areas found'}</div>`}
        </div>
      `
    );
  }

  private renderScenesPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult {
    const scenes = this.renderRealScenes(language, Number.MAX_SAFE_INTEGER);
    return this.renderPageShell(
      translate('scenes'),
      translate('modes'),
      html``,
      scenes !== nothing
        ? html`<div class="page-scroll themed-scrollbar"><div class="scene-grid scenes-page">${scenes}</div></div>`
        : html`<div class="empty-state">${translate('noScenes')}</div>`
    );
  }

  private renderAutomationsPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult {
    const automations = this.renderRealAutomations(language);
    return this.renderPageShell(
      translate('automations'),
      language === 'zh-CN' ? 'Home Assistant 自动化' : 'Home Assistant automations',
      html``,
      automations !== nothing
        ? html`<div class="page-scroll themed-scrollbar"><div class="devices devices-page-grid">${automations}</div></div>`
        : html`<div class="empty-state">${translate('noAutomations')}</div>`
    );
  }

  private renderEnergyPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string, energyValue: string, energyUnit: string, compareValue: string, energyBars: TemplateResult): TemplateResult {
    return this.renderPageShell(
      translate('energy'),
      translate('todayEnergy'),
      html``,
      html`
        <div class="page-body single-column">
          <section class="glass-card panel-energy page-energy-card compact-energy-card">
            <div class="section-title"><h2>${translate('todayEnergy')}</h2></div>
            <div class="env-list compact-energy-list">
              <div class="env-row"><div class="dot temp"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div><div class="muted">${translate('todayEnergy')}</div><div class="env-value">${energyValue} ${energyUnit}</div></div>
              <div class="env-row"><div class="dot hum"><ha-icon icon="mdi:compare-vertical"></ha-icon></div><div class="muted">${this.localizedText(this._config?.energy?.compare_text, this._config?.energy?.compare_text_zh, this._config?.energy?.compare_text_en, language, translate('compareYesterday'))}</div><div class="env-value">${compareValue || '--'}</div></div>
            </div>
            <div class="bars compact-energy-bars">${energyBars}</div>
          </section>
          ${this.renderMaintenanceCard(language, translate)}
        </div>
      `
    );
  }

  private renderSecurityPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult {
    const cards = this.renderSecurityCards(language);
    return this.renderPageShell(
      translate('security'),
      translate('securityOverview'),
      html``,
      cards !== nothing
        ? html`<div class="page-scroll themed-scrollbar"><div class="devices security-grid">${cards}</div></div>`
        : html`<div class="empty-state">${translate('offline')}</div>`
    );
  }

  private renderMaintenanceBlock(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult | typeof nothing {
    const items = this.getMaintenanceItems(language).slice(0, 5);
    if (items.length === 0) {
      return nothing;
    }

    return html`
      <div class="maintenance-block">
        <div class="section-title maintenance-title"><h2>${translate('maintenance')}</h2></div>
        <div class="maintenance-list">
          ${items.map((item) => html`
            <div class="maintenance-item">
              <span class="maintenance-dot ${item.level}"></span>
              <span class="maintenance-name">${item.name}</span>
              <span class="maintenance-value">${String(item.battery)}%</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private renderMaintenanceCard(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult | typeof nothing {
    const block = this.renderMaintenanceBlock(language, translate);
    if (block === nothing) {
      return nothing;
    }

    return html`
      <section class="glass-card maintenance-card">
        ${block}
      </section>
    `;
  }

  private getMaintenanceItems(_language: 'zh-CN' | 'en'): Array<{ name: string; battery: number; level: 'warning' | 'error' }> {
    if (!this._hass) {
      return [];
    }

    const NON_BATTERY_UNITS = new Set([
      'v', 'mv', 'kv', 'volt', 'volts',
      '°c', 'c', '°f', 'f', 'k',
      'a', 'ma', 'w', 'kw', 'wh', 'kwh',
      'db', 'dbm', 'lux', 'lx', 'ppm', 'µg/m³',
    ]);
    const NON_BATTERY_DEVICE_CLASSES = new Set([
      'voltage', 'temperature', 'current', 'power', 'energy', 'illuminance', 'humidity',
    ]);

    const isValidBatteryPercent = (value: number, unit: string, deviceClass: string): boolean => {
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return false;
      }
      if (NON_BATTERY_DEVICE_CLASSES.has(deviceClass)) {
        return false;
      }
      if (NON_BATTERY_UNITS.has(unit.toLowerCase().trim())) {
        return false;
      }
      return true;
    };

    const items: Array<{ name: string; battery: number; level: 'warning' | 'error' }> = [];
    const added = new Set<string>();

    Object.values(this._hass.states).forEach((entity) => {
      if (!entity || added.has(entity.entity_id)) {
        return;
      }

      const friendlyName = String(entity.attributes?.friendly_name || entity.entity_id);
      const deviceClass = String(entity.attributes?.device_class || '').toLowerCase();
      const unit = String(entity.attributes?.unit_of_measurement || '');

      let value: number | null = null;

      if (deviceClass === 'battery') {
        const v = Number(entity.state);
        if (isValidBatteryPercent(v, unit, deviceClass)) {
          value = v;
        }
      }

      if (value === null) {
        const attrBattery = Number(entity.attributes?.battery_level);
        if (Number.isFinite(attrBattery) && isValidBatteryPercent(attrBattery, '%', deviceClass)) {
          value = attrBattery;
        }
      }

      if (value === null && entity.entity_id.startsWith('sensor.') && /battery/i.test(entity.entity_id)) {
        if (!/voltage|_temp|temperature|_current|_power|signal|rf_link/i.test(entity.entity_id)) {
          const v = Number(entity.state);
          if (isValidBatteryPercent(v, unit, deviceClass)) {
            value = v;
          }
        }
      }

      if (value !== null && value > 0 && value <= 20) {
        added.add(entity.entity_id);
        items.push({
          name: friendlyName,
          battery: Math.round(value),
          level: value <= 10 ? 'error' : 'warning',
        });
      }
    });

    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.name}|${item.battery}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private renderShortcutDevices(language: 'zh-CN' | 'en'): TemplateResult[] {
    const limit = this._config?.home_limits?.devices || 5;
    const selectedEntities = this._config?.home_selection?.devices || [];
    const allRealDevices = this.getRealDevicesForRender();
    const realDevices = (selectedEntities.length > 0
      ? allRealDevices.filter((device) => selectedEntities.includes(device.entityId))
      : allRealDevices).slice(0, limit);

    return realDevices.map((device) => {
      const stateLabel = this.deviceStateLabel(device.state, language);
      const active = ['on', 'playing', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
      const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
      const assetKey = this.assetKeyForDomain(device.entityId.split('.')[0] || 'sensor');
      const domain = device.entityId.split('.')[0] || '';
      const action = (domain === 'light' || domain === 'switch') ? 'toggle' : 'more-info';
      return html`
        <button class="device ${statusClass}" @click=${() => this.handleAction(device.entityId, action)}>
          <div class="device-top">
            ${this.renderImage(assetKey, device.name, 'item-img')}
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
          <div class="control-row"><span class="state-word">${device.detail}</span><span class="switch${active ? ' on' : ''}"></span></div>
        </button>
      `;
    });
  }

  private assetKeyForDomain(domain: string): string {
    const map = SKIN_ICON_MAPS[this.selectedSkin()] || {};
    if (map[domain]) {
      return map[domain] as string;
    }

    const pool = ['light', 'switch', 'button', 'climate', 'water_heater', 'humidifier', 'fan', 'speaker', 'remote', 'lock', 'camera'];
    let hash = 0;
    for (let i = 0; i < domain.length; i += 1) {
      hash = ((hash << 5) - hash + domain.charCodeAt(i)) | 0;
    }
    return pool[Math.abs(hash) % pool.length] as string;
  }

  private weatherIcon(state: string): string {
    const iconMap: Record<string, string> = {
      sunny: 'mdi:weather-sunny',
      clear: 'mdi:weather-sunny',
      cloudy: 'mdi:weather-cloudy',
      partlycloudy: 'mdi:weather-partly-cloudy',
      rainy: 'mdi:weather-rainy',
      pouring: 'mdi:weather-pouring',
      snowy: 'mdi:weather-snowy',
      fog: 'mdi:weather-fog',
      windy: 'mdi:weather-windy',
      hail: 'mdi:weather-hail',
      lightning: 'mdi:weather-lightning',
    };

    return iconMap[state] || 'mdi:weather-partly-cloudy';
  }

  private renderHomeScenes(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult {
    const limit = this._config?.home_limits?.scenes || 6;
    const selectedScenes = this._config?.home_selection?.scenes || [];
    const scenes = this.renderRealScenes(language, limit, selectedScenes);
    if (scenes !== nothing) {
      return scenes;
    }

    return html`<div class="empty-state compact-empty">${translate('noScenes')}</div>`;
  }

  private renderRooms(language: 'zh-CN' | 'en'): TemplateResult | typeof nothing {
    const limit = this._view === 'home' ? (this._config?.home_limits?.rooms || 4) : undefined;
    const selectedRooms = this._view === 'home' ? (this._config?.home_selection?.rooms || []) : [];
    const areaRooms = this.renderAreaRooms(language, false, limit, selectedRooms);
    if (areaRooms !== nothing) {
      return areaRooms;
    }

    const rooms = this.getRoomsForRender();
    if (rooms.length === 0) return nothing;
    return html`${rooms.map((room) => {
      const imageKey = room.image || 'room_living';
      const info = room.info_entity ? this.stateValue(room.info_entity) : '';
      const fallbackInfo = this._areas?.length ? this.areaFallbackInfo(room, language) : '--';
      const displayName = room.name || '--';
      return html`
        <button class="room" @click=${() => room.target ? this.navigatePath(room.target!) : undefined}>
          ${this.renderImage(imageKey, displayName, '')}
          <div class="room-label">
            <h3>${displayName}</h3>
            <p class="muted">${info || fallbackInfo || '--'}</p>
          </div>
        </button>
      `;
    })}`;
  }

  private renderAreaRooms(language: 'zh-CN' | 'en', requireRealAreas: boolean, limit?: number, selectedRooms: string[] = [], showSummary = true): TemplateResult | typeof nothing {
    if (!this._areas || this._areas.length === 0) {
      return nothing;
    }

    const images = ['room_living', 'room_bedroom', 'room_kitchen', 'room_garden'];
    const filteredAreas = selectedRooms.length > 0
      ? selectedRooms
        .map((item) => {
          if (item.includes('.')) {
            const entry = this._entityRegistry?.find((e) => e.entity_id === item);
            if (entry?.area_id) return this._areas?.find((a) => a.area_id === entry.area_id);
            return undefined;
          }
          return this._areas?.find((a) => a.area_id === item) || this._areas?.find((a) => a.name === item);
        })
        .filter((area): area is AreaRegistryEntry => Boolean(area))
      : this._areas;
    const rooms = filteredAreas.slice(0, limit || filteredAreas.length).map((area, index) => ({
      name: area.name,
      image: images[index % images.length],
      picture: area.picture,
      summary: this.areaSummaryById(area.area_id, language),
      counts: this.areaCounts(area.area_id),
    }));

    if (requireRealAreas && rooms.length === 0) {
      return nothing;
    }

    const useAreaPics = this._config?.use_area_pictures;

    return html`${rooms.map((room) => {
      const imgSrc = useAreaPics && room.picture ? room.picture : this.assetUrl(room.image || 'room_living');
      const roomImg = imgSrc ? html`<img alt=${room.name} src=${imgSrc}>` : nothing;
      if (showSummary) {
        return html`
          <button class="room">
            ${roomImg}
            <div class="room-label">
              <h3>${room.name}</h3>
              <p class="muted">${room.summary}</p>
            </div>
          </button>
        `;
      }
      const countLabel = language === 'zh-CN'
        ? `${room.counts.devices} 设备 · ${room.counts.entities} 实体`
        : `${room.counts.devices} devices · ${room.counts.entities} entities`;
      return html`
        <button class="room">
          ${roomImg}
          <div class="room-label">
            <h3>${room.name}</h3>
            <p class="muted">${room.summary}</p>
            <p class="room-stats">${countLabel}</p>
          </div>
        </button>
      `;
    })}`;
  }

  private getRoomsForRender(): RoomConfig[] {
    const configuredRooms = this._config?.rooms || [];
    const hasCustomRooms = configuredRooms.length > 0 && !this.isDefaultRooms(configuredRooms);
    if (hasCustomRooms) {
      return configuredRooms;
    }

    if (this._areas && this._areas.length > 0) {
      const images = ['room_living', 'room_bedroom', 'room_kitchen', 'room_garden'];
      return this._areas.map((area, index) => ({
        name: area.name,
        image: images[index % images.length],
      }));
    }

    return configuredRooms;
  }

  private areaNameForEntity(entityId: string): string {
    const entry = this._entityRegistry?.find((item) => item.entity_id === entityId);
    if (!entry?.area_id) {
      return '';
    }

    return this._areas?.find((area) => area.area_id === entry.area_id)?.name || '';
  }

  private isDefaultRooms(rooms: RoomConfig[]): boolean {
    if (rooms.length !== DEFAULT_ROOMS.length) {
      return false;
    }

    return rooms.every((room, index) => {
      const fallback = DEFAULT_ROOMS[index];
      return fallback
        && room.image === fallback.image
        && room.info_entity === fallback.info_entity;
    });
  }

  private areaFallbackInfo(_room: RoomConfig, language: 'zh-CN' | 'en'): string {
    const area = this._areas?.find((entry) => entry.name === (_room.name || _room.name_zh || _room.name_en));
    if (!area) {
      return language === 'zh-CN' ? 'Home Assistant Area' : 'Home Assistant Area';
    }

    return this.areaSummaryById(area.area_id, language);
  }

  private weatherDisplayText(entityId?: string): string {
    if (!entityId || !this._hass) {
      return '--';
    }

    const entity = this._hass.states[entityId];
    return String(entity?.state || '--');
  }

  private weatherTemperature(entityId?: string): string {
    if (!entityId || !this._hass) {
      return '';
    }

    const temp = this._hass.states[entityId]?.attributes?.temperature;
    return temp !== undefined && temp !== null ? `${this.formatNumber(String(temp), 1)}°C` : '';
  }

  private areaSummaryById(areaId: string, language: 'zh-CN' | 'en'): string {
    if (!areaId) {
      return language === 'zh-CN' ? 'Home Assistant Area' : 'Home Assistant Area';
    }

    const areaDeviceIds = new Set(
      (this._deviceRegistry || [])
        .filter((d) => d.area_id === areaId && !d.disabled_by)
        .map((d) => d.id)
    );

    const entries = (this._entityRegistry || [])
      .filter((entry) => {
        if (entry.hidden_by || entry.disabled_by) return false;
        return entry.area_id === areaId || (entry.device_id && areaDeviceIds.has(entry.device_id));
      })
      .map((e) => e.entity_id);

    if (entries.length === 0) {
      return language === 'zh-CN' ? '暂无实体' : 'No entities';
    }

    const byClass = (cls: string) =>
      entries.find((eid) => this._hass?.states[eid]?.attributes?.device_class === cls);

    const parts: string[] = [];

    const presence = byClass('presence') || byClass('occupancy') || byClass('motion');
    if (presence) {
      const occupied = this.stateValue(presence) === 'on';
      parts.push(language === 'zh-CN' ? (occupied ? '有人' : '无人') : (occupied ? 'Occupied' : 'Empty'));
    }

    const temp = byClass('temperature');
    if (temp) {
      parts.push(`${this.formatNumber(this.stateValue(temp), 1)}°C`);
    }

    const hum = byClass('humidity');
    if (hum) {
      parts.push(`${this.formatNumber(this.stateValue(hum), 0)}%`);
    }

    if (!temp) {
      const illum = byClass('illuminance');
      if (illum) {
        parts.push(`${this.formatNumber(this.stateValue(illum), 0)}lx`);
      }
    }

    if (parts.length > 0) {
      return parts.join(' · ');
    }

    return language === 'zh-CN' ? `${entries.length} 个实体` : `${entries.length} entities`;
  }

  private areaCounts(areaId: string): { devices: number; entities: number } {
    if (!areaId) return { devices: 0, entities: 0 };

    const areaDevices = (this._deviceRegistry || [])
      .filter((d) => d.area_id === areaId && !d.disabled_by);
    const deviceIds = new Set(areaDevices.map((d) => d.id));

    const areaEntities = (this._entityRegistry || [])
      .filter((e) => {
        if (e.hidden_by || e.disabled_by) return false;
        return e.area_id === areaId || (e.device_id && deviceIds.has(e.device_id));
      });

    return { devices: deviceIds.size, entities: areaEntities.length };
  }

  private getRealDevicesForRender(): Array<{
    entityId: string;
    name: string;
    subtitle: string;
    detail: string;
    state: string;
    icon: string;
    color: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown';
  }> {
    if (!this._deviceRegistry || !this._entityRegistry || !this._hass) {
      return [];
    }

    const colors: Array<'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown'> = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];

    return this._deviceRegistry
      .filter((device) => !device.disabled_by)
      .map((device, index) => {
        const entities = this._entityRegistry
          ?.filter((entry) => entry.device_id === device.id && !entry.hidden_by && !entry.disabled_by)
          .map((entry) => entry.entity_id) || [];
        if (entities.length === 0) {
          return undefined;
        }

        const nonUpdateEntities = entities.filter((entityId) => !entityId.startsWith('update.') && !entityId.startsWith('device_tracker.'));
        if (nonUpdateEntities.length === 0) {
          return undefined;
        }
        const preferredEntity = nonUpdateEntities.find((entityId) => /^(light|switch|climate|media_player|lock|cover|fan)\./.test(entityId)) || nonUpdateEntities[0];
        if (!preferredEntity || !this._hass) {
          return undefined;
        }

        const stateObj = this._hass.states[preferredEntity];
        const state = stateObj?.state || 'unknown';
        const domain = preferredEntity.split('.')[0] || 'sensor';
        const icon = String(stateObj?.attributes?.icon || this.iconForDomain(domain));
        const name = String(stateObj?.attributes?.friendly_name || preferredEntity);
        const subtitle = this.areaNameForEntity(preferredEntity) || '';
        const detail = domain || '--';

        return {
          entityId: preferredEntity,
          name,
          subtitle,
          detail,
          state,
          icon,
          color: colors[index % colors.length],
        };
      })
      .filter((device): device is {
        entityId: string;
        name: string;
        subtitle: string;
        detail: string;
        state: string;
        icon: string;
        color: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown';
      } => Boolean(device));
  }

  private renderRealDeviceGroups(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): TemplateResult | typeof nothing {
    const devices = this.getRealDevicesForRender();
    if (devices.length === 0) {
      return html`<div class="empty-state">${translate('noDevices')}</div>`;
    }

    const groups = new Map<string, typeof devices>();
    devices.forEach((device) => {
      const groupKey = this._deviceGrouping === 'domain' ? device.detail : device.subtitle;
      const current = groups.get(groupKey) || [];
      current.push(device);
      groups.set(groupKey, current);
    });

    return html`${Array.from(groups.entries()).map(([group, items]) => html`
      <section class="device-group">
        <div class="section-title"><h2>${group}</h2><p class="muted">${String(items.length)}</p></div>
        <div class="devices devices-page-grid">
          ${items.map((device) => {
            const stateLabel = this.deviceStateLabel(device.state, language);
            const active = ['on', 'playing', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
            const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
            const assetKey = this.assetKeyForDomain(device.entityId.split('.')[0] || 'sensor');
            return html`
              <button class="device ${statusClass}" @click=${() => this.handleAction(device.entityId, 'more-info')}>
                <div class="device-top">
                  ${this.renderImage(assetKey, device.name, 'item-img')}
                  <div class="tag-stack"><div class="status">${stateLabel}</div></div>
                </div>
                <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
                <div class="control-row"><span class="state-word">${device.detail}</span><span class="switch${active ? ' on' : ''}"></span></div>
              </button>
            `;
          })}
        </div>
      </section>
    `)}`;
  }

  private renderRealScenes(language: 'zh-CN' | 'en', limit = 12, selectedScenes: string[] = []): TemplateResult | typeof nothing {
    if (!this._hass) {
      return nothing;
    }

    const scenes = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('scene.')))
      .filter((entity) => selectedScenes.length === 0 || selectedScenes.includes(entity.entity_id))
      .slice(0, limit);

    if (scenes.length === 0) return nothing;

    return html`${scenes.map((scene, index) => {
      const tones: Array<'morning' | 'night' | 'movie' | 'game'> = ['morning', 'night', 'movie', 'game'];
      const name = String(scene.attributes?.friendly_name || scene.entity_id);
      return html`
        <button class="scene ${tones[index % tones.length]}" @click=${() => this.runScene(scene.entity_id)}>
          <ha-icon icon="mdi:creation"></ha-icon>
          <strong>${name}</strong>
          <span>${language === 'zh-CN' ? '点击执行场景' : 'Tap to run scene'}</span>
        </button>
      `;
    })}`;
  }

  private renderRealAutomations(language: 'zh-CN' | 'en'): TemplateResult | typeof nothing {
    if (!this._hass) {
      return nothing;
    }

    const automations = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('automation.')));

    if (automations.length === 0) return nothing;

    return html`${automations.map((automation, index) => {
      const stateLabel = this.deviceStateLabel(automation.state, language);
      const active = automation.state === 'on';
      const tones: Array<'green' | 'blue' | 'purple' | 'yellow'> = ['green', 'blue', 'purple', 'yellow'];
      const statusClass = active ? `device-on-${tones[index % tones.length]}` : 'device-off';
      const lastTriggered = automation.attributes?.last_triggered
        ? String(automation.attributes.last_triggered)
        : (language === 'zh-CN' ? '未触发' : 'Not triggered');

      return html`
        <button class="device ${statusClass}" @click=${() => this.handleAction(automation.entity_id, 'more-info')}>
          <div class="device-top">
            <div class="item-icon"><ha-icon icon="mdi:robot"></ha-icon></div>
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${String(automation.attributes?.friendly_name || automation.entity_id)}</p><p class="muted">${lastTriggered}</p></div>
          <div class="control-row"><span class="state-word">${active ? (language === 'zh-CN' ? '已启用' : 'Enabled') : (language === 'zh-CN' ? '已停用' : 'Disabled')}</span><span class="switch${active ? ' on' : ''}"></span></div>
        </button>
      `;
    })}`;
  }

  private renderSecurityCards(language: 'zh-CN' | 'en'): TemplateResult | typeof nothing {
    if (!this._hass) {
      return nothing;
    }

    const securityEntities = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id && /^(camera|lock|alarm_control_panel|binary_sensor)\./.test(entity.entity_id)))
      .filter((entity) => {
        if (entity.entity_id.startsWith('binary_sensor.')) {
          return /door|window|motion|contact|lock/i.test(entity.entity_id);
        }

        return true;
      })
      .slice(0, 12);

    if (securityEntities.length === 0) return nothing;

    return html`${securityEntities.map((entity, index) => {
      const stateLabel = this.deviceStateLabel(entity.state, language);
      const domain = entity.entity_id.split('.')[0] || 'sensor';
      const assetKey = this.assetKeyForDomain(domain);
      if (domain === 'camera') {
        const stateObj = this._hass?.states?.[entity.entity_id];
        const entityPicture = stateObj?.attributes?.entity_picture;
        const accessToken = stateObj?.attributes?.access_token;
        const baseUrl = entityPicture
          ? entityPicture
          : accessToken
            ? `/api/camera_proxy/${entity.entity_id}?token=${encodeURIComponent(accessToken)}`
            : '';
        const sep = baseUrl.includes('?') ? '&' : '?';
        const snapshotUrl = baseUrl ? `${baseUrl}${sep}ts=${Date.now()}` : '';
        return html`
          <button class="camera-card" @click=${() => this.handleAction(entity.entity_id, 'more-info')}>
            <div class="camera-preview"><img alt=${String(entity.attributes?.friendly_name || entity.entity_id)} src=${snapshotUrl}></div>
            <div class="camera-meta">
              <div>
                <p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p>
                <p class="muted">${language === 'zh-CN' ? '实时快照' : 'Snapshot'}</p>
              </div>
              <div class="status">${stateLabel}</div>
            </div>
          </button>
        `;
      }

      const tones: Array<'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown'> = ['red', 'green', 'blue', 'purple', 'yellow', 'brown'];
      const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : `device-on-${tones[index % tones.length]}`;
      return html`
        <button class="device ${statusClass}" @click=${() => this.handleAction(entity.entity_id, 'more-info')}>
          <div class="device-top">
            ${this.renderImage(assetKey, entity.attributes?.friendly_name || entity.entity_id, 'item-img')}
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p><p class="muted">${domain}</p></div>
          <div class="control-row"><span class="state-word">${entity.state}</span><span class="switch${['on', 'armed_away', 'armed_home', 'locked'].includes(entity.state) ? ' on' : ''}"></span></div>
        </button>
      `;
    })}`;
  }

  private iconForDomain(domain: string): string {
    const icons: Record<string, string> = {
      light: 'mdi:lightbulb',
      input_boolean: 'mdi:boolean',
      button: 'mdi:gesture-tap',
      scene: 'mdi:palette',
      switch: 'mdi:toggle-switch',
      climate: 'mdi:air-conditioner',
      water_heater: 'mdi:water-boiler',
      humidifier: 'mdi:water-percent',
      media_player: 'mdi:speaker',
      remote: 'mdi:remote',
      lock: 'mdi:lock',
      cover: 'mdi:blinds',
      fan: 'mdi:fan',
      automation: 'mdi:robot',
      sensor: 'mdi:gauge',
      camera: 'mdi:cctv',
      alarm_control_panel: 'mdi:shield-lock',
      person: 'mdi:person',
      vacuum: 'mdi:robot-vacuum',
      device_tracker: 'mdi:map-marker',
      update: 'mdi:package-up',
    };

    return icons[domain] || 'mdi:devices';
  }

  private async loadAreas(): Promise<void> {
    if (this._areas || this._areasRequest || !this._hass?.connection?.sendMessagePromise) {
      return;
    }

    this._areasRequest = this._hass.connection.sendMessagePromise<AreaRegistryEntry[]>({
      type: 'config/area_registry/list',
    }).then((areas) => {
      this._areas = Array.isArray(areas)
        ? [...areas].sort((left, right) => left.name.localeCompare(right.name))
        : [];
    }).catch(() => {
      this._areas = [];
    }).finally(() => {
      this._areasRequest = undefined;
    });

    await this._areasRequest;
  }

  private async loadEntityRegistry(): Promise<void> {
    if (this._entityRegistry || this._entityRegistryRequest || !this._hass?.connection?.sendMessagePromise) {
      return;
    }

    this._entityRegistryRequest = this._hass.connection.sendMessagePromise<EntityRegistryEntry[]>({
      type: 'config/entity_registry/list',
    }).then((entities) => {
      this._entityRegistry = Array.isArray(entities) ? entities : [];
    }).catch(() => {
      this._entityRegistry = [];
    }).finally(() => {
      this._entityRegistryRequest = undefined;
    });

    await this._entityRegistryRequest;
  }

  private async loadDeviceRegistry(): Promise<void> {
    if (this._deviceRegistry || this._deviceRegistryRequest || !this._hass?.connection?.sendMessagePromise) {
      return;
    }

    this._deviceRegistryRequest = this._hass.connection.sendMessagePromise<DeviceRegistryEntry[]>({
      type: 'config/device_registry/list',
    }).then((devices) => {
      this._deviceRegistry = Array.isArray(devices) ? devices : [];
    }).catch(() => {
      this._deviceRegistry = [];
    }).finally(() => {
      this._deviceRegistryRequest = undefined;
    });

    await this._deviceRegistryRequest;
  }

  private async loadEnergyHistory(): Promise<void> {
    const entityId = this._config?.energy?.entity;
    if (!entityId || !this._hass?.connection?.sendMessagePromise) {
      return;
    }
    if (this._energyHistory && this._energyHistoryEntity === entityId) {
      return;
    }
    if (this._energyHistoryRequest) {
      await this._energyHistoryRequest;
      return;
    }

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    this._energyHistoryEntity = entityId;
    this._energyHistoryRequest = this._hass.connection.sendMessagePromise<Record<string, { statistics: Array<{ sum: number | null; state: number | null }> }>>({
      type: 'statistics_during_period',
      start_time: start.toISOString(),
      end_time: now.toISOString(),
      statistic_ids: [entityId],
      period: 'day',
    }).then((data) => {
      const stats = data?.[entityId]?.statistics ?? [];
      const daily: number[] = stats.map((entry) => {
        if (entry.sum !== null && entry.sum !== undefined) {
          return Math.round(entry.sum * 100) / 100;
        }
        if (entry.state !== null && entry.state !== undefined) {
          return Math.round(entry.state * 100) / 100;
        }
        return 0;
      });
      this._energyHistory = daily;
      const yesterday = daily.length >= 2 ? daily[daily.length - 2] : (daily.length === 1 ? daily[0] : undefined);
      this._energyYesterday = yesterday !== undefined ? this.formatNumber(String(yesterday), 1) : undefined;
    }).catch(() => {
      this._energyHistory = [];
      this._energyYesterday = undefined;
    }).finally(() => {
      this._energyHistoryRequest = undefined;
    });

    await this._energyHistoryRequest;
  }

  private renderEnvironment(_language: 'zh-CN' | 'en'): TemplateResult[] {
    const selectedMetrics = this._config?.home_selection?.environment || [];
    const configuredMetrics = this._config?.environment || [];
    const metrics = (selectedMetrics.length > 0
      ? selectedMetrics.map((entityId) => {
        const configured = configuredMetrics.find((metric) => metric.entity === entityId);
        if (configured) {
          return configured;
        }

        const state = this._hass?.states[entityId];
        const deviceClass = String(state?.attributes?.device_class || '').toLowerCase();
        const label = String(state?.attributes?.friendly_name || entityId);
        const unit = String(state?.attributes?.unit_of_measurement || '');
        const variant = deviceClass === 'temperature' ? 'temp' : (deviceClass === 'humidity' ? 'hum' : 'pm');
        const icon = variant === 'temp' ? 'mdi:thermometer' : (variant === 'hum' ? 'mdi:water-percent' : 'mdi:leaf');
        return {
          entity: entityId,
          label,
          unit,
          variant,
          icon,
        };
      })
      : configuredMetrics).slice(0, this._config?.home_limits?.environment || 5);
    return metrics.map((metric) => html`
      <div class="env-row">
        <div class="dot ${metric.variant || 'temp'}"><ha-icon icon=${metric.icon || 'mdi:circle'}></ha-icon></div>
        <div class="muted">${this._hass?.states[metric.entity]?.attributes?.friendly_name || metric.label || metric.entity}</div>
        <div class="env-value">${this.stateValue(metric.entity) || '--'}${metric.unit || ''}</div>
      </div>
    `);
  }

  private renderBars(values: number[]): TemplateResult {
    if (!values.length) {
      return html`${Array.from({ length: 30 }, () => html`<span class="energy-bar energy-bar-level-0"></span>`)}`;
    }
    const max = Math.max(...values, 0.1);
    return html`${values.map((value) => {
      const level = value <= 0 ? 0 : Math.max(1, Math.min(10, Math.round((value / max) * 10)));
      return html`<span class="energy-bar energy-bar-level-${level}" title=${String(value)}></span>`;
    })}`;
  }

  private deviceStateLabel(state: string, language: 'zh-CN' | 'en'): string {
    if (state === 'unavailable' || state === 'unknown') {
      return STRINGS[language].offline;
    }

    if (state === 'on' || state === 'playing' || state === 'cool' || state === 'heat' || state === 'armed') {
      return STRINGS[language].on;
    }

    if (state === 'open' || state === 'unlocked') {
      return STRINGS[language].open;
    }

    if (state === 'locked' || state === 'closed') {
      return STRINGS[language].closed;
    }

    if (state === 'off' || state === 'idle' || state === 'standby') {
      return STRINGS[language].off;
    }

    return state || '--';
  }


  protected updated(): void {
    this.applyThemeVariables();
    this.applyLayoutHeight();
    if (this._config?.fullscreen && !this._autoFullscreenDone) {
      this._autoFullscreenDone = true;
      this.toggleKiosk();
    }
  }

  private handleAction(entityId: string, action: string): void {
    if (action === 'toggle') {
      void this.toggleEntity(entityId);
    } else {
      this.moreInfo(entityId);
    }
  }

  private navigateTo(target: string): void {
    const valid: string[] = ['home', 'devices', 'rooms', 'scenes', 'automations', 'security', 'energy'];
    if (valid.includes(target)) {
      this._view = target as typeof this._view;
    }
  }

  private navigatePath(path: string): void {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('location-changed'));
  }

  private async runScene(entityId: string): Promise<void> {
    await this._hass?.callService('scene', 'turn_on', { entity_id: entityId });
  }

  private toggleKiosk(): void {
    const isKiosk = document.body.classList.toggle('skins-pro-kiosk');
    const sid = 'skins-pro-kiosk';

    const removeStyle = (root: Document | ShadowRoot | HTMLElement | null | undefined): void => {
      root?.querySelector(`#${sid}`)?.remove();
    };

    const inject = (root: Document | ShadowRoot | HTMLElement | null | undefined, css: string): void => {
      if (!root) return;
      removeStyle(root);
      const s = document.createElement('style');
      s.id = sid;
      s.textContent = css;
      root.appendChild(s);
    };

    const ha = document.querySelector('home-assistant')?.shadowRoot
      ?.querySelector('home-assistant-main')?.shadowRoot;

    const drawer = ha?.querySelector('ha-drawer') as HTMLElement | null | undefined;
    // ha-panel-lovelace is in light DOM accessible from home-assistant-main's shadowRoot
    const lovelace = (ha?.querySelector('ha-panel-lovelace') || ha?.querySelector('ha-panel-sections')) as HTMLElement | null | undefined;
    const huiShadow = lovelace?.shadowRoot?.querySelector('hui-root')?.shadowRoot;

    if (isKiosk) {
      inject(drawer,
        `:host { --ha-sidebar-width: 0px !important; }
         ha-drawer > ha-sidebar { display: none !important; }
         partial-panel-resolver { --mdc-top-app-bar-width: 100% !important; }`
      );
      inject(drawer?.shadowRoot,
        `wa-drawer { display: none !important; }
         .sidebar-shell { display: none !important; }
         mwc-top-app-bar-fixed, mwc-top-app-bar, header { display: none !important; }`
      );
      inject(huiShadow,
        `#view { min-height: 100vh !important; padding-top: 0px !important; }
         .header { display: none !important; }`
      );
    } else {
      removeStyle(drawer);
      removeStyle(drawer?.shadowRoot);
      removeStyle(huiShadow);
    }
  }

  private async toggleEntity(entityId: string): Promise<void> {
    if (!this._hass) {
      return;
    }

    const [domain] = entityId.split('.');
    if (!domain) {
      return;
    }

    await this._hass.callService(domain, 'toggle', { entity_id: entityId });
  }

  private moreInfo(entityId: string): void {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }));
  }
}
