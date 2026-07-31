import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity, RenderedDevice } from '../types';
import type { RenderContext } from '../render/context';
import { renderImage, renderUserAvatar } from '../render/context';
import { renderNav } from '../components/nav';
import { renderMediaPlayer } from '../components/media-player';
import { renderMaintenanceCard } from '../components/maintenance';
import { renderWeather } from '../components/weather';
import { renderEnvironment } from '../components/environment';
import { renderBars } from '../components/energy-bars';
import { renderHomeEnergyCard } from './energy';
import { renderAreaRooms } from './rooms';
import { getRoomsForRender, areaFallbackInfo } from '../selectors/rooms';
import { getRealDevicesForRender } from '../selectors/devices';
import { renderDeviceCard } from '../components/device-card';
import {
  dateText,
  formatRelativeTime,
  localizedText,
  selectedSkin,
  skinString,
  stateValue,
  timeText,
} from '../utils';

export function renderHomeView(
  ctx: RenderContext,
  quote: string,
  energyValue: string,
  energyUnit: string,
  compareValue: string,
): TemplateResult {
  const cameraEntityId = ctx.config.camera?.entity || '';
  const cameraState = cameraEntityId ? ctx.hass.states?.[cameraEntityId] : undefined;
  const hasCamera = Boolean(cameraState);

  const alarmEntityId = Object.keys(ctx.hass.states || {}).find(e => e.startsWith('alarm_control_panel.')) || '';
  const alarmStateObj = alarmEntityId ? ctx.hass.states?.[alarmEntityId] : undefined;
  const alarmState = alarmStateObj?.state || '';
  const alarmIconMap: Record<string, string> = {
    disarmed: 'mdi:shield-off', armed_home: 'mdi:shield-home', armed_away: 'mdi:shield-lock',
    armed_night: 'mdi:shield-moon', armed_vacation: 'mdi:shield-airplane', triggered: 'mdi:bell-ring',
    pending: 'mdi:shield-sync', arming: 'mdi:shield-sync',
  };
  const alarmIcon = alarmIconMap[alarmState] || 'mdi:shield-lock';

  const cameraCard = hasCamera ? (() => {
    const accessToken = String(cameraState?.attributes?.access_token || '');
    const snapshotUrl = accessToken ? `/api/camera_proxy/${cameraEntityId}?token=${encodeURIComponent(accessToken)}&ts=${Date.now()}` : '';
    return html`
      <section class="glass-card panel-camera" @click=${() => ctx.onHandleAction(cameraEntityId, 'more-info')}>
        <div class="section-title"><h2>${cameraState?.attributes?.friendly_name || cameraEntityId}</h2></div>
        <div class="camera-preview" style="aspect-ratio:auto;min-height:0;max-height:none;background:transparent;">
          <img alt="" src=${snapshotUrl} style="width:100%;height:auto;display:block;object-fit:contain;">
        </div>
      </section>
    `;
  })() : nothing;

  const energyBars = renderBars(ctx.energyHistory || []);
  const homeDevicesStyle = window.matchMedia('(orientation: landscape)').matches
    ? 'display:grid;grid-auto-flow:column;grid-auto-columns:minmax(140px,1fr);grid-template-columns:none;overflow-x:auto;overflow-y:hidden;padding:var(--sp-space-xs);'
    : 'padding:var(--sp-space-xs);';

  return html`
    <div class="stage-grid">
      <div
        style="position:absolute;top:var(--sp-space-sm,8px);${window.matchMedia('(orientation: portrait)').matches ? 'right:var(--sp-space-sm,8px);width:auto;max-width:60%;' : 'left:37.5%;transform:translateX(-50%);width:37.5%;'}z-index:10;display:flex;align-items:center;gap:10px;padding:10px 20px;border-radius:var(--sp-radius-pill,999px);background:var(--sp-glass-bg,rgba(255,255,255,0.12));border:1px solid var(--sp-glass-border,rgba(255,255,255,0.15));cursor:pointer;color:var(--sp-text-secondary,rgba(255,255,255,0.5));font-size:15px;"
        @click=${() => ctx.onOpenSearch()}
      >
        <ha-icon icon="mdi:magnify" style="--mdc-icon-size:20px;flex-shrink:0;"></ha-icon>
        <span>${ctx.translate('searchPlaceholder')}</span>
      </div>
      <div class="welcome-group">
        <section class="welcome" data-section="home" @click=${() => ctx.onWelcomeClick()}>
          <h1>${ctx.config.title || localizedText(undefined, ctx.config.title_zh || skinString(selectedSkin(ctx.config), 'title_zh'), ctx.config.title_en || skinString(selectedSkin(ctx.config), 'title_en'), ctx.language)}</h1>
          <p class="quote">${quote}</p>
        </section>
        <div class="weather-with-meta">
          ${renderWeather(ctx.config, ctx.hass, ctx.weatherForecast, ctx.onMoreInfo)}
          ${hasCamera ? html`
          <div class="welcome-meta">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="time-main">${timeText(ctx.hass, ctx.language)}</span>
              <span class="time-sub" style="font-size:var(--sp-font-sm)">${dateText(ctx.hass, ctx.language)}</span>
            </div>
            <div class="env-list env-list-inline" style="gap:clamp(2px,0.6vw,6px) clamp(6px,1vw,12px);">${renderEnvironment(ctx.config, ctx.hass, ctx.areas, ctx.entityRegistry, ctx.deviceRegistry, ctx.floors, ctx.language)}</div>
          </div>` : ''}
        </div>
      </div>
      <section class="bottom-stack">
        <section class="bottom-block bottom-devices">
          <div class="section-title"><h2>${ctx.translate('devices')}</h2><p class="muted">${ctx.translate('quickControl')}</p></div>
          <div class="devices" style=${homeDevicesStyle}>${renderShortcutDevices(ctx)}</div>
        </section>
        <section class="bottom-block">
          <div class="section-title"><h2>${ctx.translate('rooms')}</h2><p class="muted">${ctx.translate('roomSnapshots')}</p></div>
          <div class="rooms">${renderHomeRooms(ctx)}</div>
        </section>
      </section>
      <aside class="side">
        ${hasCamera ? cameraCard : html`
        <section class="time-card">
          <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
            <div class="time-main">${timeText(ctx.hass, ctx.language)}</div>
            <div class="time-sub" style="font-size:var(--sp-font-sm)">${dateText(ctx.hass, ctx.language)}</div>
          </div>
          <div class="time-icon" @click=${alarmEntityId ? () => ctx.onHandleAction(alarmEntityId, 'more-info') : undefined} style=${alarmEntityId ? 'cursor:pointer' : ''}><ha-icon icon=${alarmIcon}></ha-icon></div>
        </section>
        <section class="glass-card panel-environment">
          <div class="section-title"><h2>${ctx.translate('environment')}</h2></div>
          <div class="env-list" style="gap:clamp(0px,1.2vw,12px);margin-top:clamp(4px,1.2vw,12px);">${renderEnvironment(ctx.config, ctx.hass, ctx.areas, ctx.entityRegistry, ctx.deviceRegistry, ctx.floors, ctx.language)}</div>
        </section>`}
        ${renderHomeEnergyCard(ctx, energyValue, energyUnit, compareValue, energyBars)}
        ${renderMediaPlayer(ctx.hass, ctx.config.media_player?.entity)}
        ${renderMaintenanceCard(ctx.hass, ctx.translate)}
        <section class="glass-card panel-scenes" data-section="scenes">
          <div class="section-title"><h2>${ctx.translate('scenes')}</h2><p class="muted">${ctx.translate('modes')}</p></div>
          <div class="scene-grid">${renderHomeScenes(ctx)}</div>
        </section>
      </aside>
    </div>
  `;
}

