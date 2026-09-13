import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { DEVICE_SELECT_STYLE, DEVICE_SWITCH_STYLE, deviceStatusClass, hassLocalizeChain, makeDoService, renderDeviceUnavailableCard, renderTempStepper } from './device-shell';

export function renderWaterHeaterCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, 'water_heater');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return renderDeviceUnavailableCard(config, hass, device, language, onHandleAction, 'water_heater');
  }

  const a = stateObj.attributes || {};
  const isOff = stateObj.state === 'off';
  const currentTemp = a.current_temperature as number | undefined;
  const targetTemp = a.temperature as number | undefined;
  const operationMode = (a.operation_mode as string) || stateObj.state;
  const operationList = (a.operation_list as string[]) || [];
  const minT = (a.min_temp as number) ?? 43;
  const maxT = (a.max_temp as number) ?? 65;
  const step = (a.target_temp_step as number) ?? 1;

  const statusClass = deviceStatusClass(stateObj.state, stateObj.state !== 'unavailable', device.color);
  const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;

  const tempDisplay = (v?: number) => v !== undefined ? `${Math.round(v)}°` : '--';

  const doService = makeDoService(hass, 'water_heater', device.entityId);

  const adjustTemp = (next: number) => {
    const cur = targetTemp ?? minT;
    if (next !== cur) doService('set_temperature', { temperature: next });
  };

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status" style="font-size:var(--sp-font-4xs);font-weight:700">${currentTemp !== undefined ? tempDisplay(currentTemp) : deviceStateLabel(stateObj.state, language, hass, 'water_heater')}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" style="gap:2px" @click=${(e: Event) => e.stopPropagation()}>
        ${renderTempStepper({ value: targetTemp, min: minT, max: maxT, step, display: tempDisplay, onAdjust: adjustTemp, minSpanWidth: '22px' })}
        ${operationList.length > 1 ? html`
        <select class="filter-select" style=${DEVICE_SELECT_STYLE} @change=${(e: Event) => { e.stopPropagation(); doService('set_operation_mode', { operation_mode: (e.target as HTMLSelectElement).value }); }} @click=${(e: Event) => e.stopPropagation()}>
          ${operationList.map(m => html`<option value=${m} ?selected=${m === operationMode}>${hassLocalizeChain(hass, [`component.water_heater.entity_component._.state.${m}`, `component.water_heater.state.${m}`], m)}</option>`)}
        </select>` : ''}
        <ha-control-switch .checked=${!isOff} style="${DEVICE_SWITCH_STYLE};margin-left:auto" @change=${(e: Event) => { e.stopPropagation(); doService(isOff ? 'turn_on' : 'turn_off', {}); }} @click=${(e: Event) => e.stopPropagation()} .label=${device.name}></ha-control-switch>
      </div>
    </button>
  `;
}
