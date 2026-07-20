import type { HomeAssistant, DashboardConfig, TranslationKey } from '../types';
import type { Language } from '../i18n';
import { SKINS, DEFAULT_SKIN, SKIN_STRINGS, SKIN_ICON_MAPS } from '../skins/generated';
import { DEFAULT_ASSETS } from '../config';
import { STRINGS } from '../i18n';

export const BUNDLED_SKINS: readonly string[] = SKINS;

interface SkinMetadata {
  strings: Record<string, string>;
  iconMap: Record<string, string>;
  darkMode: boolean;
}

const SKIN_METADATA_CACHE: Record<string, SkinMetadata> = {
  [DEFAULT_SKIN]: {
    strings: (SKIN_STRINGS[DEFAULT_SKIN] || {}) as Record<string, string>,
    iconMap: (SKIN_ICON_MAPS[DEFAULT_SKIN] || {}) as Record<string, string>,
    darkMode: Boolean((SKIN_STRINGS[DEFAULT_SKIN] as Record<string, unknown>)?.dark_mode),
  },
};
const SKIN_METADATA_LOADING = new Set<string>();

export async function loadSkinMetadata(skin: string): Promise<boolean> {
  if (SKIN_METADATA_CACHE[skin]) return false;
  if (SKINS.includes(skin)) return false;
  if (SKIN_METADATA_LOADING.has(skin)) return false;
  SKIN_METADATA_LOADING.add(skin);
  try {
    const res = await fetch(`/local/skins-pro/${skin}/strings.json?v=${Date.now()}`);
    if (!res.ok) return false;
    const data = (await res.json()) as Record<string, unknown>;
    SKIN_METADATA_CACHE[skin] = {
      strings: data as Record<string, string>,
      iconMap: (data.icon_map as Record<string, string>) || {},
      darkMode: Boolean((data as Record<string, unknown>).dark_mode),
    };
    return true;
  } catch {
    return false;
  } finally {
    SKIN_METADATA_LOADING.delete(skin);
  }
}

export function clearSkinMetadata(skin: string): void {
  if (skin === DEFAULT_SKIN) return;
  delete SKIN_METADATA_CACHE[skin];
}

export type { Language } from '../i18n';
export type { TranslationKey } from '../types';

export * from './actions';
export * from './breakpoints';

export function normalizeLanguage(language?: string): Language {
  if ((language || '').toLowerCase().startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
}

export function localizedText(
  base: string | undefined,
  zh: string | undefined,
  en: string | undefined,
  language: Language,
  fallback = '',
): string {
  if (language === 'zh-CN') {
    return zh || base || en || fallback;
  }
  return en || base || zh || fallback;
}

export function deviceStateLabel(
  state: string,
  language: Language,
  hass?: HomeAssistant,
  domain?: string,
): string {
  if (hass && state && hass.localize) {
    const keys: string[] = [];
    if (domain) keys.push(`component.${domain}.entity_component._.state.${state}`);
    if (domain) keys.push(`component.${domain}.state.${state}`);
    keys.push(`state.default.${state}`);
    if (domain) keys.push(`state_badge.${domain}.${state}`);
    for (const key of keys) {
      const s = hass.localize(key);
      if (s) return s;
    }
  }
  return formatRawState(state, language);
}

function formatRawState(raw: string, language: Language): string {
  const num = Number(raw);
  if (Number.isFinite(num)) {
    return parseFloat(num.toFixed(2)).toString();
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
      if (isDateOnly) {
        return new Intl.DateTimeFormat(language, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
      }
      return new Intl.DateTimeFormat(language, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).format(d);
    }
  }
  return raw.replace(/\.\d+/, '') || '--';
}

export function getTranslate(language: Language): (key: TranslationKey) => string {
  return (key: TranslationKey): string => STRINGS[language][key];
}

export function t(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let str: string = STRINGS[language][key];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
    }
  }
  return str;
}

export function defaultResourceBasePath(): string {
  try {
    return new URL(DEFAULT_SKIN, import.meta.url).toString();
  } catch {
    return `/local/community/skins-pro/${DEFAULT_SKIN}`;
  }
}

export function bundledAssetsRootPath(): string {
  return defaultResourceBasePath().replace(/\/[^/]+\/?$/, '');
}

export function bundledSkinBasePath(skin: string): string {
  return `${bundledAssetsRootPath().replace(/\/$/, '')}/${skin}`;
}

export function formatNumber(value: string, decimals: number): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(decimals) : '--';
}

export function stateValue(hass: HomeAssistant | undefined, entityId?: string, _language?: Language): string {
  if (!entityId || !hass) {
    return '';
  }
  const raw = hass.states[entityId]?.state || '';
  if (!raw) return raw;
  const num = Number(raw);
  if (Number.isFinite(num)) {
    return parseFloat(num.toFixed(2)).toString();
  }
  return raw;
}

