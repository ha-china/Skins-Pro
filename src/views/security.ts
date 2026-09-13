import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderImage } from '../render/context';
import { assetKeyForDomain, cameraSnapshotUrl, deviceStateLabel, selectedSkin, t } from '../utils';
import { setAlarmMode } from '../components/alarm-code-dialog';
import { DEVICE_COLORS } from '../selectors/devices';

const SECURITY_TOGGLE_DOMAINS = new Set([
  'light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock',
  'input_boolean', 'automation', 'group', 'vacuum', 'humidifier', 'water_heater', 'siren',
]);

export function renderSecurityView(ctx: RenderContext): TemplateResult {
  const cards = renderSecurityCards(ctx);
  return renderPageShell(
    ctx.translate('security'),
    ctx.translate('securityOverview'),
    html``,
    cards !== nothing
      ? html`<div class="page-scroll themed-scrollbar"><div class="devices security-grid">${cards}</div></div>`
      : html``
  );
}

function renderSecurityCards(ctx: RenderContext): TemplateResult | typeof nothing {
  const entities = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(entity?.entity_id && /^(camera|lock|alarm_control_panel|binary_sensor)\./.test(entity.entity_id)))
    .filter((entity) => {
      if (entity.entity_id.startsWith('binary_sensor.')) {
        return /door|window|motion|contact|lock/i.test(entity.entity_id);
      }
      return true;
    })
    .slice(0, 12);

  if (entities.length === 0) return nothing;

  const cameras = entities.filter(e => e.entity_id.startsWith('camera.'));
  const others = entities.filter(e => !e.entity_id.startsWith('camera.'));

  const skin = selectedSkin(ctx.config);

  const cameraCards = cameras.map(entity => {
    const domain = entity.entity_id.split('.')[0] || 'camera';
    const stateLabel = deviceStateLabel(entity.state, ctx.language, ctx.hass, domain);
    const stateObj = ctx.hass.states?.[entity.entity_id];
    const entityPicture = String(stateObj?.attributes?.entity_picture || '');
    const accessToken = String(stateObj?.attributes?.access_token || '');
    const snapshotUrl = entityPicture || (accessToken ? cameraSnapshotUrl(entity.entity_id, accessToken) : '');
    return html`
      <button class="camera-card" @click=${() => ctx.onHandleAction(entity.entity_id, 'more-info')}>
        <div class="camera-preview" style="aspect-ratio:auto;min-height:0;max-height:none;background:transparent;">
          <img alt=${String(entity.attributes?.friendly_name || entity.entity_id)} src=${snapshotUrl} style="width:100%;height:auto;display:block;object-fit:contain;">
        </div>
        <div class="camera-meta">
          <div>
            <p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p>
            <p class="muted">${t(ctx.language, 'snapshot')}</p>
          </div>
          <div class="status">${stateLabel}</div>
        </div>
      </button>
    `;
  });

  const otherCards = others.map((entity, index) => {
    const domain = entity.entity_id.split('.')[0] || 'sensor';
    const isAlarm = domain === 'alarm_control_panel';
    const stateLabel = isAlarm
      ? deviceStateLabel(entity.state, ctx.language, ctx.hass, 'alarm_control_panel')
      : deviceStateLabel(entity.state, ctx.language, ctx.hass, domain);
    const assetKey = assetKeyForDomain(skin, domain);
    const tones = DEVICE_COLORS;
    const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : `device-on-${tones[index % tones.length]}`;
    const togglable = SECURITY_TOGGLE_DOMAINS.has(domain);

    let control: TemplateResult;
    if (isAlarm) {
      const attrs = entity.attributes || {};
      const supportedFeatures = (attrs.supported_features as number) || 0;
      const isArmed = /armed_/.test(entity.state);
      const isTriggered = entity.state === 'triggered';
      const isPending = entity.state === 'pending' || entity.state === 'arming' || entity.state === 'disarming';
      const iconStyle = '--mdc-icon-size:18px;color:var(--sp-text-primary);display:flex;cursor:pointer';
      const aLocal = (st: string) => ctx.hass?.localize?.(`component.alarm_control_panel.entity_component._.state.${st}`) || ctx.hass?.localize?.(`component.alarm_control_panel.state.${st}`) || st.replace(/_/g, ' ');
      const armModes = [
        { f: 2, i: 'mdi:shield-lock', s: 'alarm_arm_away', title: aLocal('armed_away') },
        { f: 1, i: 'mdi:shield-home', s: 'alarm_arm_home', title: aLocal('armed_home') },
        { f: 4, i: 'mdi:shield-moon', s: 'alarm_arm_night', title: aLocal('armed_night') },
      ].filter(m => supportedFeatures & m.f);
      const fallbackArms = armModes.length > 0 ? armModes : [
        { f: 0, i: 'mdi:shield-lock', s: 'alarm_arm_away', title: aLocal('armed_away') },
        { f: 0, i: 'mdi:shield-home', s: 'alarm_arm_home', title: aLocal('armed_home') },
      ];

      const armBtns = isPending
        ? html`<ha-icon icon=${isTriggered ? 'mdi:bell-ring' : 'mdi:shield-lock'} style=${iconStyle}></ha-icon>`
        : html`${fallbackArms.slice(0, 3).map(m => html`<ha-icon role="button" aria-label=${m.title} icon=${m.i} style=${iconStyle} title=${m.title} @click=${(e: Event) => { e.stopPropagation(); void setAlarmMode(e.currentTarget as HTMLElement, ctx.hass, entity.entity_id, m.s, false); }}></ha-icon>`)}`;
      const disarmBtn = (isArmed || isTriggered)
        ? html`<ha-icon role="button" aria-label=${aLocal('disarmed')} icon="mdi:shield-off" style=${iconStyle} title=${aLocal('disarmed')} @click=${(e: Event) => { e.stopPropagation(); void setAlarmMode(e.currentTarget as HTMLElement, ctx.hass, entity.entity_id, 'alarm_disarm', true); }}></ha-icon>`
        : '';
      control = html`<div class="control-row" style="justify-content:flex-end;gap:6px" @click=${(e: Event) => e.stopPropagation()}>${armBtns}${disarmBtn}</div>`;
    } else if (togglable) {
      control = html`<div class="control-row" style="justify-content:flex-end"><ha-control-switch .checked=${['on', 'playing', 'open', 'locked'].includes(entity.state)} style="--control-switch-thickness:24px;--control-switch-border-radius:var(--sp-radius-pill);--control-switch-padding:3px;width:44px;flex-shrink:0" @click=${(e: Event) => e.stopPropagation()} @change=${(e: Event) => { e.stopPropagation(); ctx.onHandleAction(entity.entity_id, 'toggle'); }} .label=${String(entity.attributes?.friendly_name || entity.entity_id)}></ha-control-switch></div>`;
    } else {
      control = html`<div class="control-row" style="justify-content:flex-end"><span class="state-word">${stateLabel}</span></div>`;
    }

    return html`
      <button class="device ${statusClass}" @click=${() => ctx.onHandleAction(entity.entity_id, 'more-info')}>
        <div class="device-top">
          ${renderImage(ctx.config, assetKey, String(entity.attributes?.friendly_name || entity.entity_id), 'item-img')}
          <div class="tag-stack"><div class="status">${stateLabel}</div></div>
        </div>
        <div class="device-copy"><p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p><p class="muted">${t(ctx.language, 'security')}</p></div>
        ${control}
      </button>
    `;
  });

  return html`
    ${cameraCards.length > 0 ? html`<div class="security-cameras">${cameraCards}</div>` : nothing}
    ${otherCards.length > 0 ? html`<div class="security-devices">${otherCards}</div>` : nothing}
  `;
}
