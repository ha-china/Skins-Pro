import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { AreaRegistryEntry } from '../types';
import type { RenderContext } from '../render/context';
import { areaCounts, areaScenes, areaActiveCounts, areaSummaryById } from '../selectors/areas';
import { renderPageShell } from '../components/page-shell';
import { assetUrl, t } from '../utils';

interface RoomViewEntry {
  areaId: string;
  name: string;
  image: string;
  picture?: string | null;
  summary: string;
  counts: { devices: number; entities: number };
  activeCounts: ReturnType<typeof areaActiveCounts>;
  scenes: ReturnType<typeof areaScenes>;
}

export function renderRoomsView(ctx: RenderContext): TemplateResult {
  const floors = ctx.floors || [];
  const showFloorTabs = floors.length > 1;
  const selectedFloorRooms: AreaRegistryEntry[] = showFloorTabs && ctx.selectedFloor
    ? (ctx.areas || []).filter((a) => (a as AreaRegistryEntry & { floor_id?: string | null }).floor_id === ctx.selectedFloor)
    : (ctx.areas || []);
  const roomsMarkup = renderAreaRooms(ctx, selectedFloorRooms, true, undefined, [], false);
  const roomCount = selectedFloorRooms.length || 0;
  const roomPageClass = roomCount > 8 ? 'rooms-page rooms-page-dense' : (roomCount > 4 ? 'rooms-page rooms-page-medium' : 'rooms-page');

  const floorTabs = showFloorTabs ? html`
    <div class="filter-bar floor-tabs">
      <button class="chip${ctx.selectedFloor === '' ? ' active' : ''}" @click=${() => ctx.setSelectedFloor('')}>${ctx.translate('allFloors')}</button>
      ${floors.map((f) => html`<button class="chip${ctx.selectedFloor === f.floor_id ? ' active' : ''}" @click=${() => ctx.setSelectedFloor(f.floor_id)}>${f.name}</button>`)}
    </div>
  ` : html``;

  return renderPageShell(
    ctx.translate('rooms'),
    ctx.translate('roomSnapshots'),
    floorTabs,
    html`
      <div class="rooms-page-wrap">
        ${roomsMarkup !== nothing
          ? html`<div class="rooms ${roomPageClass}">${roomsMarkup}</div>`
          : html`<div class="empty-state">${t(ctx.language, 'noAreas')}</div>`}
      </div>
    `
  );
}

export function renderAreaRooms(
  ctx: RenderContext,
  areasPool: AreaRegistryEntry[] | undefined,
  requireRealAreas: boolean,
  limit?: number,
  selectedRooms: string[] = [],
  showSummary = true,
): TemplateResult | typeof nothing {
  const allAreas = areasPool ?? ctx.areas;
  if (!allAreas || allAreas.length === 0) return nothing;

  const imageKeys = ['room_living', 'room_bedroom', 'room_kitchen', 'room_garden'];
  const filteredAreas = selectedRooms.length > 0
    ? selectedRooms
      .map((item) => {
        if (item.includes('.')) {
          const entry = ctx.entityRegistry?.find((e) => e.entity_id === item);
          if (entry?.area_id) return allAreas?.find((a) => a.area_id === entry.area_id);
          return undefined;
        }
        return allAreas?.find((a) => a.area_id === item) || allAreas?.find((a) => a.name === item);
      })
      .filter((area): area is AreaRegistryEntry => Boolean(area))
    : allAreas;

  const rooms: RoomViewEntry[] = filteredAreas.slice(0, limit || filteredAreas.length).map((area, index) => ({
    areaId: area.area_id,
    name: area.name,
    image: imageKeys[index % imageKeys.length]!,
    picture: area.picture,
    summary: areaSummaryById(area.area_id, ctx.hass, ctx.entityRegistry, ctx.deviceRegistry, ctx.language),
    counts: areaCounts(area.area_id, ctx.entityRegistry, ctx.deviceRegistry),
    activeCounts: areaActiveCounts(area.area_id, ctx.hass, ctx.entityRegistry, ctx.deviceRegistry, ctx.language),
    scenes: areaScenes(area.area_id, area.name, ctx.hass, ctx.entityRegistry, ctx.deviceRegistry),
  }));

  if (requireRealAreas && rooms.length === 0) return nothing;

  const useAreaPics = ctx.config.use_area_pictures;

  return html`${rooms.map((room) => {
    const imgSrc = useAreaPics && room.picture ? room.picture : assetUrl(ctx.config, room.image || 'room_living');
    const roomImg = imgSrc ? html`<img alt=${room.name} src=${imgSrc}>` : nothing;

    const sceneChips = room.scenes.length > 0 ? html`
      <div class="room-scenes">
        ${room.scenes.map((scene) => html`
          <button class="room-scene-chip" @click=${(e: Event) => { e.stopPropagation(); ctx.onRunScene(scene.entity_id); }}>
            ${scene.name}
          </button>
        `)}
      </div>
    ` : nothing;

    const activeCountsRow = room.activeCounts.length > 0 ? html`
      <div class="room-active">
        ${room.activeCounts.map((g) => html`
          <button class="room-active-chip" @click=${(e: Event) => { e.stopPropagation(); ctx.onTurnOffAreaType(g.entityIds); }}>
            <span>${g.label} ${g.count}</span>
          </button>
        `)}
      </div>
    ` : nothing;

    const summary = html`<p class="muted">${room.summary || '-'}</p>`;
    if (showSummary) {
      return html`
        <button class="room" @click=${() => ctx.onRoomSelect(room.name)}>
          ${roomImg}
          ${sceneChips}
          <div class="room-label">
            <h3>${room.name}</h3>
            ${summary}
          </div>
          ${activeCountsRow}
        </button>
      `;
    }
    const countLabel = t(ctx.language, 'deviceEntityCount', { devices: room.counts.devices, entities: room.counts.entities });
    return html`
      <button class="room" @click=${() => ctx.onRoomSelect(room.name)}>
        ${roomImg}
        ${sceneChips}
        <div class="room-label">
          <h3>${room.name}</h3>
          ${summary}
          <p class="room-stats">${countLabel}</p>
        </div>
        ${activeCountsRow}
      </button>
    `;
  })}`;
}
