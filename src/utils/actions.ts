import type { HomeAssistant } from '../types';

export async function runScene(hass: HomeAssistant | undefined, entityId: string): Promise<void> {
  await hass?.callService('scene', 'turn_on', { entity_id: entityId });
}

const TURN_ON_SERVICE: Record<string, string> = {
  lock: 'unlock',
  cover: 'open_cover',
  valve: 'open_valve',
  button: 'press',
  vacuum: 'start',
};
const TURN_OFF_SERVICE: Record<string, string> = {
  lock: 'lock',
  cover: 'close_cover',
  valve: 'close_valve',
  vacuum: 'return_to_base',
};
const TOGGLE_SERVICE: Record<string, string> = {
  lock: 'toggle',
  cover: 'toggle',
  valve: 'toggle',
  vacuum: 'toggle',
};

export function turnOnService(domain: string): string {
  return TURN_ON_SERVICE[domain] ?? 'turn_on';
}
export function turnOffService(domain: string): string {
  return TURN_OFF_SERVICE[domain] ?? 'turn_off';
}
export function toggleService(domain: string): string {
  return TOGGLE_SERVICE[domain] ?? 'toggle';
}

export async function toggleEntity(hass: HomeAssistant | undefined, entityId: string): Promise<void> {
  if (!hass) return;
  const [domain] = entityId.split('.');
  if (!domain) return;
  await hass.callService(domain, toggleService(domain), { entity_id: entityId });
}

export function moreInfo(element: HTMLElement, entityId: string): void {
  element.dispatchEvent(new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId },
  }));
}

export function navigatePath(path: string): void {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('location-changed'));
}

export function turnOffAreaType(hass: HomeAssistant | undefined, entityIds: string[]): void {
  if (!hass || entityIds.length === 0) return;
  const byDomain = new Map<string, string[]>();
  for (const eid of entityIds) {
    const domain = eid.split('.')[0] || '';
    if (!domain) continue;
    const list = byDomain.get(domain) || [];
    list.push(eid);
    byDomain.set(domain, list);
  }
  for (const [domain, ids] of byDomain) {
    void hass.callService(domain, turnOffService(domain), { entity_id: ids });
  }
}
