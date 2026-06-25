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
};

type AreaRegistryEntry = {
  area_id: string;
  name: string;
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

type CardActionType = 'toggle' | 'more-info' | 'navigate' | 'none';

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
  action?: CardActionType;
  color?: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown';
  count_entity?: string;
  temperature_entity?: string;
  active_states?: string[];
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
  quote?: {
    entity?: string;
    source_entity?: string;
  };
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
    compare_value_entity?: string;
    bars_entity?: string;
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
    energy_compare_entity?: string;
    energy_bars_entity?: string;
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
  | 'settings'
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
  avatar: 'avatar-steve.jpg',
  decor: 'decor-wolf-lantern.jpg',
  light: 'icon-light.jpg',
  climate: 'icon-ac.jpg',
  speaker: 'icon-speaker.jpg',
  lock: 'icon-lock.jpg',
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
    settings: '设置',
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
    settings: 'Settings',
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
  { key: 'settings', icon: 'mdi:cog', target: 'settings' },
];

const DEFAULT_DEVICES: DeviceConfig[] = [
  { entity: 'light.living_room_lights', image: 'light', action: 'toggle', color: 'yellow' },
  { entity: 'climate.living_room_ac', image: 'climate', action: 'more-info', color: 'blue', temperature_entity: 'sensor.living_room_temperature' },
  { entity: 'media_player.living_room_speaker', image: 'speaker', action: 'more-info', color: 'purple' },
  { entity: 'lock.front_door', image: 'lock', action: 'more-info', color: 'red' },
  { entity: 'light.garden_light_strip', image: 'garden', action: 'toggle', color: 'green' },
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
  title_zh: '欢迎回家，冒险家！',
  title_en: 'Welcome home, adventurer!',
  subtitle_zh: 'Minecraft Home',
  subtitle_en: 'Minecraft Home',
  profile_name_zh: '冒险家',
  profile_name_en: 'Adventurer',
  profile_subtitle_zh: 'Minecraft Home',
  profile_subtitle_en: 'Minecraft Home',
  resource_pack: {
    skin: 'default',
    base_path: '__AUTO__',
    assets: DEFAULT_ASSETS,
  },
  weather: {
    entity: 'weather.home',
    temperature_entity: 'sensor.outdoor_temperature',
  },
  quote: {
    entity: 'input_text.daily_quote',
    source_entity: 'input_text.daily_quote_source',
  },
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
    compare_value_entity: 'sensor.energy_compare_percent',
    bars_entity: 'sensor.energy_week_samples',
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

let BUNDLED_SKINS: string[] = ['default'];
let DEFAULT_SKIN = 'default';

const loadSkins = async (): Promise<void> => {
  try {
    const url = new URL('skins.json', import.meta.url).toString();
    const res = await fetch(url);
    if (!res.ok) return;
    const list: string[] = await res.json();
    if (list.length > 0) {
      BUNDLED_SKINS = list;
      DEFAULT_SKIN = list[0] || 'default';
    }
  } catch {
    // keep fallback
  }
};

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

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
  quote: {
    ...DEFAULT_CONFIG.quote,
    ...config.quote,
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

  const weatherEntity = findEntity(states, ['weather.home', 'weather.forecast_home', 'weather']);
  const outdoorTemp = findEntity(states, ['sensor.outdoor_temperature', 'sensor.outside_temperature', 'sensor.weather_temperature']);
  const quoteEntity = findEntity(states, ['input_text.daily_quote', 'sensor.daily_quote', 'sensor.hitokoto']);
  const quoteSourceEntity = findEntity(states, ['input_text.daily_quote_source', 'sensor.daily_quote_source', 'sensor.hitokoto_from']);
  const energyEntity = findEntity(states, ['sensor.energy_cost_today', 'sensor.energy_today', 'sensor.daily_energy']);
  const compareEntity = findEntity(states, ['sensor.energy_compare_percent', 'sensor.energy_vs_yesterday', 'sensor.power_compare']);
  const barsEntity = findEntity(states, ['sensor.energy_week_samples', 'sensor.energy_samples', 'sensor.weekly_energy']);

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
    quote: {
      entity: quoteEntity || DEFAULT_CONFIG.quote?.entity,
      source_entity: quoteSourceEntity || DEFAULT_CONFIG.quote?.source_entity,
    },
    energy: {
      ...DEFAULT_CONFIG.energy,
      entity: energyEntity || DEFAULT_CONFIG.energy?.entity,
      compare_value_entity: compareEntity || DEFAULT_CONFIG.energy?.compare_value_entity,
      bars_entity: barsEntity || DEFAULT_CONFIG.energy?.bars_entity,
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

export class MinecraftDashboardCard extends HTMLElement {
  private _config?: DashboardConfig;
  private _hass?: HomeAssistant;
  private _view: 'home' | 'devices' | 'rooms' | 'scenes' | 'automations' | 'security' | 'energy' | 'settings' = 'home';
  private _deviceGrouping: 'area' | 'domain' = 'area';
  private _areas?: AreaRegistryEntry[];
  private _entityRegistry?: EntityRegistryEntry[];
  private _deviceRegistry?: DeviceRegistryEntry[];
  private _areasRequest?: Promise<void>;
  private _entityRegistryRequest?: Promise<void>;
  private _deviceRegistryRequest?: Promise<void>;
  private readonly _storageKey = 'skins-pro-card-settings';
  private readonly _handleWindowResize = () => this.applyLayoutHeight();

  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    loadSkins().then(() => this.render());
  }

  public connectedCallback(): void {
    window.addEventListener('resize', this._handleWindowResize);
  }

  public disconnectedCallback(): void {
    window.removeEventListener('resize', this._handleWindowResize);
  }

  public setConfig(config: DashboardConfig): void {
    if (!config || config.type !== 'custom:skins-pro-card') {
      throw new Error('Card type must be custom:skins-pro-card');
    }

    this._config = mergeConfig(this.loadPersistedConfig(config));
    this.render();
  }

  public set hass(hass: HomeAssistant) {
    this._hass = hass;
    void this.loadAreas();
    void this.loadEntityRegistry();
    void this.loadDeviceRegistry();
    this.render();
  }

  public getCardSize(): number {
    return 12;
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('skins-pro-card-editor');
  }

  private loadPersistedConfig(config: DashboardConfig): DashboardConfig {
    try {
      const raw = window.localStorage.getItem(this._storageKey);
      if (!raw) {
        return config;
      }

      const saved = JSON.parse(raw) as Partial<DashboardConfig>;
      return {
        ...config,
        home_selection: {
          ...(config.home_selection || {}),
          ...(saved.home_selection || {}),
        },
      };
    } catch (_error) {
      return config;
    }
  }

  private persistHomeSelection(): void {
    if (!this._config) {
      return;
    }

    try {
      window.localStorage.setItem(this._storageKey, JSON.stringify({
        home_selection: this._config.home_selection || {},
      }));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  private render(): void {
    if (!this.shadowRoot || !this._config) {
      return;
    }

    if (!this._hass) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${escapeHtml(this.assetHref('theme_css'))}">
        <ha-card><div class="loading-state">Loading...</div></ha-card>
      `;
      return;
    }

    const language = this._config.language === 'auto'
      ? normalizeLanguage(this._hass.language)
      : normalizeLanguage(this._config.language);
    const translate = (key: TranslationKey): string => STRINGS[language][key];
    const weatherState = this.stateValue(this._config.weather?.entity);
    const weatherIcon = this.weatherIcon(weatherState);
    const quote = this.stateValue(this._config.quote?.entity) || translate('loadingQuote');
    const quoteSource = this.stateValue(this._config.quote?.source_entity);
    const energyValue = this._config.energy?.entity ? this.formatNumber(this.stateValue(this._config.energy.entity), 1) : '--';
    const energyUnit = this._config.energy?.unit || 'kWh';
    const compareValue = this._config.energy?.compare_value_entity ? this.stateValue(this._config.energy.compare_value_entity) : '';
    const energyBars = this.buildBars(this._config.energy?.bars_entity ? this.stateValue(this._config.energy.bars_entity) : '');
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${escapeHtml(this.assetHref('theme_css'))}">
      <ha-card>
        <div class="mc-app" data-view="${this._view}">
          <aside class="sidebar">
            <div class="profile">
              ${this.imageTag('avatar', 'Avatar', 'profile-img')}
              <div class="meta">
                <h2>${escapeHtml(this.localizedText(this._config.profile_name, this._config.profile_name_zh, this._config.profile_name_en, language))}</h2>
                <p class="muted">${escapeHtml(this.localizedText(this._config.profile_subtitle, this._config.profile_subtitle_zh, this._config.profile_subtitle_en, language))}</p>
              </div>
            </div>
            <nav class="menu">
              ${this.renderNav(language)}
            </nav>
            <div class="sidebar-art">${this.imageTag('decor', 'Decor', '')}</div>
          </aside>
          <main class="stage">
            ${this.renderStageContent(language, translate, weatherIcon, quote, quoteSource, energyValue, energyUnit, compareValue, energyBars)}
          </main>
        </div>
      </ha-card>
    `;

    this.applyThemeVariables();
    this.applyLayoutHeight();
    this.bindEvents(language, translate);
  }

  private renderStageContent(
    language: 'zh-CN' | 'en',
    translate: (key: TranslationKey) => string,
    weatherIcon: string,
    quote: string,
    quoteSource: string,
    energyValue: string,
    energyUnit: string,
    compareValue: string,
    energyBars: string,
  ): string {
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

    if (this._view === 'settings') {
      return this.renderSettingsPage(language, translate);
    }

    return `
      <div class="stage-grid">
        <section class="welcome" data-section="home">
          <h1>${escapeHtml(this.localizedText(this._config?.title, this._config?.title_zh, this._config?.title_en, language))}</h1>
          <p class="quote">${escapeHtml(quote)}${quoteSource ? `<span class="quote-source"> - ${escapeHtml(quoteSource)}</span>` : ''}</p>
          <div class="weather-row" data-entity="${escapeHtml(this._config?.weather?.entity || '')}" data-action="more-info">
            <div class="weather-state-icon"><ha-icon icon="${weatherIcon}"></ha-icon></div>
            <div class="weather-text">${escapeHtml(this.weatherDisplayText(this._config?.weather?.entity))} ${escapeHtml(this.formatNumber(this.stateValue(this._config?.weather?.temperature_entity), 1))}${this._config?.weather?.temperature_entity ? '°C' : ''}</div>
          </div>
        </section>
        <section class="bottom-stack">
          <section class="bottom-block bottom-devices">
            <div class="section-title"><h2>${escapeHtml(translate('devices'))}</h2><p class="muted">${escapeHtml(translate('quickControl'))}</p></div>
            <div class="devices">${this.renderShortcutDevices(language)}</div>
          </section>
          <section class="bottom-block">
            <div class="section-title"><h2>${escapeHtml(translate('rooms'))}</h2><p class="muted">${escapeHtml(translate('roomSnapshots'))}</p></div>
            <div class="rooms">${this.renderRooms(language)}</div>
          </section>
        </section>
        <aside class="side">
          <section class="time-card">
            <div>
              <div class="time-main">${escapeHtml(this.timeText(language))}</div>
              <div class="time-sub">${escapeHtml(this.dateText(language))}</div>
            </div>
            <div class="time-icon"><ha-icon icon="mdi:clock-outline"></ha-icon></div>
          </section>
          <section class="glass-card">
            <div class="section-title"><h2>${escapeHtml(translate('environment'))}</h2></div>
            <div class="env-list">${this.renderEnvironment(language)}</div>
          </section>
          <section class="glass-card panel-energy">
            <p class="muted">${escapeHtml(translate('todayEnergy'))}</p>
            <div class="energy-value">${escapeHtml(energyValue)}<small> ${escapeHtml(energyUnit)}</small></div>
            <div class="bars">${energyBars}</div>
            <div class="energy-footer"><span class="muted">${escapeHtml(this.localizedText(this._config?.energy?.compare_text, this._config?.energy?.compare_text_zh, this._config?.energy?.compare_text_en, language, translate('compareYesterday')))}</span><span class="down">${escapeHtml(compareValue || '--')}</span></div>
          </section>
          ${this.renderMaintenanceCard(language, translate)}
          <section class="glass-card panel-scenes" data-section="scenes">
            <div class="section-title"><h2>${escapeHtml(translate('scenes'))}</h2><p class="muted">${escapeHtml(translate('modes'))}</p></div>
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
    const paddingBottom = 12;
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

  private imageTag(key: string, alt: string, className: string): string {
    const url = this.assetUrl(key);
    if (!url) {
      return '';
    }

    const classAttribute = className ? ` class="${className}"` : '';
    return `<img${classAttribute} alt="${escapeHtml(alt)}" src="${escapeHtml(url)}">`;
  }

  private renderNav(language: 'zh-CN' | 'en'): string {
    return (this._config?.nav || []).map((item, index) => {
      const label = this.localizedText(item.label, item.label_zh, item.label_en, language, STRINGS[language][(item.key as TranslationKey) || 'home'] || item.key || '');
      const target = item.target || item.key || 'home';
      const isActive = target === this._view || (index === 0 && this._view === 'home' && target === 'home');
      return `<button class="nav-button${isActive ? ' active' : ''}" data-nav-target="${escapeHtml(target)}"><ha-icon icon="${escapeHtml(item.icon || 'mdi:circle')}"></ha-icon><span>${escapeHtml(label)}</span></button>`;
    }).join('');
  }

  private renderPageShell(title: string, subtitle: string, controls: string, body: string): string {
    return `
      <div class="page-shell">
        <div class="page-header">
          <div>
            <h1>${escapeHtml(title)}</h1>
            <p class="quote">${escapeHtml(subtitle)}</p>
          </div>
          ${controls ? `<div class="page-controls">${controls}</div>` : ''}
        </div>
        <div class="page-body">${body}</div>
      </div>
    `;
  }

  private renderDevicesPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const controls = `
      <div class="chip-group">
        <button class="chip${this._deviceGrouping === 'area' ? ' active' : ''}" data-device-grouping="area">${escapeHtml(translate('byArea'))}</button>
        <button class="chip${this._deviceGrouping === 'domain' ? ' active' : ''}" data-device-grouping="domain">${escapeHtml(translate('byType'))}</button>
      </div>
    `;

    const body = `
      <div class="page-scroll themed-scrollbar">
        ${this.renderRealDeviceGroups(language, translate)}
      </div>
    `;

    return this.renderPageShell(translate('devices'), translate('quickControl'), controls, body);
  }

  private renderRoomsPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const roomsMarkup = this.renderAreaRooms(language, true);
    const roomCount = this._areas?.length || 0;
    const roomPageClass = roomCount > 8 ? 'rooms-page rooms-page-dense' : (roomCount > 4 ? 'rooms-page rooms-page-medium' : 'rooms-page');
    const body = `
      <div class="rooms-page-wrap">
        ${roomsMarkup
          ? `<div class="rooms ${roomPageClass}">${roomsMarkup}</div>`
          : `<div class="empty-state">${escapeHtml(language === 'zh-CN' ? '没有读取到 Home Assistant 房间' : 'No Home Assistant areas found')}</div>`}
      </div>
    `;

    return this.renderPageShell(translate('rooms'), translate('roomSnapshots'), '', body);
  }

  private renderScenesPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const scenes = this.renderRealScenes(language, Number.MAX_SAFE_INTEGER);
    const body = scenes
      ? `<div class="page-scroll themed-scrollbar"><div class="scene-grid scenes-page">${scenes}</div></div>`
      : `<div class="empty-state">${escapeHtml(translate('noScenes'))}</div>`;

    return this.renderPageShell(translate('scenes'), translate('modes'), '', body);
  }

  private renderAutomationsPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const automations = this.renderRealAutomations(language);
    const body = automations
      ? `<div class="page-scroll themed-scrollbar"><div class="devices devices-page-grid">${automations}</div></div>`
      : `<div class="empty-state">${escapeHtml(translate('noAutomations'))}</div>`;

    return this.renderPageShell(translate('automations'), language === 'zh-CN' ? 'Home Assistant 自动化' : 'Home Assistant automations', '', body);
  }

  private renderEnergyPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string, energyValue: string, energyUnit: string, compareValue: string, energyBars: string): string {
    const body = `
      <div class="page-body single-column">
        <section class="glass-card panel-energy page-energy-card compact-energy-card">
          <div class="section-title"><h2>${escapeHtml(translate('todayEnergy'))}</h2></div>
          <div class="env-list compact-energy-list">
            <div class="env-row"><div class="dot temp"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div><div class="muted">${escapeHtml(translate('todayEnergy'))}</div><div class="env-value">${escapeHtml(energyValue)} ${escapeHtml(energyUnit)}</div></div>
            <div class="env-row"><div class="dot hum"><ha-icon icon="mdi:compare-vertical"></ha-icon></div><div class="muted">${escapeHtml(this.localizedText(this._config?.energy?.compare_text, this._config?.energy?.compare_text_zh, this._config?.energy?.compare_text_en, language, translate('compareYesterday')))}</div><div class="env-value">${escapeHtml(compareValue || '--')}</div></div>
          </div>
          <div class="bars compact-energy-bars">${energyBars}</div>
        </section>
        ${this.renderMaintenanceCard(language, translate)}
      </div>
    `;

    return this.renderPageShell(translate('energy'), translate('todayEnergy'), '', body);
  }

  private renderSecurityPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const cards = this.renderSecurityCards(language);
    const body = cards
      ? `<div class="page-scroll themed-scrollbar"><div class="devices security-grid">${cards}</div></div>`
      : `<div class="empty-state">${escapeHtml(translate('offline'))}</div>`;

    return this.renderPageShell(translate('security'), translate('securityOverview'), '', body);
  }

  private renderMaintenanceBlock(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const items = this.getMaintenanceItems(language).slice(0, 5);
    if (items.length === 0) {
      return '';
    }

    return `
      <div class="maintenance-block">
        <div class="section-title maintenance-title"><h2>${escapeHtml(translate('maintenance'))}</h2></div>
        <div class="maintenance-list">
          ${items.map((item) => `<div class="maintenance-item"><span class="maintenance-dot ${escapeHtml(item.level)}"></span><span>${escapeHtml(item.text)}</span></div>`).join('')}
        </div>
      </div>
    `;
  }

  private renderMaintenanceCard(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const block = this.renderMaintenanceBlock(language, translate);
    if (!block) {
      return '';
    }

    return `
      <section class="glass-card maintenance-card">
        ${block}
      </section>
    `;
  }

  private getMaintenanceItems(language: 'zh-CN' | 'en'): Array<{ text: string; level: 'warning' | 'error' }> {
    if (!this._hass) {
      return [];
    }

    const items: Array<{ text: string; level: 'warning' | 'error' }> = [];

    Object.values(this._hass.states).forEach((entity) => {
      if (!entity) {
        return;
      }

      const attrBattery = Number(entity.attributes?.battery_level);
      if (Number.isFinite(attrBattery) && attrBattery > 0 && attrBattery <= 20) {
        items.push({
          text: `${String(entity.attributes?.friendly_name || entity.entity_id)} ${language === 'zh-CN' ? '电量低' : 'low battery'} (${attrBattery}%)`,
          level: 'warning',
        });
      }

      if (entity.entity_id.startsWith('sensor.') && /battery/i.test(entity.entity_id)) {
        const stateBattery = Number(entity.state);
        if (Number.isFinite(stateBattery) && stateBattery > 0 && stateBattery <= 20) {
          items.push({
            text: `${String(entity.attributes?.friendly_name || entity.entity_id)} ${language === 'zh-CN' ? '电量低' : 'low battery'} (${stateBattery}%)`,
            level: 'warning',
          });
        }
      }
    });

    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.text)) {
        return false;
      }
      seen.add(item.text);
      return true;
    });
  }

  private renderSettingsPage(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const allStates = this._hass ? Object.values(this._hass.states).filter((entity): entity is HassEntity => Boolean(entity?.entity_id)) : [];
    const deviceOptions = this.getRealDevicesForRender().map((device) => ({ value: device.entityId, label: device.name }));
    const roomOptions = (this._areas || []).map((area) => ({ value: area.name, label: area.name }));
    const sceneOptions = this._hass
      ? Object.values(this._hass.states)
        .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('scene.')))
        .map((scene) => ({ value: scene.entity_id, label: String(scene.attributes?.friendly_name || scene.entity_id) }))
      : [];
    const weatherOptions = allStates
      .filter((entity) => entity.entity_id.startsWith('weather.'))
      .map((entity) => ({ value: entity.entity_id, label: String(entity.attributes?.friendly_name || entity.entity_id) }));
    const weatherTemperatureOptions = allStates
      .filter((entity) => entity.entity_id.startsWith('sensor.'))
      .filter((entity) => /temperature|temp|outdoor|outside|weather/i.test(entity.entity_id) || /temperature/i.test(String(entity.attributes?.device_class || '')))
      .map((entity) => ({ value: entity.entity_id, label: String(entity.attributes?.friendly_name || entity.entity_id) }));
    const energyEntityOptions = allStates
      .filter((entity) => entity.entity_id.startsWith('sensor.'))
      .filter((entity) => /energy|power|cost/i.test(entity.entity_id))
      .map((entity) => ({ value: entity.entity_id, label: String(entity.attributes?.friendly_name || entity.entity_id) }));
    const environmentOptions = allStates
      .filter((entity) => entity.entity_id.startsWith('sensor.'))
      .filter((entity) => {
        const id = entity.entity_id.toLowerCase();
        const name = String(entity.attributes?.friendly_name || '').toLowerCase();
        const deviceClass = String(entity.attributes?.device_class || '').toLowerCase();
        const unit = String(entity.attributes?.unit_of_measurement || '').toLowerCase();

        if (['temperature', 'humidity', 'pm25', 'pm10', 'aqi', 'carbon_dioxide', 'volatile_organic_compounds', 'illuminance', 'pressure'].includes(deviceClass)) {
          return true;
        }

        if (['°c', '℃', '%', 'lx', 'lux', 'ppm', 'µg/m³', 'ug/m3', 'hpa'].includes(unit)) {
          return /temperature|humidity|pm2|pm25|pm10|aqi|air|co2|voc|illuminance|lux|pressure/.test(`${id} ${name}`);
        }

        return false;
      })
      .map((entity) => ({ value: entity.entity_id, label: String(entity.attributes?.friendly_name || entity.entity_id) }));

    const skinOptions = BUNDLED_SKINS.map((skin) => ({ value: skin, label: skin }));

    const renderSingleSelect = (path: 'skin' | 'weather_entity' | 'weather_temperature_entity' | 'energy_entity' | 'energy_compare_entity' | 'energy_bars_entity', title: string, selected: string, options: Array<{ value: string; label: string }>) => `
      <div>
        <span>${escapeHtml(title)}</span>
        <div class="selector-stack">
          <div class="selector-row single">
            <select data-settings-single="${path}">
              <option value="">${escapeHtml(language === 'zh-CN' ? '请选择' : 'Select')}</option>
              ${options.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    `;

    const renderSelectorRows = (
      path: 'devices' | 'rooms' | 'scenes' | 'environment',
      title: string,
      selected: string[],
      options: Array<{ value: string; label: string }>,
      limit: number,
    ) => {
      if (options.length === 0) {
        return `<div><span>${escapeHtml(title)}</span><div class="empty-state compact-empty">${escapeHtml(language === 'zh-CN' ? '没有可选项' : 'No options')}</div></div>`;
      }

      const rows = selected.length > 0 ? selected : [''];
      return `
        <div>
          <span>${escapeHtml(title)}</span>
          <div class="selector-stack">
            ${rows.map((selectedValue, index) => `
              <div class="selector-row">
                <select data-settings-select="${path}" data-settings-index="${index}">
                  <option value="">${escapeHtml(language === 'zh-CN' ? '请选择' : 'Select')}</option>
                  ${options.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selectedValue ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
                </select>
                <button class="selector-btn" data-settings-remove="${path}" data-settings-index="${index}">${escapeHtml(language === 'zh-CN' ? '删除' : 'Remove')}</button>
              </div>
            `).join('')}
            <button class="selector-btn add" data-settings-add="${path}" ${rows.length >= limit ? 'disabled' : ''}>${escapeHtml(language === 'zh-CN' ? '新增' : 'Add')}</button>
          </div>
        </div>
      `;
    };

    const body = `
      <div class="page-scroll themed-scrollbar settings-page">
        <div class="settings-grid">
          ${renderSingleSelect('skin', language === 'zh-CN' ? '皮肤' : 'Skin', this.selectedSkin(), skinOptions)}
          ${renderSingleSelect('weather_entity', language === 'zh-CN' ? '天气实体' : 'Weather entity', this._config?.home_selection?.weather_entity || this._config?.weather?.entity || '', weatherOptions)}
          ${renderSingleSelect('weather_temperature_entity', language === 'zh-CN' ? '天气温度实体' : 'Weather temperature entity', this._config?.home_selection?.weather_temperature_entity || this._config?.weather?.temperature_entity || '', weatherTemperatureOptions)}
          ${renderSingleSelect('energy_entity', language === 'zh-CN' ? '用电实体' : 'Energy entity', this._config?.home_selection?.energy_entity || this._config?.energy?.entity || '', energyEntityOptions)}
          ${renderSingleSelect('energy_compare_entity', language === 'zh-CN' ? '用电对比实体' : 'Energy compare entity', this._config?.home_selection?.energy_compare_entity || this._config?.energy?.compare_value_entity || '', energyEntityOptions)}
          ${renderSingleSelect('energy_bars_entity', language === 'zh-CN' ? '柱状图样本实体' : 'Bars sample entity', this._config?.home_selection?.energy_bars_entity || this._config?.energy?.bars_entity || '', energyEntityOptions)}
          ${renderSelectorRows('devices', language === 'zh-CN' ? '首页设备' : 'Home devices', this._config?.home_selection?.devices || [], deviceOptions, this._config?.home_limits?.devices || 5)}
          ${renderSelectorRows('rooms', language === 'zh-CN' ? '首页房间' : 'Home rooms', this._config?.home_selection?.rooms || [], roomOptions, this._config?.home_limits?.rooms || 4)}
          ${renderSelectorRows('scenes', language === 'zh-CN' ? '首页场景' : 'Home scenes', this._config?.home_selection?.scenes || [], sceneOptions, this._config?.home_limits?.scenes || 6)}
          ${renderSelectorRows('environment', language === 'zh-CN' ? '首页环境项' : 'Home environment', this._config?.home_selection?.environment || [], environmentOptions, this._config?.home_limits?.environment || 5)}
        </div>
      </div>
    `;

    return this.renderPageShell(translate('settings'), language === 'zh-CN' ? '配置首页显示内容' : 'Configure home content', '', body);
  }

  private renderShortcutDevices(language: 'zh-CN' | 'en'): string {
    const limit = this._config?.home_limits?.devices || 5;
    const selectedEntities = this._config?.home_selection?.devices || [];
    const allRealDevices = this.getRealDevicesForRender();
    const realDevices = (selectedEntities.length > 0
      ? allRealDevices.filter((device) => selectedEntities.includes(device.entityId))
      : allRealDevices).slice(0, limit);
    if (realDevices.length === 0) {
      const fallbackDevices = (selectedEntities.length > 0
        ? (this._config?.devices || []).filter((device) => selectedEntities.includes(device.entity))
        : (this._config?.devices || [])).slice(0, limit);
      return fallbackDevices.map((device) => {
        const stateObj = this._hass?.states[device.entity];
        const state = this.stateValue(device.entity);
        const stateLabel = this.deviceStateLabel(state, language);
        const active = this.isActiveState(device, state);
        const count = device.count_entity ? this.stateValue(device.count_entity) : '';
        const temperature = device.temperature_entity ? `${this.formatNumber(this.stateValue(device.temperature_entity), 1)}°C` : '';
        const statusClass = active ? `device-on-${device.color || 'green'}` : (state === 'unavailable' ? 'device-unavailable' : 'device-off');
        const displayName = String(stateObj?.attributes?.friendly_name || device.name || device.entity);
        const displayArea = this.areaNameForEntity(device.entity) || device.area || device.area_zh || device.area_en || '';
        const image = device.image ? this.imageTag(device.image, displayName, 'item-img') : `<div class="item-icon"><ha-icon icon="${escapeHtml(device.icon || 'mdi:devices')}"></ha-icon></div>`;
        return `
          <button class="device ${statusClass}" data-entity="${escapeHtml(device.entity)}" data-action="${escapeHtml(device.action || 'more-info')}">
            <div class="device-top">
              ${image}
              <div class="tag-stack">
                <div class="status">${escapeHtml(stateLabel)}</div>
                ${count ? `<div class="count-tag">${escapeHtml(count)}</div>` : ''}
              </div>
            </div>
            <div class="device-copy"><p class="device-name">${escapeHtml(displayName)}</p><p class="muted">${escapeHtml(displayArea)}</p></div>
            <div class="control-row"><span class="state-word">${escapeHtml(temperature || stateLabel)}</span><span class="switch${active ? ' on' : ''}"></span></div>
          </button>
        `;
      }).join('');
    }

    return realDevices.map((device) => {
      const stateLabel = this.deviceStateLabel(device.state, language);
      const active = ['on', 'playing', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
      const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
      const assetKey = this.assetKeyForDomain(device.entityId.split('.')[0] || 'sensor');
      const image = assetKey ? this.imageTag(assetKey, device.name, 'item-img') : `<div class="item-icon"><ha-icon icon="${escapeHtml(device.icon)}"></ha-icon></div>`;
      return `
        <button class="device ${statusClass}" data-entity="${escapeHtml(device.entityId)}" data-action="more-info">
          <div class="device-top">
            ${image}
            <div class="tag-stack"><div class="status">${escapeHtml(stateLabel)}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${escapeHtml(device.name)}</p><p class="muted">${escapeHtml(device.subtitle)}</p></div>
          <div class="control-row"><span class="state-word">${escapeHtml(device.detail)}</span><span class="switch${active ? ' on' : ''}"></span></div>
        </button>
      `;
    }).join('');
  }

  private assetKeyForDomain(domain: string): string | undefined {
    const map: Record<string, string> = {
      light: 'light',
      climate: 'climate',
      media_player: 'speaker',
      lock: 'lock',
      binary_sensor: 'lock',
      switch: 'garden',
      fan: 'garden',
      cover: 'garden',
    };

    return map[domain];
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

  private renderHomeScenes(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const limit = this._config?.home_limits?.scenes || 6;
    const selectedScenes = this._config?.home_selection?.scenes || [];
    const scenes = this.renderRealScenes(language, limit, selectedScenes);
    if (scenes) {
      return scenes;
    }

    return `<div class="empty-state compact-empty">${escapeHtml(translate('noScenes'))}</div>`;
  }

  private renderRooms(language: 'zh-CN' | 'en'): string {
    const limit = this._view === 'home' ? (this._config?.home_limits?.rooms || 4) : undefined;
    const selectedRooms = this._view === 'home' ? (this._config?.home_selection?.rooms || []) : [];
    const areaRooms = this.renderAreaRooms(language, false, limit, selectedRooms);
    if (areaRooms) {
      return areaRooms;
    }

    const rooms = this.getRoomsForRender();
    return rooms.map((room) => {
      const imageKey = room.image || 'room_living';
      const info = room.info_entity ? this.stateValue(room.info_entity) : '';
      const fallbackInfo = this._areas?.length ? this.areaFallbackInfo(room, language) : '--';
      const displayName = room.name || '--';
      return `
        <button class="room" ${room.target ? `data-nav-path="${escapeHtml(room.target)}"` : ''}>
          ${this.imageTag(imageKey, displayName, '')}
          <div class="room-label">
            <h3>${escapeHtml(displayName)}</h3>
            <p class="muted">${escapeHtml(info || fallbackInfo || '--')}</p>
          </div>
        </button>
      `;
    }).join('');
  }

  private renderAreaRooms(language: 'zh-CN' | 'en', requireRealAreas: boolean, limit?: number, selectedRooms: string[] = []): string {
    if (!this._areas || this._areas.length === 0) {
      return '';
    }

    const images = ['room_living', 'room_bedroom', 'room_kitchen', 'room_garden'];
    const filteredAreas = selectedRooms.length > 0
      ? selectedRooms
        .map((roomName) => this._areas?.find((area) => area.name === roomName))
        .filter((area): area is AreaRegistryEntry => Boolean(area))
      : this._areas;
    const rooms = filteredAreas.slice(0, limit || filteredAreas.length).map((area, index) => ({
      name: area.name,
      image: images[index % images.length],
      summary: this.areaSummaryById(area.area_id, language),
    }));

    if (requireRealAreas && rooms.length === 0) {
      return '';
    }

    return rooms.map((room) => `
      <button class="room">
        ${this.imageTag(room.image || 'room_living', room.name, '')}
        <div class="room-label">
          <h3>${escapeHtml(room.name)}</h3>
          <p class="muted">${escapeHtml(room.summary)}</p>
        </div>
      </button>
    `).join('');
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

  private areaSummaryById(areaId: string, language: 'zh-CN' | 'en'): string {
    if (!areaId) {
      return language === 'zh-CN' ? 'Home Assistant Area' : 'Home Assistant Area';
    }

    const entityIds = (this._entityRegistry || [])
      .filter((entry) => entry.area_id === areaId && !entry.hidden_by && !entry.disabled_by)
      .map((entry) => entry.entity_id);

    if (entityIds.length === 0) {
      return language === 'zh-CN' ? '暂无实体' : 'No entities';
    }

    const lowerIds = entityIds.map((entityId) => entityId.toLowerCase());
    const hasGardenLike = lowerIds.some((entityId) => /garden|outdoor|yard|balcony|terrace/.test(entityId));
    const presenceEntity = entityIds.find((entityId) => /^(binary_sensor)\./.test(entityId) && /presence|occupancy|motion|pir/.test(entityId.toLowerCase()));
    const temperatureEntity = entityIds.find((entityId) => /^(sensor)\./.test(entityId) && /temperature|temp/.test(entityId.toLowerCase()));
    const humidityEntity = entityIds.find((entityId) => /^(sensor)\./.test(entityId) && /humidity/.test(entityId.toLowerCase()));
    const illuminanceEntity = entityIds.find((entityId) => /^(sensor)\./.test(entityId) && /illuminance|lux/.test(entityId.toLowerCase()));
    const lightEntity = entityIds.find((entityId) => /^(light)\./.test(entityId));
    const outdoorHumidity = entityIds.find((entityId) => /^(sensor)\./.test(entityId) && /outdoor.*humidity|humidity.*outdoor/.test(entityId.toLowerCase()));

    const parts: string[] = [];

    if (presenceEntity) {
      const occupied = this.stateValue(presenceEntity) === 'on';
      parts.push(language === 'zh-CN' ? (occupied ? '有人' : '无人') : (occupied ? 'Occupied' : 'Empty'));
    }

    if (temperatureEntity) {
      parts.push(`${this.formatNumber(this.stateValue(temperatureEntity), 1)}°C`);
    }

    if (humidityEntity) {
      parts.push(`${this.formatNumber(this.stateValue(humidityEntity), 0)}%`);
    }

    if (!temperatureEntity && illuminanceEntity) {
      parts.push(`${this.formatNumber(this.stateValue(illuminanceEntity), 0)}lx`);
    }

    if (hasGardenLike && lightEntity) {
      const lightOn = this.stateValue(lightEntity) === 'on';
      parts.push(language === 'zh-CN' ? (lightOn ? '灯带开' : '灯带关') : (lightOn ? 'Light on' : 'Light off'));
    }

    if (hasGardenLike && outdoorHumidity) {
      parts.push(`${this.formatNumber(this.stateValue(outdoorHumidity), 0)}%`);
    }

    if (parts.length > 0) {
      return parts.join(' · ');
    }

    return language === 'zh-CN' ? `${entityIds.length} 个实体` : `${entityIds.length} entities`;
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

        const preferredEntity = entities.find((entityId) => /^(light|switch|climate|media_player|lock|cover|fan)\./.test(entityId)) || entities[0];
        if (!preferredEntity || !this._hass) {
          return undefined;
        }

        const stateObj = this._hass.states[preferredEntity];
        const state = stateObj?.state || 'unknown';
        const domain = preferredEntity.split('.')[0] || 'sensor';
        const icon = String(stateObj?.attributes?.icon || this.iconForDomain(domain));
        const name = device.name_by_user || device.name || stateObj?.attributes?.friendly_name || preferredEntity;
        const subtitle = device.manufacturer || device.model || `${entities.length} entities`;
        const detail = device.model || domain || '--';

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

  private renderRealDeviceGroups(language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): string {
    const devices = this.getRealDevicesForRender();
    if (devices.length === 0) {
      return `<div class="empty-state">${escapeHtml(translate('noDevices'))}</div>`;
    }

    const groups = new Map<string, typeof devices>();
    devices.forEach((device) => {
      const groupKey = this._deviceGrouping === 'domain' ? device.detail : device.subtitle;
      const current = groups.get(groupKey) || [];
      current.push(device);
      groups.set(groupKey, current);
    });

    return Array.from(groups.entries()).map(([group, items]) => `
      <section class="device-group">
        <div class="section-title"><h2>${escapeHtml(group)}</h2><p class="muted">${escapeHtml(String(items.length))}</p></div>
        <div class="devices devices-page-grid">
          ${items.map((device) => {
            const stateLabel = this.deviceStateLabel(device.state, language);
            const active = ['on', 'playing', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
            const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
            return `
              <button class="device ${statusClass}" data-entity="${escapeHtml(device.entityId)}" data-action="more-info">
                <div class="device-top">
                  <div class="item-icon"><ha-icon icon="${escapeHtml(device.icon)}"></ha-icon></div>
                  <div class="tag-stack"><div class="status">${escapeHtml(stateLabel)}</div></div>
                </div>
                <div class="device-copy"><p class="device-name">${escapeHtml(device.name)}</p><p class="muted">${escapeHtml(device.subtitle)}</p></div>
                <div class="control-row"><span class="state-word">${escapeHtml(device.detail)}</span><span class="switch${active ? ' on' : ''}"></span></div>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `).join('');
  }

  private renderRealScenes(language: 'zh-CN' | 'en', limit = 12, selectedScenes: string[] = []): string {
    if (!this._hass) {
      return '';
    }

    const scenes = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('scene.')))
      .filter((entity) => selectedScenes.length === 0 || selectedScenes.includes(entity.entity_id))
      .slice(0, limit);

    return scenes.map((scene, index) => {
      const tones: Array<'morning' | 'night' | 'movie' | 'game'> = ['morning', 'night', 'movie', 'game'];
      const name = String(scene.attributes?.friendly_name || scene.entity_id);
      return `
        <button class="scene ${tones[index % tones.length]}" data-scene-entity="${escapeHtml(scene.entity_id)}" data-confirm="true" data-scene-name="${escapeHtml(name)}">
          <ha-icon icon="mdi:creation"></ha-icon>
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(language === 'zh-CN' ? '点击执行场景' : 'Tap to run scene')}</span>
        </button>
      `;
    }).join('');
  }

  private renderRealAutomations(language: 'zh-CN' | 'en'): string {
    if (!this._hass) {
      return '';
    }

    const automations = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('automation.')));

    return automations.map((automation, index) => {
      const stateLabel = this.deviceStateLabel(automation.state, language);
      const active = automation.state === 'on';
      const tones: Array<'green' | 'blue' | 'purple' | 'yellow'> = ['green', 'blue', 'purple', 'yellow'];
      const statusClass = active ? `device-on-${tones[index % tones.length]}` : 'device-off';
      const lastTriggered = automation.attributes?.last_triggered
        ? String(automation.attributes.last_triggered)
        : (language === 'zh-CN' ? '未触发' : 'Not triggered');

      return `
        <button class="device ${statusClass}" data-entity="${escapeHtml(automation.entity_id)}" data-action="more-info">
          <div class="device-top">
            <div class="item-icon"><ha-icon icon="mdi:robot"></ha-icon></div>
            <div class="tag-stack"><div class="status">${escapeHtml(stateLabel)}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${escapeHtml(String(automation.attributes?.friendly_name || automation.entity_id))}</p><p class="muted">${escapeHtml(lastTriggered)}</p></div>
          <div class="control-row"><span class="state-word">${escapeHtml(active ? (language === 'zh-CN' ? '已启用' : 'Enabled') : (language === 'zh-CN' ? '已停用' : 'Disabled'))}</span><span class="switch${active ? ' on' : ''}"></span></div>
        </button>
      `;
    }).join('');
  }

  private renderSecurityCards(language: 'zh-CN' | 'en'): string {
    if (!this._hass) {
      return '';
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

    return securityEntities.map((entity, index) => {
      const stateLabel = this.deviceStateLabel(entity.state, language);
      const domain = entity.entity_id.split('.')[0] || 'sensor';
      const icon = String(entity.attributes?.icon || this.iconForDomain(domain));
      if (domain === 'camera') {
        const snapshotUrl = `/api/camera_proxy/${entity.entity_id}`;
        return `
          <button class="camera-card" data-entity="${escapeHtml(entity.entity_id)}" data-action="more-info">
            <div class="camera-preview"><img alt="${escapeHtml(String(entity.attributes?.friendly_name || entity.entity_id))}" src="${escapeHtml(snapshotUrl)}"></div>
            <div class="camera-meta">
              <div>
                <p class="device-name">${escapeHtml(String(entity.attributes?.friendly_name || entity.entity_id))}</p>
                <p class="muted">${escapeHtml(language === 'zh-CN' ? '实时快照' : 'Snapshot')}</p>
              </div>
              <div class="status">${escapeHtml(stateLabel)}</div>
            </div>
          </button>
        `;
      }

      const tones: Array<'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown'> = ['red', 'green', 'blue', 'purple', 'yellow', 'brown'];
      const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : `device-on-${tones[index % tones.length]}`;
      return `
        <button class="device ${statusClass}" data-entity="${escapeHtml(entity.entity_id)}" data-action="more-info">
          <div class="device-top">
            <div class="item-icon"><ha-icon icon="${escapeHtml(icon)}"></ha-icon></div>
            <div class="tag-stack"><div class="status">${escapeHtml(stateLabel)}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${escapeHtml(String(entity.attributes?.friendly_name || entity.entity_id))}</p><p class="muted">${escapeHtml(domain)}</p></div>
          <div class="control-row"><span class="state-word">${escapeHtml(entity.state)}</span><span class="switch${['on', 'armed_away', 'armed_home', 'locked'].includes(entity.state) ? ' on' : ''}"></span></div>
        </button>
      `;
    }).join('');
  }

  private iconForDomain(domain: string): string {
    const icons: Record<string, string> = {
      light: 'mdi:lightbulb',
      switch: 'mdi:toggle-switch',
      climate: 'mdi:air-conditioner',
      media_player: 'mdi:speaker',
      lock: 'mdi:lock',
      cover: 'mdi:blinds',
      fan: 'mdi:fan',
      sensor: 'mdi:gauge',
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
      this.render();
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
      this.render();
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
      this.render();
    }).catch(() => {
      this._deviceRegistry = [];
    }).finally(() => {
      this._deviceRegistryRequest = undefined;
    });

    await this._deviceRegistryRequest;
  }

  private renderEnvironment(_language: 'zh-CN' | 'en'): string {
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
    return metrics.map((metric) => `
      <div class="env-row">
        <div class="dot ${escapeHtml(metric.variant || 'temp')}"><ha-icon icon="${escapeHtml(metric.icon || 'mdi:circle')}"></ha-icon></div>
        <div class="muted">${escapeHtml(this._hass?.states[metric.entity]?.attributes?.friendly_name || metric.label || metric.entity)}</div>
        <div class="env-value">${escapeHtml(this.stateValue(metric.entity) || '--')}${escapeHtml(metric.unit || '')}</div>
      </div>
    `).join('');
  }

  private buildBars(raw: string): string {
    const values = raw.split(',').map((item) => Number(item.trim())).filter((value) => Number.isFinite(value));
    if (values.length === 0) {
      return new Array(10).fill(0).map((_, index) => `<span class="energy-bar energy-bar-level-${index + 1}"></span>`).join('');
    }

    const max = Math.max(...values, 1);
    return values.slice(0, 10).map((value) => {
      const level = Math.max(1, Math.min(10, Math.round((value / max) * 10)));
      return `<span class="energy-bar energy-bar-level-${level}"></span>`;
    }).join('');
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

  private isActiveState(device: DeviceConfig, state: string): boolean {
    const activeStates = device.active_states || ['on', 'playing', 'cool', 'heat', 'armed', 'locked'];
    return activeStates.includes(state);
  }

  private bindEvents(_language: 'zh-CN' | 'en', translate: (key: TranslationKey) => string): void {
    if (!this.shadowRoot || !this._hass) {
      return;
    }

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => {
      element.addEventListener('click', () => {
        const entity = element.dataset.entity;
        const action = element.dataset.action as CardActionType | undefined;
        if (!entity || !action) {
          return;
        }

        if (action === 'toggle') {
          void this.toggleEntity(entity);
        } else if (action === 'more-info') {
          this.moreInfo(entity);
        }
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-scene-entity]').forEach((element) => {
      element.addEventListener('click', () => {
        const entity = element.dataset.sceneEntity;
        const needsConfirm = element.dataset.confirm !== 'false';
        const name = element.dataset.sceneName || entity || '';
        if (!entity) {
          return;
        }

        if (needsConfirm) {
          const message = translate('confirmScene').replace('{name}', name);
          if (!window.confirm(message)) {
            return;
          }
        }

        void this._hass?.callService('scene', 'turn_on', { entity_id: entity });
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-nav-target]').forEach((element) => {
      element.addEventListener('click', () => {
        const target = element.dataset.navTarget;
        if (!target || !this.shadowRoot) {
          return;
        }

        this.shadowRoot.querySelectorAll('.nav-button').forEach((button) => button.classList.remove('active'));
        element.classList.add('active');

        if (['home', 'devices', 'rooms', 'scenes', 'automations', 'security', 'energy', 'settings'].includes(target)) {
          this._view = target as typeof this._view;
          this.render();
          return;
        }

        const app = this.shadowRoot.querySelector('.mc-app');
        app?.setAttribute('data-view', target);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-device-grouping]').forEach((element) => {
      element.addEventListener('click', () => {
        const grouping = element.dataset.deviceGrouping;
        if (grouping !== 'area' && grouping !== 'domain') {
          return;
        }

        this._deviceGrouping = grouping;
        this.render();
      });
    });

    const updateSelection = (path: 'devices' | 'rooms' | 'scenes' | 'environment', updater: (items: string[]) => string[]) => {
      if (!this._config) {
        return;
      }

      const next = JSON.parse(JSON.stringify(this._config));
      next.home_selection = next.home_selection || {};
      next.home_selection[path] = updater([...(next.home_selection[path] || [])]);
      this._config = mergeConfig(next);
      this.persistHomeSelection();
      this.render();
    };

    this.shadowRoot.querySelectorAll<HTMLSelectElement>('[data-settings-single]').forEach((select) => {
      select.addEventListener('change', () => {
        const path = select.dataset.settingsSingle as 'skin' | 'weather_entity' | 'weather_temperature_entity' | 'energy_entity' | 'energy_compare_entity' | 'energy_bars_entity' | undefined;
        if (!path || !this._config) {
          return;
        }

        const next = JSON.parse(JSON.stringify(this._config));
        next.resource_pack = next.resource_pack || {};
        next.home_selection = next.home_selection || {};
        if (path === 'skin') {
          next.resource_pack.skin = select.value;
          next.resource_pack.base_path = bundledSkinBasePath(select.value);
          this._config = mergeConfig(next);
          this.render();
          return;
        }
        next.home_selection[path] = select.value;
        if (path === 'weather_entity') {
          next.weather = next.weather || {};
          next.weather.entity = select.value;
        }
        if (path === 'weather_temperature_entity') {
          next.weather = next.weather || {};
          next.weather.temperature_entity = select.value;
        }
        if (path === 'energy_entity') {
          next.energy = next.energy || {};
          next.energy.entity = select.value;
        }
        if (path === 'energy_compare_entity') {
          next.energy = next.energy || {};
          next.energy.compare_value_entity = select.value;
        }
        if (path === 'energy_bars_entity') {
          next.energy = next.energy || {};
          next.energy.bars_entity = select.value;
        }
        this._config = mergeConfig(next);
        this.persistHomeSelection();
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll<HTMLSelectElement>('[data-settings-select]').forEach((select) => {
      select.addEventListener('change', () => {
        const path = select.dataset.settingsSelect as 'devices' | 'rooms' | 'scenes' | 'environment' | undefined;
        const index = Number(select.dataset.settingsIndex || '-1');
        if (!path || index < 0) {
          return;
        }

        updateSelection(path, (items) => {
          items[index] = select.value;
          return items.filter(Boolean);
        });
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-settings-add]').forEach((button) => {
      button.addEventListener('click', () => {
        const path = button.dataset.settingsAdd as 'devices' | 'rooms' | 'scenes' | 'environment' | undefined;
        if (!path || !this._config) {
          return;
        }

        const limit = this._config.home_limits?.[path] || 0;
        updateSelection(path, (items) => items.length >= limit ? items : [...items, '']);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-settings-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        const path = button.dataset.settingsRemove as 'devices' | 'rooms' | 'scenes' | 'environment' | undefined;
        const index = Number(button.dataset.settingsIndex || '-1');
        if (!path || index < 0) {
          return;
        }

        updateSelection(path, (items) => items.filter((_, itemIndex) => itemIndex !== index));
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-nav-path]').forEach((element) => {
      element.addEventListener('click', () => {
        const path = element.dataset.navPath;
        if (!path) {
          return;
        }

        window.history.pushState(null, '', path);
        window.dispatchEvent(new Event('location-changed'));
      });
    });
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
