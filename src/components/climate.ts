import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { DEVICE_SELECT_STYLE, deviceStatusClass, hassLocalizeChain, makeDoService, renderDeviceUnavailableCard, renderTempStepper } from './device-shell';

const HVAC_ORDER = ['auto', 'cool', 'heat', 'fan_only', 'dry', 'off'];

function lab(mode: string, hass: HomeAssistant): string {
  return hassLocalizeChain(hass, [`component.climate.entity_component._.state.${mode}`, `component.climate.state.${mode}`], mode);
}
function fanLab(mode: string, hass: HomeAssistant): string {
  return hassLocalizeChain(hass, [
    `component.climate.entity_component._.state_attributes.fan_mode.state.${mode}`,
    `component.climate.fan.${mode}`,
    `component.climate.state.${mode}`,
  ], mode);
}

export function renderClimateCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, 'climate');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return renderDeviceUnavailableCard(config, hass, device, language, onHandleAction, 'climate');
  }

  const a = stateObj.attributes || {};
  const validHvacModes = new Set(['off', 'auto', 'cool', 'heat', 'dry', 'fan_only', 'heat_cool']);
  const hvacMode = (a.hvac_mode as string) || (validHvacModes.has(stateObj.state) ? stateObj.state : 'off');
  const currentTemp = a.current_temperature as number | undefined;
  const targetTemp = a.temperature as number | undefined;
  const hvacModes = ((a.hvac_modes as string[]) || []).filter(m => m !== 'heat_cool')
    .sort((x, y) => HVAC_ORDER.indexOf(x) - HVAC_ORDER.indexOf(y));
  const fanMode = a.fan_mode as string | undefined;
  const fanModes = (a.fan_modes as string[]) || [];
  const minT = (a.min_temp as number) ?? 16;
  const maxT = (a.max_temp as number) ?? 30;
  const step = (a.target_temp_step as number) ?? 1;

  const showFan = fanModes.length > 1;
  const statusClass = deviceStatusClass(stateObj.state, stateObj.state !== 'unavailable', device.color);
  const stateForTime = hass.states?.[device.entityId];
const lastTime = stateForTime?.last_changed
  ? formatRelativeTime(new Date(stateForTime.last_changed), language)
  : undefined;

  const doService = makeDoService(hass, 'climate', device.entityId);

  const adjustTemp = (next: number) => {
    const cur = targetTemp ?? minT;
    if (next !== cur) doService('set_temperature', { temperature: next });
  };

  const tempDisplay = (v?: number) => v !== undefined ? `${Math.round(v)}°` : '--';

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status" style="font-size:var(--sp-font-4xs);font-weight:700">${currentTemp !== undefined ? tempDisplay(currentTemp) : lab(hvacMode, hass)}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime || device.subtitle}</p>
      </div>
      <div class="control-row" style="gap:2px" @click=${(e: Event) => e.stopPropagation()}>
        ${renderTempStepper({ value: targetTemp, min: minT, max: maxT, step, display: tempDisplay, onAdjust: adjustTemp, minSpanWidth: '20px' })}
        <select class="filter-select" style=${DEVICE_SELECT_STYLE} @change=${(e: Event) => { e.stopPropagation(); doService('set_hvac_mode', { hvac_mode: (e.target as HTMLSelectElement).value }); }} @click=${(e: Event) => e.stopPropagation()}>
          ${hvacModes.map(m => html`<option value=${m} ?selected=${m === hvacMode}>${lab(m, hass)}</option>`)}
        </select>
        ${showFan ? html`
        <select class="filter-select" style=${DEVICE_SELECT_STYLE} @change=${(e: Event) => { e.stopPropagation(); doService('set_fan_mode', { fan_mode: (e.target as HTMLSelectElement).value }); }} @click=${(e: Event) => e.stopPropagation()}>
          ${fanModes.map(m => html`<option value=${m} ?selected=${m === fanMode}>${fanLab(m, hass)}</option>`)}
        </select>` : ''}
      </div>
    </button>
  `;
}