export function renderSidebar(ctx: RenderContext): TemplateResult {
  return html`
    <aside class="sidebar">
      <div class="profile" @click=${() => ctx.onToggleKiosk()}>
        ${renderUserAvatar(ctx.config, ctx.hass, 'profile-img')}
        <div class="meta">
          <h2>${ctx.config.profile_name || ctx.hass?.user?.name || ''}</h2>
          <p class="muted">${ctx.config.profile_subtitle || localizedText(undefined, ctx.config.profile_subtitle_zh || skinString(selectedSkin(ctx.config), 'profile_subtitle_zh'), ctx.config.profile_subtitle_en || skinString(selectedSkin(ctx.config), 'profile_subtitle_en'), ctx.language)}</p>
        </div>
      </div>
      <nav class="menu">
        ${renderNav(ctx.config.nav, ctx.view, ctx.language, ctx.onNavigate)}
      </nav>
      <div class="sidebar-art">${renderImage(ctx.config, 'decor', 'Decor', '')}</div>
    </aside>
  `;
}

export function renderMobileNav(ctx: RenderContext): TemplateResult {
  return html`<nav class="mobile-nav">${renderNav(ctx.config.nav, ctx.view, ctx.language, ctx.onNavigate)}</nav>`;
}

function renderShortcutDevices(ctx: RenderContext): TemplateResult[] {
  const limit = ctx.config.home_limits!.devices!;
  const selectedEntities = ctx.config.home_selection?.devices || [];

  let realDevices: RenderedDevice[];

  if (selectedEntities.length > 0) {
    const colors: RenderedDevice['color'][] = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];
    realDevices = [];
    for (const entityId of selectedEntities) {
      const stateObj = ctx.hass.states[entityId];
      if (!stateObj) continue;
      const domain = entityId.split('.')[0] || '';
      realDevices.push({
        entityId,
        name: String(stateObj.attributes?.friendly_name || entityId),
        subtitle: '',
        detail: domain,
        state: stateObj.state,
        icon: String(stateObj.attributes?.icon || ''),
        color: colors[realDevices.length % colors.length]!,
      });
    }
  } else {
    const allRealDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas);
    realDevices = allRealDevices.slice(0, limit);
  }

  return realDevices.map((device) => renderDeviceCard(ctx.config, ctx.hass, device, ctx.language, ctx.onHandleAction));
}

