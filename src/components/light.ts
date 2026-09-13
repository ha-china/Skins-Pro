import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { DEVICE_SWITCH_STYLE, deviceStatusClass, makeDoService, renderDeviceUnavailableCard } from './device-shell';

const BRIGHTNESS_MODES = new Set(['brightness', 'color_temp', 'hs', 'rgb', 'rgbw', 'rgbww', 'xy']);
const COLOR_TEMP_MODES = new Set(['color_temp']);
const COLOR_RGB_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);
const DEFAULT_MIN_MIREDS = 153;
const DEFAULT_MAX_MIREDS = 500;

function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

function hsToRgb(hue: number, sat: number): [number, number, number] {
  const s = sat / 100;
  const v = 1;
  const c = v * s;
  const hp = hue / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp >= 0 && hp < 1) { r = c; g = x; b = 0; }
  else if (hp < 2) { r = x; g = c; b = 0; }
  else if (hp < 3) { r = 0; g = c; b = x; }
  else if (hp < 4) { r = 0; g = x; b = c; }
  else if (hp < 5) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const m = v - c;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [255, 255, 255];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function renderLightCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, 'light');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return renderDeviceUnavailableCard(config, hass, device, language, onHandleAction, 'light');
  }

  const a = stateObj.attributes || {};
  const isOn = stateObj.state === 'on';
  const brightness = a.brightness as number | undefined;
  const briPct = brightness !== undefined ? Math.round(brightness / 2.55) : undefined;
  const colorModes = (a.supported_color_modes as string[]) || [];
  const hasBrightness = colorModes.some(m => BRIGHTNESS_MODES.has(m));
  const hasColorTemp = colorModes.some(m => COLOR_TEMP_MODES.has(m));
  const hasRgbColor = colorModes.some(m => COLOR_RGB_MODES.has(m));
  const colorTemp = a.color_temp as number | undefined;
  const rgbColor = a.rgb_color as [number, number, number] | undefined;
  const hsColor = a.hs_color as [number, number] | undefined;
  const currentHex = rgbColor
    ? rgbToHex(rgbColor)
    : (hsColor ? rgbToHex(hsToRgb(hsColor[0], hsColor[1])) : '#ffffff');
  const minM = (a.min_mireds as number) ?? DEFAULT_MIN_MIREDS;
  const maxM = (a.max_mireds as number) ?? DEFAULT_MAX_MIREDS;

  const statusClass = deviceStatusClass(stateObj.state, isOn, device.color);
  const stateLabel = deviceStateLabel(stateObj.state, language, hass, 'light');
  const lastTime = stateObj.last_changed
    ? formatRelativeTime(new Date(stateObj.last_changed), language)
    : device.subtitle;

  const doService = makeDoService(hass, 'light', device.entityId);

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'toggle')}>
      <div class="device-top" @click=${(e: Event) => { e.stopPropagation(); onHandleAction(device.entityId, 'more-info'); }}>
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${stateLabel}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" @click=${(e: Event) => e.stopPropagation()}>
        ${hasBrightness && isOn && briPct !== undefined ? html`
        <ha-control-slider .value=${briPct} min="0" max="100" style="--control-slider-thickness:28px;--control-slider-border-radius:var(--sp-radius-pill);flex:1;min-width:0" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); doService('turn_on', { brightness: Math.round((e.detail.value ?? 0) * 2.55) }); }} @click=${(e: Event) => e.stopPropagation()}></ha-control-slider>
        ` : ''}
        ${hasColorTemp && isOn && colorTemp !== undefined ? html`
        <ha-control-slider .value=${colorTemp} min=${minM} max=${maxM} style="--control-slider-thickness:28px;--control-slider-border-radius:var(--sp-radius-pill);flex:1;min-width:0;--control-slider-color:var(--sp-accent)" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); doService('turn_on', { color_temp: Math.round((e.detail.value ?? minM) as number) }); }} @click=${(e: Event) => e.stopPropagation()}></ha-control-slider>
        ` : ''}
        ${hasRgbColor && isOn ? html`
        <label class="light-color-swatch" style="width:28px;height:28px;border-radius:50%;background:${currentHex};border:2px solid rgba(255,255,255,.6);flex-shrink:0;cursor:pointer;overflow:hidden;box-shadow:var(--sp-shadow-device);display:block" title=${currentHex} @click=${(e: Event) => e.stopPropagation()}>
          <input type="color" .value=${currentHex} style="opacity:0;width:100%;height:100%;cursor:pointer;border:0;padding:0" @input=${(e: Event) => { e.stopPropagation(); const v = (e.target as HTMLInputElement).value; doService('turn_on', { rgb_color: hexToRgb(v) }); }} @click=${(e: Event) => e.stopPropagation()}>
        </label>
        ` : ''}
        <ha-control-switch .checked=${isOn} style="${DEVICE_SWITCH_STYLE};margin-left:auto" @change=${(e: Event) => { e.stopPropagation(); doService('toggle', {}); }} @click=${(e: Event) => e.stopPropagation()} .label=${device.name}></ha-control-switch>
      </div>
    </button>
  `;
}