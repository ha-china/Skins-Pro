import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, DeviceColor, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, selectedSkin } from '../utils';
import { renderImage } from '../render/context';

// Shared inline styles for device card controls (previously duplicated in every domain card).
export const DEVICE_SWITCH_STYLE = '--control-switch-thickness:24px;--control-switch-border-radius:var(--sp-radius-pill);--control-switch-padding:3px;width:44px;flex-shrink:0';
export const DEVICE_SELECT_STYLE = 'font-size:var(--sp-font-3xs);min-height:32px;min-width:48px;padding:0 16px 0 4px;background-size:8px;flex-shrink:0';

// Unified status class: active → device-on-{color}; unavailable → device-unavailable; otherwise device-off.
export function deviceStatusClass(state: string, active: boolean, color: DeviceColor): string {
  if (active) return `device-on-${color}`;
  return state === 'unavailable' ? 'device-unavailable' : 'device-off';
}

// Shared "entity missing" fallback card (was copy-pasted across 7 domain cards).
export function renderDeviceUnavailableCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
  domain: string,
): TemplateResult {
  const assetKey = assetKeyForDomain(selectedSkin(config), domain);
  return html`<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
    <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${deviceStateLabel(device.state, language, hass, domain)}</div></div></div>
    <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
  </button>`;
}

// Shared doService closure: call a domain service on this entity.
export function makeDoService(hass: HomeAssistant, domain: string, entityId: string): (service: string, data?: Record<string, unknown>) => void {
  return (service, data = {}) => { void hass.callService(domain, service, { entity_id: entityId, ...data }); };
}

// Shared hass.localize fallback chain (was hand-written at ~12 call sites).
export function hassLocalizeChain(hass: HomeAssistant, keys: string[], fallback: string): string {
  for (const key of keys) {
    const s = hass.localize?.(key);
    if (s) return s;
  }
  return fallback;
}

// Shared minus/value/plus stepper used by climate and water_heater target-temperature controls.
// Clamps the next value into [min, max] around `value ?? min`, mirroring the original inline logic.
export function renderTempStepper(opts: {
  value?: number;
  min: number;
  max: number;
  step: number;
  display: (v?: number) => string;
  onAdjust: (next: number) => void;
  minSpanWidth?: string;
}): TemplateResult {
  const cur = opts.value ?? opts.min;
  const clamp = (v: number): number => Math.min(opts.max, Math.max(opts.min, v));
  return html`<div class="temp-group" style="display:flex;align-items:center;gap:1px;flex-shrink:0">
    <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e: Event) => { e.stopPropagation(); opts.onAdjust(clamp(cur - opts.step)); }}><ha-icon icon="mdi:minus" style="--mdc-icon-size:14px"></ha-icon></div>
    <span style="font-weight:700;font-size:var(--sp-font-2xs);min-width:${opts.minSpanWidth ?? '20px'};text-align:center">${opts.display(opts.value)}</span>
    <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e: Event) => { e.stopPropagation(); opts.onAdjust(clamp(cur + opts.step)); }}><ha-icon icon="mdi:plus" style="--mdc-icon-size:14px"></ha-icon></div>
  </div>`;
}
