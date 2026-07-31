import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  HomeAssistant,
  TranslationKey,
} from '../types';
import type { Language } from '../i18n';
import { deviceStateLabel, formatNumber, stateValue, t } from '../utils';

const DOMAIN_GROUP_MAP: Record<string, string> = {
  light: 'lights',
  switch: 'switches',
  input_boolean: 'switches',
  button: 'switches',
  input_button: 'switches',
  climate: 'climate',
  fan: 'climate',
  humidifier: 'climate',
  water_heater: 'climate',
  cover: 'covers',
  valve: 'covers',
  media_player: 'media',
  lock: 'security',
  alarm_control_panel: 'security',
  vacuum: 'cleaning',
  lawn_mower: 'cleaning',
};

const GROUP_HA_PATH: Record<string, string> = {
  lights: 'domain.light',
  switches: 'domain.switch',
  climate: 'domain.climate',
  covers: 'domain.cover',
  media: 'domain.media_player',
  security: 'domain.alarm_control_panel',
  cleaning: 'domain.vacuum',
};

const GROUP_LABEL_KEY: Record<string, TranslationKey> = {
  lights: 'groupLights',
  switches: 'groupSwitches',
  climate: 'groupClimate',
  covers: 'groupCovers',
  media: 'groupMedia',
  security: 'groupSecurity',
  cleaning: 'groupCleaning',
  others: 'groupOthers',
};

export function domainGroupKey(domain: string): string {
  return DOMAIN_GROUP_MAP[domain] || 'others';
}

export function domainGroupLabel(groupKey: string, hass: HomeAssistant, language: Language): string {
  const haPath = GROUP_HA_PATH[groupKey];
  if (haPath) {
    const haLabel = hass.localize(haPath);
    if (haLabel) return haLabel;
  }
  const key = GROUP_LABEL_KEY[groupKey];
  return key ? t(language, key) : groupKey;
}

export interface AreaDeviceEntry {
  areaId: string;
  areaDeviceIds: Set<string>;
  entries: string[];
}

export function getAreaDeviceIds(areaId: string, deviceRegistry: DeviceRegistryEntry[]): Set<string> {
  return new Set(
    (deviceRegistry || [])
      .filter((d) => d.area_id === areaId && !d.disabled_by)
      .map((d) => d.id),
  );
}

export function getAreaEntries(
  areaId: string,
  entityRegistry: EntityRegistryEntry[],
  deviceRegistry: DeviceRegistryEntry[],
): string[] {
  if (!areaId) return [];
  const areaDeviceIds = getAreaDeviceIds(areaId, deviceRegistry);
  return (entityRegistry || [])
    .filter((entry) => {
      if (entry.hidden_by || entry.disabled_by) return false;
      return entry.area_id === areaId || (entry.device_id && areaDeviceIds.has(entry.device_id));
    })
    .map((e) => e.entity_id);
}

