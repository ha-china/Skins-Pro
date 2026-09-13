import { SKINS } from '../skins/generated';
import { AUTO_BASE_PATH, escapeHtml } from '../utils';

export type DashboardConfigRecord = Record<string, any>;

export function fire(el: HTMLElement, config: DashboardConfigRecord): void {
  el.dispatchEvent(new CustomEvent('config-changed', {
    bubbles: true,
    composed: true,
    detail: { config },
  }));
}

export function deepClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}

function drillPath(next: DashboardConfigRecord, path: string): { parent: Record<string, any>; last: string } | null {
  const parts = path.split('.');
  let cur: Record<string, any> = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    if (!p) return null;
    cur[p] = cur[p] || {};
    cur = cur[p] as Record<string, any>;
  }
  const last = parts[parts.length - 1];
  if (!last) return null;
  return { parent: cur, last };
}

export function setField(el: HTMLElement, current: DashboardConfigRecord, path: string, value: any): DashboardConfigRecord {
  const next = deepClone(current);
  const drill = drillPath(next, path);
  if (!drill) return current;
  drill.parent[drill.last] = value;
  fire(el, next);
  return next;
}

export function setListItem(el: HTMLElement, current: DashboardConfigRecord, path: string, index: number, value: string): DashboardConfigRecord {
  const next = deepClone(current);
  const drill = drillPath(next, path);
  if (!drill) return current;
  const arr: string[] = drill.parent[drill.last] || [];
  if (value) {
    arr[index] = value;
    drill.parent[drill.last] = arr;
    fire(el, next);
    return next;
  }
  arr.splice(index, 1);
  drill.parent[drill.last] = arr;
  fire(el, next);
  return next;
}

export function addListItem(el: HTMLElement, current: DashboardConfigRecord, path: string, max?: number): DashboardConfigRecord {
  const next = deepClone(current);
  const drill = drillPath(next, path);
  if (!drill) return current;
  const arr: string[] = drill.parent[drill.last] || [];
  if (max !== undefined && arr.length >= max) return current;
  arr.push('');
  drill.parent[drill.last] = arr;
  fire(el, next);
  return next;
}

export function applySkin(el: HTMLElement, current: DashboardConfigRecord, skin: string): DashboardConfigRecord {
  const next = deepClone(current);
  next.resource_pack = next.resource_pack || {};
  next.resource_pack.skin = skin;
  if (SKINS.includes(skin)) {
    next.resource_pack.base_path = AUTO_BASE_PATH;
  }
  fire(el, next);
  return next;
}

export function buildSkinOptions(config: DashboardConfigRecord): string {
  const current = config.resource_pack?.skin || 'modern';
  const downloaded = ((config.downloaded_skins || []) as string[]).filter((s) => !SKINS.includes(s));
  const bundled = (SKINS as readonly string[]).map((s) => `<option value="${escapeHtml(s)}"${s === current ? ' selected' : ''}>${escapeHtml(s)}</option>`).join('');
  const extra = downloaded.map((s) => `<option value="${escapeHtml(s)}"${s === current ? ' selected' : ''}>${escapeHtml(s)}</option>`).join('');
  return bundled + extra;
}
