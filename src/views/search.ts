import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { RenderedDevice } from '../types';
import type { RenderContext } from '../render/context';
import { renderDeviceCard } from '../components/device-card';
import { deviceTypeGroupKey, DEVICE_COLORS } from '../selectors/devices';
import { domainGroupLabel } from '../selectors/areas';

const SEARCH_DOMAINS = /^(light|switch|climate|media_player|fan|humidifier|water_heater|cover|valve|vacuum|input_boolean|lock|alarm_control_panel|sensor|binary_sensor)\./;

const RECENT_KEY = 'skins-pro-search-recent';
const RECENT_MAX = 10;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(entityId: string): void {
  const recent = loadRecent().filter((id) => id !== entityId);
  recent.unshift(entityId);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_MAX)));
  } catch { /* ignore */ }
}

let indexStatesRef: unknown;
let indexCache: RenderedDevice[] = [];

function buildSearchIndex(ctx: RenderContext): RenderedDevice[] {
  const hass = ctx.hass;
  if (!hass?.states) return [];

  const states = hass.states;
  if (states === indexStatesRef) return indexCache;
  indexStatesRef = states;

  let colorIdx = 0;
  const devices: RenderedDevice[] = [];

  for (const [entityId, stateObj] of Object.entries(states)) {
    if (!stateObj || !SEARCH_DOMAINS.test(entityId)) continue;
    if (stateObj.state === 'unavailable' || stateObj.state === 'unknown') continue;

    const domain = entityId.split('.')[0] || 'sensor';
    const attrs = stateObj.attributes as Record<string, unknown>;
    const name = String(attrs.friendly_name || entityId);
    const areaId = (attrs as { area_id?: string }).area_id || '';

    devices.push({
      entityId,
      name,
      subtitle: areaId || '',
      detail: domain,
      state: stateObj.state,
      icon: String(attrs.icon || ''),
      color: DEVICE_COLORS[colorIdx++ % DEVICE_COLORS.length]!,
    });
  }

  indexCache = devices;
  return devices;
}

function filterDevices(devices: RenderedDevice[], query: string, filter: string): RenderedDevice[] {
  let result = devices;

  if (filter !== 'all') {
    result = result.filter((d) => deviceTypeGroupKey(d.detail) === filter);
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.entityId.toLowerCase().includes(q) ||
      d.subtitle.toLowerCase().includes(q),
    );
  }

  return result;
}

export function renderSearchOverlay(
  ctx: RenderContext,
  query: string,
  filter: string,
  onQueryChange: (q: string) => void,
  onFilterChange: (f: string) => void,
): TemplateResult {
  const allDevices = buildSearchIndex(ctx);
  const filtered = filterDevices(allDevices, query, filter);

  const onDeviceAction = (entityId: string, action: string) => {
    saveRecent(entityId);
    ctx.onHandleAction(entityId, action);
  };

  const recentIds = loadRecent();
  const showRecent = !query.trim() && filter === 'all' && recentIds.length > 0;
  const recentDevices = showRecent
    ? recentIds
        .map((id) => allDevices.find((d) => d.entityId === id))
        .filter((d): d is RenderedDevice => Boolean(d))
    : [];

  const displayDevices = showRecent ? recentDevices : filtered;
  const isEmpty = displayDevices.length === 0;

  const groupCounts: Record<string, number> = {};
  for (const d of allDevices) {
    const g = deviceTypeGroupKey(d.detail);
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  }
  const chips = [
    { key: 'all', label: ctx.translate('searchAll'), count: allDevices.length },
    ...Object.entries(groupCounts)
      .filter(([key]) => key !== 'others')
      .sort(([, a], [, b]) => b - a)
      .map(([key, count]) => ({
        key,
        label: domainGroupLabel(key, ctx.hass, ctx.language),
        count,
      })),
  ];

  return html`
    <div
      class="sp-search-overlay"
      @click=${(e: Event) => { if (e.target === e.currentTarget) ctx.onCloseSearch(); }}
    >
      <div class="sp-search-panel">
        <div class="sp-search-header">
          <ha-icon icon="mdi:magnify" style="color:var(--sp-text-primary,#fff);--mdc-icon-size:24px;flex-shrink:0;"></ha-icon>
          <input
            type="text"
            class="sp-search-input"
            .value=${query}
            placeholder=${ctx.translate('searchPlaceholder')}
            aria-label=${ctx.translate('searchPlaceholder')}
            @input=${(e: Event) => onQueryChange((e.target as HTMLInputElement).value)}
            autofocus
          >
          <button
            type="button"
            class="sp-search-close"
            aria-label="Close"
            @click=${() => ctx.onCloseSearch()}
          ><ha-icon icon="mdi:close" style="--mdc-icon-size:24px;"></ha-icon></button>
        </div>

        <div class="sp-search-chips">
          ${chips.map((chip) => html`
            <button
              type="button"
              class="sp-search-chip${filter === chip.key ? ' active' : ''}"
              @click=${() => onFilterChange(chip.key)}
            >${chip.label}<span class="sp-chip-count">${chip.count}</span></button>
          `)}
        </div>

        <div class="sp-search-results">
          ${showRecent && recentDevices.length > 0 ? html`
            <p style="grid-column:1/-1;color:var(--sp-text-secondary,rgba(255,255,255,0.5));font-size:13px;margin:0 0 12px 0;">${ctx.translate('searchRecent')}</p>
          ` : nothing}

          ${isEmpty ? html`
            <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--sp-text-secondary,rgba(255,255,255,0.4));">
              <ha-icon icon="mdi:magnify-close" style="--mdc-icon-size:48px;opacity:0.3;"></ha-icon>
              <p style="margin:12px 0 0 0;font-size:15px;">${ctx.translate('searchNoResults')}</p>
            </div>
          ` : displayDevices.map((device) => renderDeviceCard(ctx.config, ctx.hass, device, ctx.language, onDeviceAction))}
        </div>
      </div>
    </div>
  `;
}
