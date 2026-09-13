import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { renderClimateCard } from './climate';
import { renderLightCard } from './light';
import { renderFanCard } from './fan';
import { renderHumidifierCard } from './humidifier';
import { renderVacuumCard } from './vacuum';
import { renderWaterHeaterCard } from './water-heater';
import { renderAlarmControlPanelCard } from './alarm-control-panel';
import { CONTROLLABLE_DOMAINS } from '../selectors/domains';

export { CONTROLLABLE_DOMAINS };

export function deviceLastChanged(
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
): string | undefined {
  const domain = device.entityId.split('.')[0];
  const stateObj = hass.states?.[device.entityId];
  if (domain === 'automation') {
    return stateObj?.attributes?.last_triggered
      ? formatRelativeTime(new Date(stateObj.attributes.last_triggered as string), language)
      : undefined;
  }
  if (domain === 'scene') {
    return stateObj?.state && stateObj.state !== 'unavailable' && stateObj.state !== 'unknown'
      ? formatRelativeTime(new Date(stateObj.state), language)
      : undefined;
  }
  if (stateObj) {
    return formatRelativeTime(new Date(stateObj.last_changed), language);
  }
  return undefined;
}

export function renderDeviceCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
  showDomain = false,
): TemplateResult {
  const isClimate = device.detail === 'climate';
  if (isClimate) {
    return renderClimateCard(config, hass, device, language, onHandleAction);
  }

  const isLight = device.detail === 'light';
  if (isLight) {
    return renderLightCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'fan') {
    return renderFanCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'humidifier') {
    return renderHumidifierCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'vacuum') {
    return renderVacuumCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'water_heater') {
    return renderWaterHeaterCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'alarm_control_panel') {
    return renderAlarmControlPanelCard(config, hass, device, language, onHandleAction);
  }

  const stateLabel = deviceStateLabel(device.state, language, hass, device.detail);
  const active = ['on', 'playing', 'paused', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
  const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, device.entityId.split('.')[0] || 'sensor');
  const isMedia = device.detail === 'media_player';
  const isCover = device.detail === 'cover';
  const isValve = device.detail === 'valve';
  const action = isMedia ? 'play-pause' : (CONTROLLABLE_DOMAINS.has(device.detail) && !isCover && !isValve ? 'toggle' : 'more-info');
  const mediaState = isMedia ? hass.states?.[device.entityId] : undefined;
  const albumArt = isMedia ? (mediaState?.attributes?.entity_picture as string | undefined) : undefined;
  const vol = isMedia ? (mediaState?.attributes?.volume_level as number | undefined) : undefined;
  const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
  const hasPosSlider = isCover || isValve;
  const coverPos = hasPosSlider ? (hass.states?.[device.entityId]?.attributes?.current_position as number | undefined) : undefined;
  const lastTime = deviceLastChanged(hass, device, language);

  return html`
    <button class="device ${statusClass}" @click=${hasPosSlider ? undefined : () => onHandleAction(device.entityId, action)} style=${hasPosSlider ? 'cursor:default' : ''}>
      <div class="device-top">
        ${albumArt ? html`<img class="item-img" src=${albumArt} alt="">` : renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack"><div class="status">${stateLabel}</div></div>
      </div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${lastTime || device.subtitle}</p></div>
      <div class="control-row" style=${showDomain ? '' : 'justify-content:flex-end'}>${showDomain ? html`<span class="state-word">${device.detail}</span>` : ''}${action === 'play-pause' ? html`
        ${volPct !== undefined ? html`<ha-control-slider .value=${volPct} min="0" max="100" style="--control-slider-thickness:32px;--control-slider-border-radius:var(--sp-radius-pill)" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); hass.callService('media_player', 'volume_set', { entity_id: device.entityId, volume_level: (e.detail.value ?? 0) / 100 }); }} @click=${(e: Event) => e.stopPropagation()} class="media-vol-slider"></ha-control-slider>` : ''}
        <ha-icon role="button" aria-label="Previous track" icon="mdi:skip-previous" style="--mdc-icon-size:16px;color:var(--sp-text-primary);display:flex;cursor:pointer;opacity:.6" @click=${(e: Event) => { e.stopPropagation(); hass.callService('media_player', 'media_previous_track', { entity_id: device.entityId }); }}></ha-icon>
        <ha-icon icon=${device.state === 'playing' ? 'mdi:pause' : 'mdi:play'} class="media-toggle-icon"></ha-icon>
        <ha-icon role="button" aria-label="Next track" icon="mdi:skip-next" style="--mdc-icon-size:16px;color:var(--sp-text-primary);display:flex;cursor:pointer;opacity:.6" @click=${(e: Event) => { e.stopPropagation(); hass.callService('media_player', 'media_next_track', { entity_id: device.entityId }); }}></ha-icon>
      ` : (action === 'toggle' ? html`<ha-control-switch .checked=${active} style="--control-switch-thickness:24px;--control-switch-border-radius:var(--sp-radius-pill);--control-switch-padding:3px;width:44px;flex-shrink:0" @change=${(e: Event) => { e.stopPropagation(); onHandleAction(device.entityId, action); }} @click=${(e: Event) => e.stopPropagation()} .label=${device.name}></ha-control-switch>` : (hasPosSlider && coverPos !== undefined ? html`<ha-control-slider .value=${coverPos} min="0" max="100" style="--control-slider-thickness:32px;--control-slider-border-radius:var(--sp-radius-pill)" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); hass.callService(isValve ? 'valve' : 'cover', isValve ? 'set_valve_position' : 'set_cover_position', { entity_id: device.entityId, position: e.detail.value ?? 0 }); }} @click=${(e: Event) => e.stopPropagation()} class="media-vol-slider"></ha-control-slider>` : ''))}</div>
    </button>
  `;
}
