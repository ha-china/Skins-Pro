import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { deviceStatusClass, hassLocalizeChain, renderDeviceUnavailableCard } from './device-shell';
import { setAlarmMode } from './alarm-code-dialog';

export function alarmStateIcon(state: string): string {
  const map: Record<string, string> = {
    disarmed: 'mdi:shield-off', armed_home: 'mdi:shield-home', armed_away: 'mdi:shield-lock',
    armed_night: 'mdi:shield-moon', armed_vacation: 'mdi:shield-airplane', armed_custom_bypass: 'mdi:shield-home',
    triggered: 'mdi:bell-ring', pending: 'mdi:shield-sync', arming: 'mdi:shield-sync', disarming: 'mdi:shield-sync',
  };
  return map[state] || 'mdi:shield-lock';
}

export function renderAlarmControlPanelCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const assetKey = assetKeyForDomain(selectedSkin(config), 'alarm_control_panel');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return renderDeviceUnavailableCard(config, hass, device, language, onHandleAction, 'alarm_control_panel');
  }

  const state = stateObj.state;
  const attrs = stateObj.attributes || {};
  const isArmed = state === 'armed_home' || state === 'armed_away' || state === 'armed_night' || state === 'armed_vacation' || state === 'armed_custom_bypass';
  const isTriggered = state === 'triggered';
  const isPending = state === 'pending' || state === 'arming' || state === 'disarming';

  const statusClass: string = isTriggered ? deviceStatusClass(state, true, 'red') : deviceStatusClass(state, isArmed || isPending, device.color);
  const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;

  const supportedFeatures = (attrs.supported_features as number) || 0;

  const FEATURE_ARM_HOME = 1;
  const FEATURE_ARM_AWAY = 2;
  const FEATURE_ARM_NIGHT = 4;
  const FEATURE_ARM_VACATION = 16;

  type ArmMode = { feature: number; icon: string; service: string; title: string };
  const aLocal = (st: string) => hassLocalizeChain(hass, [`component.alarm_control_panel.entity_component._.state.${st}`, `component.alarm_control_panel.state.${st}`], st.replace(/_/g, ' '));
  const armModes: ArmMode[] = [
    { feature: FEATURE_ARM_AWAY, icon: 'mdi:shield-lock', service: 'alarm_arm_away', title: aLocal('armed_away') },
    { feature: FEATURE_ARM_HOME, icon: 'mdi:shield-home', service: 'alarm_arm_home', title: aLocal('armed_home') },
    { feature: FEATURE_ARM_NIGHT, icon: 'mdi:shield-moon', service: 'alarm_arm_night', title: aLocal('armed_night') },
    { feature: FEATURE_ARM_VACATION, icon: 'mdi:shield-airplane', service: 'alarm_arm_vacation', title: aLocal('armed_vacation') },
  ];
  const availableArms = armModes.filter(m => supportedFeatures & m.feature);
  const fallbackArms = availableArms.length > 0 ? availableArms : armModes.slice(0, 2);

  const iconStyle = '--mdc-icon-size:18px;color:var(--sp-text-primary);display:flex;cursor:pointer';

  const armButtons = (!isTriggered && !isPending)
    ? fallbackArms.slice(0, 3).map(m => html`
        <ha-icon icon=${m.icon} style=${iconStyle} title=${m.title} @click=${(e: Event) => { e.stopPropagation(); void setAlarmMode(e.currentTarget as HTMLElement, hass, device.entityId, m.service, false); }}></ha-icon>
      `)
    : '';

  const disarmButton = (isArmed || isTriggered)
    ? html`<ha-icon icon="mdi:shield-off" style=${iconStyle} title=${aLocal('disarmed')} @click=${(e: Event) => { e.stopPropagation(); void setAlarmMode(e.currentTarget as HTMLElement, hass, device.entityId, 'alarm_disarm', true); }}></ha-icon>`
    : '';

  const controlIcons = isPending ? html`<ha-icon icon=${isTriggered ? 'mdi:bell-ring' : (isArmed ? 'mdi:shield-lock' : 'mdi:shield-off')} style="--mdc-icon-size:18px;color:var(--sp-text-primary)"></ha-icon>` : html`${armButtons}${disarmButton}`;

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${deviceStateLabel(state, language, hass, 'alarm_control_panel')}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" style="justify-content:flex-end;gap:6px" @click=${(e: Event) => e.stopPropagation()}>
        ${controlIcons}
      </div>
    </button>
  `;
}
