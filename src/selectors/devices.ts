import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  HomeAssistant,
  RenderedDevice,
} from '../types';
import { iconForDomain } from '../utils';
import { areaNameForEntity } from './areas';

const DEVICE_COLORS: RenderedDevice['color'][] = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];

const PREFERRED_DOMAINS = /^(light|switch|climate|media_player|lock|cover|fan|valve|input_boolean|humidifier|water_heater|vacuum)\./;

export interface DeviceFilters {
  filterRoom?: string;
  filterType?: string;
  hideUnassigned?: boolean;
}

export function getRealDevicesForRender(
  hass: HomeAssistant | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
  entityRegistry: EntityRegistryEntry[] | undefined,
  areas: AreaRegistryEntry[] | undefined,
  filters: DeviceFilters = {},
): RenderedDevice[] {
  if (!deviceRegistry || !entityRegistry || !hass) return [];

  const usedEntityIds = new Set<string>();
  const rendered: RenderedDevice[] = [];

  const renderEntry = (
    entityId: string,
    index: number,
  ): RenderedDevice | undefined => {
    if (usedEntityIds.has(entityId)) return undefined;
    if (entityId.startsWith('update.') || entityId.startsWith('device_tracker.')) return undefined;

    const stateObj = hass!.states[entityId];
    const state = stateObj?.state || 'unknown';
    const domain = entityId.split('.')[0] || 'sensor';
    const icon = String(stateObj?.attributes?.icon || iconForDomain(domain));
    const name = String(stateObj?.attributes?.friendly_name || entityId);
    if (/pre-?release/i.test(name)) return undefined;
    const subtitle = areaNameForEntity(entityId, entityRegistry, deviceRegistry, areas) || '';
    const detail = domain || '--';

    usedEntityIds.add(entityId);
    return {
      entityId,
      name,
      subtitle,
      detail,
      state,
      icon,
      color: DEVICE_COLORS[index % DEVICE_COLORS.length]!,
    };
  };

  for (const device of deviceRegistry) {
    if (device.disabled_by) continue;
    const entities = entityRegistry
      .filter((entry) => entry.device_id === device.id && !entry.hidden_by && !entry.disabled_by)
      .map((entry) => entry.entity_id);
    if (entities.length === 0) continue;

    const nonUpdateEntities = entities.filter((id) => !id.startsWith('update.') && !id.startsWith('device_tracker.'));
    if (nonUpdateEntities.length === 0) continue;
    const preferredEntity = nonUpdateEntities.find((id) => PREFERRED_DOMAINS.test(id)) || nonUpdateEntities[0];
    if (!preferredEntity) continue;

    const renderedDevice = renderEntry(preferredEntity, rendered.length);
    if (renderedDevice) rendered.push(renderedDevice);
  }

  // Include standalone entities (e.g. KNX) that belong to no device
  const deviceIds = new Set(deviceRegistry.filter((d) => !d.disabled_by).map((d) => d.id));
  const orphanEntities = entityRegistry
    .filter((entry) => {
      if (entry.hidden_by || entry.disabled_by) return false;
      if (!entry.device_id) return true;
      return !deviceIds.has(entry.device_id);
    })
    .filter((entry) => PREFERRED_DOMAINS.test(entry.entity_id) || entry.entity_id.startsWith('binary_sensor.'))
    .slice(0, 300);

  for (const entry of orphanEntities) {
    const renderedDevice = renderEntry(entry.entity_id, rendered.length);
    if (renderedDevice) rendered.push(renderedDevice);
  }

  return rendered.filter((d) => {
    if (filters.filterRoom && d.subtitle !== filters.filterRoom) return false;
    if (filters.filterType && deviceTypeGroupKey(d.detail) !== filters.filterType) return false;
    if (filters.hideUnassigned && !d.subtitle) return false;
    return true;
  });
}

export function deviceTypeGroupKey(detail: string): string {
  return DEVICE_DOMAIN_GROUP[detail] || 'others';
}

export function getDeviceRooms(devices: RenderedDevice[]): string[] {
  return [...new Set(devices.map((d) => d.subtitle).filter(Boolean))].sort();
}

export function getDeviceTypes(devices: RenderedDevice[]): string[] {
  return [...new Set(devices.map((d) => deviceTypeGroupKey(d.detail)))].sort();
}

const DEVICE_DOMAIN_GROUP: Record<string, string> = {
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