export function timeText(hass: HomeAssistant | undefined, language: Language): string {
  const locale = hass?.locale?.language || language;
  const fmt24 = hass?.locale?.time_format !== '12h';
  return new Intl.DateTimeFormat(locale, { hour: fmt24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !fmt24 }).format(new Date());
}

export function dateText(hass: HomeAssistant | undefined, language: Language): string {
  const locale = hass?.locale?.language || language;
  const fmt = hass?.locale?.date_format;
  let opts: Intl.DateTimeFormatOptions;
  switch (fmt) {
    case 'MDY': opts = { month: '2-digit', day: '2-digit', year: 'numeric', weekday: 'short' }; break;
    case 'YMD': opts = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }; break;
    default: opts = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }; break;
  }
  return new Intl.DateTimeFormat(locale, opts).format(new Date());
}

export function formatRelativeTime(isoDate: Date, language: Language): string {
  const now = new Date();
  const diff = now.getTime() - isoDate.getTime();
  const seconds = Math.floor(diff / 1000);
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  if (seconds < 0) return rtf.format(0, 'seconds');
  if (seconds < 60) return rtf.format(-seconds, 'seconds');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, 'minutes');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hours');
  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(-days, 'days');
  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, 'months');
  const years = Math.floor(days / 365);
  return rtf.format(-years, 'years');
}

export function weatherIcon(state: string): string {
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

export function iconForDomain(domain: string): string {
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

export function assetKeyForDomain(skin: string, domain: string): string {
  const map = SKIN_METADATA_CACHE[skin]?.iconMap || {};
  if (map[domain]) {
    return map[domain]!;
  }
  const pool = ['light', 'switch', 'button', 'climate', 'water_heater', 'humidifier', 'fan', 'speaker', 'remote', 'lock', 'camera', 'cover', 'valve', 'automation', 'media_player', 'vacuum', 'sensor', 'binary_sensor', 'update', 'device_tracker', 'person'];
  let hash = 0;
  for (let i = 0; i < domain.length; i += 1) {
    hash = ((hash << 5) - hash + domain.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length]!;
}

export function selectedSkin(config?: DashboardConfig): string {
  const configuredSkin = config?.resource_pack?.skin;
  if (configuredSkin) {
    return configuredSkin;
  }
  const configuredBasePath = config?.resource_pack?.base_path || '';
  const matchedSkin = BUNDLED_SKINS.find((skin) => configuredBasePath === bundledSkinBasePath(skin) || configuredBasePath.endsWith(`/${skin}`));
  return matchedSkin || DEFAULT_SKIN;
}

export function skinSupportsDark(skin: string): boolean {
  return SKIN_METADATA_CACHE[skin]?.darkMode ?? false;
}
let _darkAssetSkin: string | null = null;
export function setDarkAssetSkin(skin: string | null): void {
  _darkAssetSkin = skin && skinSupportsDark(skin) ? skin : null;
}

export function assetUrl(config?: DashboardConfig, key?: string): string {
  if (!key) return '';
  const skin = selectedSkin(config);
  const configuredBasePath = config?.resource_pack?.base_path || '';
  let basePath = configuredBasePath === '__AUTO__' || !configuredBasePath
    ? bundledSkinBasePath(skin)
    : configuredBasePath;
  if (!SKINS.includes(skin)) {
    basePath = `/local/skins-pro/${skin}/`;
  }
  const asset = config?.resource_pack?.assets?.[key] || DEFAULT_ASSETS[key] || '';
  if (!asset) return '';
  let finalAsset = asset;
  if (_darkAssetSkin && skin === _darkAssetSkin && key !== 'theme_css' && !/^https?:\/\//.test(asset) && !asset.startsWith('/')) {
    finalAsset = asset.replace(/(\.[^.]+)$/, '-dark$1');
  }
  if (/^https?:\/\//.test(finalAsset) || finalAsset.startsWith('/')) return finalAsset;
  return `${basePath.replace(/\/$/, '')}/${finalAsset}`;
}

export function assetHref(config?: DashboardConfig, key?: string): string {
  const url = assetUrl(config, key);
  if (!url) return '';
  if (key !== 'theme_css') return url;
  const skin = selectedSkin(config);
  const cacheKey = encodeURIComponent(`${skin}|${config?.resource_pack?.base_path || '__AUTO__'}`);
  return `${url}${url.includes('?') ? '&' : '?'}skin=${cacheKey}`;
}

export function skinString(skin: string, key: string): string {
  const data = SKIN_METADATA_CACHE[skin]?.strings || SKIN_METADATA_CACHE[DEFAULT_SKIN]?.strings || {};
  return data[key] || '';
}

