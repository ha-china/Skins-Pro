import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type {
  AreaRegistryEntry,
  DashboardConfig,
  DeviceRegistryEntry,
  EnergySourceData,
  EntityRegistryEntry,
  FloorRegistryEntry,
  HomeAssistant,
  TranslationKey,
  ViewName,
  WeatherForecastDay,
} from '../types';
import type { Language } from '../i18n';
import { assetUrl } from '../utils';

export interface RenderContext {
  config: DashboardConfig;
  hass: HomeAssistant;
  language: Language;
  translate: (key: TranslationKey) => string;

  areas?: AreaRegistryEntry[];
  entityRegistry?: EntityRegistryEntry[];
  deviceRegistry?: DeviceRegistryEntry[];
  floors?: FloorRegistryEntry[];

  view: ViewName;
  deviceGrouping: 'area' | 'domain';
  filterRoom: string;
  filterType: string;
  hideUnassigned: boolean;
  selectedFloor: string;
  weatherForecast?: WeatherForecastDay[];
  energyHistory?: number[];
  energyYesterday?: string;
  energySources: EnergySourceData[];

  onNavigate: (target: string) => void;
  onNavigatePath: (path: string) => void;
  onRunScene: (entityId: string) => void;
  onToggleEntity: (entityId: string) => void;
  onHandleAction: (entityId: string, action: string) => void;
  onBatchControl: (state: 'on' | 'off') => void;
  onToggleFullscreen: () => void;
  onToggleSidebar: () => void;
  onWelcomeClick: () => void;
  sidebarHidden: boolean;
  onMoreInfo: (entityId: string) => void;
  onTurnOffAreaType: (entityIds: string[]) => void;
  onRoomSelect: (roomName: string) => void;

  searchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;

  setDeviceGrouping: (g: 'area' | 'domain') => void;
  setFilterRoom: (r: string) => void;
  setFilterType: (t: string) => void;
  setHideUnassigned: (h: boolean) => void;
  setSelectedFloor: (f: string) => void;

  resolvedTheme: 'light' | 'dark';
}

export function renderImage(
  config: DashboardConfig | undefined,
  key: string,
  alt: string,
  className?: string,
): TemplateResult | typeof nothing {
  const url = assetUrl(config, key);
  if (!url) return nothing;
  return html`<img class=${className || nothing} alt=${alt} src=${url}>`;
}

export function userAvatarUrl(hass: HomeAssistant | undefined): string {
  const userId = hass?.user?.id;
  if (!userId || !hass) return '';
  const person = Object.values(hass.states).find(
    (s) => s && s.entity_id.startsWith('person.') && (s.attributes as Record<string, unknown>).user_id === userId,
  );
  return (person?.attributes?.entity_picture as string | undefined) || '';
}

export function renderUserAvatar(
  config: DashboardConfig | undefined,
  hass: HomeAssistant | undefined,
  className: string,
): TemplateResult | typeof nothing {
  const url = userAvatarUrl(hass) || assetUrl(config, 'avatar');
  if (!url) return nothing;
  return html`<img class=${className} alt="Avatar" src=${url}>`;
}