export function areaSummaryById(
  areaId: string,
  hass: HomeAssistant | undefined,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
  language: Language,
): string {
  if (!areaId) return 'Home Assistant Area';

  const entries = getAreaEntries(areaId, entityRegistry || [], deviceRegistry || []);
  if (entries.length === 0) {
    return t(language, 'noEntities');
  }

  const byClass = (cls: string) =>
    entries.find((eid) => hass?.states[eid]?.attributes?.device_class === cls);

  const parts: string[] = [];

  const presence = byClass('presence') || byClass('occupancy') || byClass('motion');
  if (presence) {
    const occupied = stateValue(hass, presence) === 'on';
    parts.push(deviceStateLabel(occupied ? 'on' : 'off', language, hass, 'binary_sensor'));
  }

  const temp = byClass('temperature');
  if (temp) {
    parts.push(`${formatNumber(stateValue(hass, temp, language), 1)}°C`);
  }

  const hum = byClass('humidity');
  if (hum) {
    parts.push(`${formatNumber(stateValue(hass, hum, language), 0)}%`);
  }

  if (!temp) {
    const illum = byClass('illuminance');
    if (illum) {
      parts.push(`${formatNumber(stateValue(hass, illum, language), 0)}lx`);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : '';
}

export function areaCounts(
  areaId: string,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
): { devices: number; entities: number } {
  if (!areaId) return { devices: 0, entities: 0 };

  const areaDevices = (deviceRegistry || [])
    .filter((d) => d.area_id === areaId && !d.disabled_by);
  const deviceIds = new Set(areaDevices.map((d) => d.id));

  const areaEntities = (entityRegistry || [])
    .filter((e) => {
      if (e.hidden_by || e.disabled_by) return false;
      return e.area_id === areaId || (e.device_id && deviceIds.has(e.device_id));
    });

  return { devices: deviceIds.size, entities: areaEntities.length };
}

const READONLY_DOMAINS = new Set(['sensor', 'binary_sensor', 'remote', 'automation']);

export interface AreaActiveGroup {
  domain: string;
  label: string;
  count: number;
  entityIds: string[];
}

export function areaActiveCounts(
  areaId: string,
  hass: HomeAssistant | undefined,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
  language: Language,
): AreaActiveGroup[] {
  if (!areaId || !hass) return [];

  const entries = getAreaEntries(areaId, entityRegistry || [], deviceRegistry || []);

  const active = entries.filter((eid) => {
    const state = hass?.states[eid]?.state;
    if (!state || state !== 'on') return false;
    const domain = eid.split('.')[0];
    return domain && !READONLY_DOMAINS.has(domain);
  });

  const byGroup = new Map<string, string[]>();
  for (const eid of active) {
    const domain = eid.split('.')[0] || 'other';
    const groupKey = domainGroupKey(domain);
    const list = byGroup.get(groupKey) || [];
    list.push(eid);
    byGroup.set(groupKey, list);
  }

  return [...byGroup.entries()]
    .map(([groupKey, entityIds]) => ({
      domain: groupKey,
      label: domainGroupLabel(groupKey, hass, language),
      count: entityIds.length,
      entityIds,
    }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);
}

export interface AreaSceneEntry {
  entity_id: string;
  name: string;
}

export function areaScenes(
  areaId: string,
  roomName: string | undefined,
  hass: HomeAssistant,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
): AreaSceneEntry[] {
  if (!hass) return [];

  const found = new Set<string>();
  const result: AreaSceneEntry[] = [];

  if (areaId && entityRegistry && deviceRegistry) {
    const areaDeviceIds = getAreaDeviceIds(areaId, deviceRegistry);

    for (const entry of entityRegistry) {
      if (entry.hidden_by || entry.disabled_by) continue;
      if (!entry.entity_id.startsWith('scene.')) continue;
      if (!(entry.area_id === areaId || (entry.device_id && areaDeviceIds.has(entry.device_id)))) continue;
      if (found.has(entry.entity_id)) continue;
      found.add(entry.entity_id);
      const state = hass.states[entry.entity_id];
      result.push({
        entity_id: entry.entity_id,
        name: String(state?.attributes?.friendly_name || entry.entity_id.split('.')[1] || entry.entity_id),
      });
      if (result.length >= 4) break;
    }
  }

  if (roomName && result.length < 4) {
    const roomLower = roomName.toLowerCase();

    for (const state of Object.values(hass.states)) {
      if (!state) continue;
      if (!state.entity_id.startsWith('scene.')) continue;
      if (found.has(state.entity_id)) continue;

      const sceneName = String(state.attributes?.friendly_name || state.entity_id.split('.')[1] || '');
      const sceneLower = sceneName.toLowerCase();
      const roomKey = roomLower.replace(/\s+/g, '_');

      if (sceneLower.includes(roomLower) || state.entity_id.toLowerCase().includes(roomKey)) {
        found.add(state.entity_id);
        result.push({ entity_id: state.entity_id, name: sceneName });
        if (result.length >= 4) break;
      }
    }
  }

  return result;
}

export function areaNameForEntity(
  entityId: string,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
  areas: AreaRegistryEntry[] | undefined,
): string {
  const entry = entityRegistry?.find((item) => item.entity_id === entityId);
  if (!entry) return '';
  const areaId = entry.area_id || deviceRegistry?.find((d) => d.id === entry.device_id)?.area_id || '';
  if (!areaId) return '';
  return areas?.find((area) => area.area_id === areaId)?.name || '';
}
