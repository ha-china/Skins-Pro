import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HomeAssistant } from '../types';

const PRE_MUTE_VOLUMES = new WeakMap<object, number>();

export function renderMediaPlayer(
  hass: HomeAssistant,
  entityId: string | undefined,
): TemplateResult | typeof nothing {
  if (!entityId) return nothing;
  const stateObj = hass.states?.[entityId];
  if (!stateObj) return nothing;
  const sectionTitle = hass.localize('component.media_player.title') || hass.localize('domain.media_player') || 'Media Player';
  const state = stateObj.state;
  const isOff = state === 'off' || state === 'unavailable';
  if (isOff) {
    const name = (stateObj.attributes?.friendly_name as string) || entityId;
    return html`
      <section class="glass-card panel-media">
        <div class="section-title"><h2>${sectionTitle}</h2></div>
        <div class="media-off-state">
          <button class="media-volbtn" @click=${() => hass.callService('media_player', 'turn_on', { entity_id: entityId })} title=${hass.localize('ui.card.media_player.turn_on')}><ha-icon icon="mdi:power-standby"></ha-icon></button>
          <span>${name}</span>
        </div>
      </section>
    `;
  }
  const attrs = stateObj.attributes || {};
  const title = (attrs.media_title as string) || (attrs.friendly_name as string) || entityId;
  const artist = attrs.media_artist as string | undefined;
  const albumArt = attrs.entity_picture as string | undefined;
  const source = (attrs.app_name as string) || (attrs.source as string) || '';
  const isPlaying = state === 'playing';
  const vol = attrs.volume_level as number | undefined;
  const volZero = vol !== undefined && vol === 0;
  const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
  const handleVolTrack = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: pct });
  };
  const handleMute = () => {
    if (vol !== undefined) {
      if (vol > 0) {
        PRE_MUTE_VOLUMES.set(stateObj, vol);
        hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: 0 });
      } else {
        const restored = PRE_MUTE_VOLUMES.get(stateObj) ?? 0.3;
        hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: restored });
      }
    }
  };
  return html`
    <section class="glass-card panel-media">
      <div class="section-title"><h2>${sectionTitle}</h2></div>
      <div class="media-content">
        <div class="media-row">
          ${albumArt ? html`<div class="media-cover"><img alt="" src=${albumArt}></div>` : html`<div class="media-cover media-cover-null"><ha-icon icon="mdi:music"></ha-icon></div>`}
          <div class="media-body">
            <div class="media-title">${title}</div>
            ${artist ? html`<div class="media-artist">${artist}</div>` : ''}
            ${source ? html`<div class="media-source">${source}</div>` : ''}
          </div>
          <div class="media-actions">
            <button class="media-btn" @click=${() => hass.callService('media_player', 'media_previous_track', { entity_id: entityId })} title=${hass.localize('ui.card.media_player.media_previous')}><ha-icon icon="mdi:skip-previous"></ha-icon></button>
            <button class="media-btn media-playbtn" @click=${() => hass.callService('media_player', 'media_play_pause', { entity_id: entityId })} title=${isPlaying ? hass.localize('ui.card.media_player.media_pause') : hass.localize('ui.card.media_player.media_play')}><ha-icon icon=${isPlaying ? 'mdi:pause-circle' : 'mdi:play-circle'}></ha-icon></button>
            <button class="media-btn" @click=${() => hass.callService('media_player', 'media_next_track', { entity_id: entityId })} title=${hass.localize('ui.card.media_player.media_next')}><ha-icon icon="mdi:skip-next"></ha-icon></button>
          </div>
        </div>
        ${volPct !== undefined ? html`
        <div class="media-row media-volrow">
          <button class="media-volbtn" @click=${handleMute}><ha-icon icon=${volZero ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon></button>
          <div class="media-voltrack" @click=${handleVolTrack}><div class="media-volfill" style="width:${volPct}%"></div></div>
        </div>` : ''}
      </div>
    </section>
  `;
}
