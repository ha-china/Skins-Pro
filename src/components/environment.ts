import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type {
  AreaRegistryEntry,
  DashboardConfig,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  EnvironmentMetricConfig,
  FloorRegistryEntry,
  HomeAssistant,
} from '../types';
import type { Language } from '../i18n';
import { stateValue } from '../utils';
import { domainGroupLabel } from '../selectors/areas';

export function renderEnvironment(
  config: DashboardConfig,
  hass: HomeAssistant,
  areas: AreaRegistryEntry[] | undefined,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
  floors: FloorRegistryEntry[] | undefined,
  language: Language,
): TemplateResult[] {
  const selectedMetrics = config.home_selection?.environment || [];
  const configuredMetrics = config.environment || [];
  const metrics = (selectedMetrics.length > 0
    ? selectedMetrics.map((entityId) => {
      const configured = configuredMetrics.find((metric) => metric.entity === entityId);
      if (configured) return configured;

      const state = hass.states[entityId];
      const deviceClass = String(state?.attributes?.device_class || '').toLowerCase();
      const label = String(state?.attributes?.friendly_name || entityId);
      const unit = String(state?.attributes?.unit_of_measurement || '');
      const variant: EnvironmentMetricConfig['variant'] = deviceClass === 'temperature' ? 'temp' : (deviceClass === 'humidity' ? 'hum' : 'pm');
      return { entity: entityId, label, unit, variant };
    })
    : configuredMetrics).slice(0, config.home_limits!.environment!);

  if (floors && floors.length > 1 && entityRegistry && areas) {
    const areaFloorLookup = new Map<string, string>();
    for (const area of areas) {
      const fid = (area as AreaRegistryEntry & { floor_id?: string | null }).floor_id;
      if (fid) areaFloorLookup.set(area.area_id, fid);
    }
    const entityFloorLookup = new Map<string, string>();
    for (const entry of entityRegistry) {
      if (entry.hidden_by || entry.disabled_by) continue;
      const directAreaId = entry.area_id || undefined;
      const areaId = directAreaId || deviceRegistry?.find((d) => d.id === entry.device_id)?.area_id || undefined;
      if (areaId && areaFloorLookup.has(areaId)) {
        entityFloorLookup.set(entry.entity_id, areaFloorLookup.get(areaId)!);
      }
    }
    const byFloor = new Map<string, EnvironmentMetricConfig[]>();
    const orphanMetrics: EnvironmentMetricConfig[] = [];
    for (const metric of metrics) {
      const floorId = entityFloorLookup.get(metric.entity);
      if (floorId) {
        const list = byFloor.get(floorId) || [];
        list.push(metric);
        byFloor.set(floorId, list);
      } else {
        orphanMetrics.push(metric);
      }
    }
    const rows: TemplateResult[] = [];
    for (const floor of floors) {
      const floorMetrics = byFloor.get(floor.floor_id);
      if (!floorMetrics || floorMetrics.length === 0) continue;
      rows.push(html`<div class="env-floor-header">${floor.name}</div>`);
      for (const metric of floorMetrics) {
        rows.push(renderEnvRow(hass, metric, language));
      }
    }
    if (orphanMetrics.length > 0) {
      rows.push(html`<div class="env-floor-header">${domainGroupLabel('others', hass, language)}</div>`);
      for (const metric of orphanMetrics) {
        rows.push(renderEnvRow(hass, metric, language));
      }
    }
    return rows;
  }

  return metrics.map((metric) => renderEnvRow(hass, metric, language));
}

function renderEnvRow(hass: HomeAssistant, metric: EnvironmentMetricConfig, language: Language): TemplateResult {
  const state = hass.states[metric.entity];
  const name = String(state?.attributes?.friendly_name || '') || metric.label || metric.entity;
  return html`
    <div class="env-row">
      ${state ? html`<div class="dot ${metric.variant || 'temp'}">${metric.icon ? html`<ha-icon icon=${metric.icon}></ha-icon>` : html`<ha-state-icon .stateObj=${state}></ha-state-icon>`}</div>` : nothing}
      <div class="muted">${name}</div>
      <div class="env-value">${stateValue(hass, metric.entity, language) || '--'}${metric.unit || ''}</div>
    </div>
  `;
}
