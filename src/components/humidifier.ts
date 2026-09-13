import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { DEVICE_SELECT_STYLE, DEVICE_SWITCH_STYLE, deviceStatusClass, hassLocalizeChain, makeDoService, renderDeviceUnavailableCard } from './device-shell';

export function renderHumidifierCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, 'humidifier');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return renderDeviceUnavailableCard(config, hass, device, language, onHandleAction, 'humidifier');
  }

  const a = stateObj.attributes || {};
  const isOn = stateObj.state === 'on';
  const isDehumidifier = (a.device_class as string) === 'dehumidifier';
  const targetHumidity = (a.target_humidity as number | undefined) ?? (a.humidity as number | undefined);
  const currentHumidity = a.current_humidity as number | undefined;
  const minH = (a.min_humidity as number) ?? 0;
  const maxH = (a.max_humidity as number) ?? 100;
  const step = (a.target_humidity_step as number) ?? 1;
  const mode = a.mode as string | undefined;
  const modes = (a.available_modes as string[]) || [];
  const action = a.action as string | undefined;

  const statusClass = deviceStatusClass(stateObj.state, isOn, device.color);
  const stateLabel = deviceStateLabel(stateObj.state, language, hass, 'humidifier');
  const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;

  const actionLabel = (() => {
    if (!isOn) return undefined;
    if (action === 'humidifying') return hassLocalizeChain(hass, [`component.humidifier.entity_component._.state.humidifying`, `component.humidifier.state.humidifying`], 'Humidifying');
    if (action === 'drying') return hassLocalizeChain(hass, [`component.humidifier.entity_component._.state.drying`, `component.humidifier.state.drying`], 'Drying');
    if (action === 'idle' || action === 'off' || !action) return isDehumidifier
      ? hassLocalizeChain(hass, [`component.humidifier.entity_component._.state.drying`, `component.humidifier.state.drying`], 'Drying')
      : hassLocalizeChain(hass, [`component.humidifier.entity_component._.state.humidifying`, `component.humidifier.state.humidifying`], 'Humidifying');
    return undefined;
  })();

  const statusText = isOn && currentHumidity !== undefined ? `${Math.round(currentHumidity)}%` : stateLabel;
  const mutedText = actionLabel || lastTime;

  const doService = makeDoService(hass, 'humidifier', device.entityId);

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top" @click=${(e: Event) => { e.stopPropagation(); onHandleAction(device.entityId, 'more-info'); }}>
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${statusText}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${mutedText}</p>
      </div>
      <div class="control-row" style="gap:4px" @click=${(e: Event) => e.stopPropagation()}>
        ${isOn && targetHumidity !== undefined ? html`
        <div class="temp-group" style="display:flex;align-items:center;gap:1px;flex-shrink:0">
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e: Event) => { e.stopPropagation(); const next = Math.max(minH, targetHumidity - step); doService('set_humidity', { humidity: next }); }}><ha-icon icon="mdi:minus" style="--mdc-icon-size:14px"></ha-icon></div>
          <span style="font-weight:700;font-size:var(--sp-font-2xs);min-width:24px;text-align:center">${Math.round(targetHumidity)}%</span>
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e: Event) => { e.stopPropagation(); const next = Math.min(maxH, targetHumidity + step); doService('set_humidity', { humidity: next }); }}><ha-icon icon="mdi:plus" style="--mdc-icon-size:14px"></ha-icon></div>
        </div>` : ''}
        ${isOn && modes.length > 0 ? html`
        <select class="filter-select" style=${DEVICE_SELECT_STYLE} @change=${(e: Event) => { e.stopPropagation(); doService('set_mode', { mode: (e.target as HTMLSelectElement).value }); }} @click=${(e: Event) => e.stopPropagation()}>
          ${modes.map(m => html`<option value=${m} ?selected=${m === mode}>${hassLocalizeChain(hass, [`component.humidifier.entity_component._.state.${m}`, `component.humidifier.state.${m}`], m)}</option>`)}
        </select>` : ''}
        <ha-control-switch .checked=${isOn} style="${DEVICE_SWITCH_STYLE};margin-left:auto" @change=${(e: Event) => { e.stopPropagation(); doService(isOn ? 'turn_off' : 'turn_on', {}); }} @click=${(e: Event) => e.stopPropagation()} .label=${device.name}></ha-control-switch>
      </div>
    </button>
  `;
}