function renderHomeRooms(ctx: RenderContext): TemplateResult | typeof nothing {
  const limit = ctx.config.home_limits!.rooms!;
  const selectedRooms = ctx.config.home_selection?.rooms || [];
  const areaRooms = renderAreaRooms(ctx, ctx.areas, false, limit, selectedRooms, false);
  if (areaRooms !== nothing) return areaRooms;

  const rooms = getRoomsForRender(ctx.config.rooms, ctx.areas);
  if (rooms.length === 0) return nothing;
  return html`${rooms.map((room) => {
    const imageKey = room.image || 'room_living';
    const info = room.info_entity ? stateValue(ctx.hass, room.info_entity, ctx.language) : '';
    const fallbackInfo = ctx.areas?.length ? areaFallbackInfo(room, ctx.areas, ctx.hass, ctx.entityRegistry, ctx.deviceRegistry, ctx.language) : '--';
    const displayName = room.name || '--';
    return html`
      <button class="room" @click=${() => room.target ? ctx.onNavigatePath(room.target!) : undefined}>
        ${renderImage(ctx.config, imageKey, displayName, '')}
        <div class="room-label">
          <h3>${displayName}</h3>
          <p class="muted">${info || fallbackInfo || '--'}</p>
        </div>
      </button>
    `;
  })}`;
}

function renderHomeScenes(ctx: RenderContext): TemplateResult {
  const limit = ctx.config.home_limits!.scenes!;
  const selectedScenes = ctx.config.home_selection?.scenes || [];
  const scenes = renderRealScenes(ctx, limit, selectedScenes);
  if (scenes !== nothing) return scenes;
  return html`<div class="empty-state compact-empty">${ctx.translate('noScenes')}</div>`;
}

function renderRealScenes(
  ctx: RenderContext,
  limit = 12,
  selectedScenes: string[] = [],
): TemplateResult | typeof nothing {
  const scenes = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('scene.')))
    .filter((entity) => selectedScenes.length === 0 || selectedScenes.includes(entity.entity_id))
    .slice(0, limit);

  if (scenes.length === 0) return nothing;

  return html`${scenes.map((scene, index) => {
    const tones: Array<'morning' | 'night' | 'movie' | 'game'> = ['morning', 'night', 'movie', 'game'];
    const name = String(scene.attributes?.friendly_name || scene.entity_id);
    const lastActivated = scene.state && scene.state !== 'unavailable' && scene.state !== 'unknown'
      ? formatRelativeTime(new Date(scene.state), ctx.language)
      : undefined;
    return html`
      <button class="scene ${tones[index % tones.length]}" @click=${() => ctx.onRunScene(scene.entity_id)}>
        <strong>${name}</strong>
        ${lastActivated ? html`<p class="muted">${lastActivated}</p>` : nothing}
      </button>
    `;
  })}`;
}
