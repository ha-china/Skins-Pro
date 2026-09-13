import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { DEVICE_SELECT_STYLE, DEVICE_SWITCH_STYLE, deviceStatusClass, makeDoService, renderDeviceUnavailableCard } from './device-shell';

export function renderVacuumCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, 'vacuum');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return renderDeviceUnavailableCard(config, hass, device, language, onHandleAction, 'vacuum');
  }

  const state = stateObj.state;
  const a = stateObj.attributes || {};
  const fanSpeed = a.fan_speed as string | undefined;
  const fanSpeedList = (a.fan_speed_list as string[]) || [];
  const batteryLevel = a.battery_level as number | undefined;

  const isActive = state === 'cleaning' || state === 'returning';
  const isPaused = state === 'paused';

  const statusClass = deviceStatusClass(state, isActive, device.color);
  const statusText = batteryLevel !== undefined ? `${batteryLevel}%` : deviceStateLabel(state, language, hass, 'vacuum');
  const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;
  const mutedText = batteryLevel !== undefined ? deviceStateLabel(state, language, hass, 'vacuum') : (lastTime || device.subtitle);

  const doService = makeDoService(hass, 'vacuum', device.entityId);
  const setFanSpeed = (speed: string) => {
    void hass.callService('vacuum', 'set_fan_speed', { entity_id: device.entityId, fan_speed: speed });
  };

  const btnStyle = 'width:32px;height:32px;padding:0;flex-shrink:0';

  const startBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${hass.localize?.('ui.card.vacuum.start')} @click=${(e: Event) => { e.stopPropagation(); doService('start'); }}><ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon></div>`;
  const pauseBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${hass.localize?.('ui.card.vacuum.pause')} @click=${(e: Event) => { e.stopPropagation(); doService('pause'); }}><ha-icon icon="mdi:pause" style="--mdc-icon-size:14px"></ha-icon></div>`;
  const dockBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${hass.localize?.('ui.card.vacuum.return_to_base')} @click=${(e: Event) => { e.stopPropagation(); doService('return_to_base'); }}><ha-icon icon="mdi:home" style="--mdc-icon-size:14px"></ha-icon></div>`;
  const locateBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${hass.localize?.('ui.card.vacuum.locate')} @click=${(e: Event) => { e.stopPropagation(); doService('locate'); }}><ha-icon icon="mdi:map-marker" style="--mdc-icon-size:14px"></ha-icon></div>`;

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
        ${fanSpeedList.length > 0 ? html`
        <select class="filter-select" style=${DEVICE_SELECT_STYLE} @change=${(e: Event) => { e.stopPropagation(); setFanSpeed((e.target as HTMLSelectElement).value); }} @click=${(e: Event) => e.stopPropagation()}>
          ${fanSpeedList.map(s => html`<option value=${s} ?selected=${s === fanSpeed}>${s}</option>`)}
        </select>` : ''}
        ${isActive ? pauseBtn : startBtn}
        ${(isActive || isPaused) ? dockBtn : ''}
        ${locateBtn}
        <ha-control-switch .checked=${isActive} style="${DEVICE_SWITCH_STYLE};margin-left:auto" @change=${(e: Event) => { e.stopPropagation(); doService(isActive ? 'pause' : 'start'); }} @click=${(e: Event) => e.stopPropagation()} .label=${device.name}></ha-control-switch>
      </div>
    </button>
  `;
}
