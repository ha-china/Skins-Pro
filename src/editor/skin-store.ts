import type { HomeAssistant } from '../types';
import type { Language } from '../i18n';
import { t, clearSkinMetadata } from '../utils';
import { deepClone, fire, type DashboardConfigRecord } from './config';

export const CDN_STORE = 'https://skins.hachina.dpdns.org';
export const STATS_API = 'https://hachina.dpdns.org';

const SKIN_DEP_URL = 'https://github.com/ha-china/skins-pro-hass';

function linkifyDep(text: string, lang: Language): string {
  const label = lang === 'zh-CN' ? '集成' : 'integration';
  return text.replace(label, `<a href="${SKIN_DEP_URL}" target="_blank" rel="noopener noreferrer">${label}</a>`);
}

function getVoterId(): string {
  let id = localStorage.getItem('skins_pro_voter');
  if (!id) {
    try { id = crypto.randomUUID(); } catch { /* fallback */ }
    if (!id) id = 'v' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('skins_pro_voter', id);
  }
  return id;
}

export let skinStats: Record<string, { downloads: number; liked: number }> = {};

function getLikedSkins(): Set<string> {
  try {
    const raw = localStorage.getItem('skins_pro_liked');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveLikedSkin(skin: string, liked: boolean): void {
  const set = getLikedSkins();
  liked ? set.add(skin) : set.delete(skin);
  localStorage.setItem('skins_pro_liked', JSON.stringify([...set]));
}

export interface SkinStoreTheme {
  id: string;
  name: string;
  thumbnail: string;
  author?: string;
  version?: string;
  hasUpdate?: boolean;
  downloads?: number;
  likes?: number;
  userLiked?: boolean;
}

export interface SkinStoreState {
  open: boolean;
  loading: boolean;
  error: string;
  themes: SkinStoreTheme[];
  searchQuery: string;
}

export function renderSkinStore(
  state: SkinStoreState,
  config: DashboardConfigRecord,
  language: Language,
): string {
  if (!state.open) return '';

  let content: string;
  if (state.loading) {
    content = `<p style="text-align:center;padding:40px 0;color:var(--sp-text-muted,#888)">${t(language, 'loadingQuote')}</p>`;
  } else if (state.error) {
    content = `<p style="text-align:center;padding:40px 0;color:var(--sp-error,#e44)">${t(language, 'editorSkinStoreLoadFailed')}</p>`;
  } else {
    const downloaded: string[] = config.downloaded_skins || [];
    const query = (state.searchQuery || '').toLowerCase().trim();
    const filtered = query ? state.themes.filter(th => th.id.toLowerCase().includes(query) || (th.name || '').toLowerCase().includes(query) || (th.author || '').toLowerCase().includes(query)) : state.themes;
    content = `
      <input type="text" class="store-search" data-store-search placeholder="${t(language, 'editorSkinStoreSearch')}" value="${state.searchQuery || ''}" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:var(--sp-radius-pill,999px);border:1px solid var(--sp-border-muted,var(--divider-color,rgba(0,0,0,0.12)));background:var(--sp-device-bg,rgba(128,128,128,0.06));color:var(--sp-text-main,inherit);font:inherit;font-size:var(--sp-font-xs,14px);outline:none;margin-bottom:var(--sp-space-md,16px);">
      <div class="store-grid">${filtered.map(theme => {
      const installed = downloaded.includes(theme.id);
      const dlCount = theme.downloads ?? '-';
      const likeCount = theme.likes ?? 0;
      const likedClass = theme.userLiked ? ' liked' : '';
      return `
      <div class="store-card ${installed ? 'store-installed' : ''}" data-store-theme="${theme.id}">
        <img src="${CDN_STORE}/${theme.thumbnail}" alt="${theme.name}" class="store-thumb" loading="lazy">
        <div class="store-info">
          <span class="store-name">${theme.name}${theme.author ? `<a href="https://github.com/${theme.author}" target="_blank" rel="noopener noreferrer" class="store-author">${theme.author}</a>` : ''}${theme.hasUpdate ? `<span class="store-update-badge">${t(language, 'editorSkinStoreNewVersion')}</span>` : ''}</span>
          <div class="store-actions">
            <span class="store-dl-count">⬇ ${dlCount}</span>
            <button class="store-like${likedClass}" data-store-like="${theme.id}">
              ${theme.userLiked ? '❤️' : '🤍'} <span class="store-like-count">${likeCount}</span>
            </button>
          </div>
          ${installed
            ? theme.hasUpdate
              ? `<div style="display:flex;gap:6px"><button class="store-download" data-store-download="${theme.id}">${t(language, 'editorSkinStoreRedownload')}</button><button class="store-remove" data-store-remove="${theme.id}">${t(language, 'editorSkinStoreRemove')}</button></div>`
              : `<button class="store-remove" data-store-remove="${theme.id}">${t(language, 'editorSkinStoreRemove')}</button>`
            : `<button class="store-download" data-store-download="${theme.id}">${t(language, 'editorSkinStoreDownload')}</button>`
          }
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  return `
    <div class="nav-overlay" data-store-overlay style="display:flex">
      <div class="nav-dialog" style="max-width:1200px;width:95vw">
        <h3>${t(language, 'editorSkinStore')} <span class="store-dependency" style="font-size:0.7em;font-weight:400;color:var(--sp-text-muted,#888)">${linkifyDep(t(language, 'editorSkinStoreDependency'), language)}</span></h3>
        ${content}
        <div class="nav-dialog-actions">
          <button class="nav-cancel" data-store-close>${t(language, 'editorSkinStoreClose')}</button>
        </div>
      </div>
    </div>
  `;
}

export async function fetchSkinThemes(): Promise<SkinStoreTheme[]> {
  const res = await fetch(`${CDN_STORE}/screenshots/registry.json?t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as SkinStoreTheme[];
  const themes = Array.isArray(data) ? data : [];
  for (let i = themes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [themes[i], themes[j]] = [themes[j]!, themes[i]!];
  }
  return themes;
}

export async function fetchLocalSkinVersions(skins: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  await Promise.all(skins.map(async (skin) => {
    try {
      const res = await fetch(`/local/skins-pro/${skin}/strings.json?v=${Date.now()}`);
      if (res.ok) {
        const data = await res.json() as Record<string, unknown>;
        if (typeof data.version === 'string' && data.version) results[skin] = data.version;
      }
    } catch { /* ignore */ }
  }));
  return results;
}

export async function fetchSkinStats(): Promise<void> {
  try {
    const res = await fetch(`${STATS_API}/api/stats`);
    if (res.ok) skinStats = await res.json();
  } catch { /* ignore */ }
}

export async function toggleLike(skin: string): Promise<{ liked: boolean; total: number } | null> {
  try {
    const res = await fetch(`${STATS_API}/api/like/${skin}`, {
      method: 'POST',
      headers: { 'X-Skin-Voter': getVoterId() },
    });
    if (!res.ok) return null;
    const data = await res.json();
    saveLikedSkin(skin, data.userLiked);
    return { liked: data.userLiked, total: data.liked };
  } catch { return null; }
}

export function isSkinLiked(skin: string): boolean {
  return getLikedSkins().has(skin);
}

export function removeSkin(
  el: HTMLElement,
  currentConfig: DashboardConfigRecord,
  hass: HomeAssistant | undefined,
  skinId: string,
): DashboardConfigRecord {
  void (hass as any)?.callService('skins_pro', 'remove_skin', { skin_id: skinId }).catch(() => { /* integration not installed */ });
  const next = deepClone(currentConfig);
  const list: string[] = next.downloaded_skins || [];
  const idx = list.indexOf(skinId);
  if (idx !== -1) list.splice(idx, 1);
  next.downloaded_skins = list;
  if (next.resource_pack?.skin === skinId) {
    next.resource_pack.skin = 'modern';
    next.resource_pack.base_path = '__AUTO__';
  }
  fire(el, next);
  return next;
}

export interface DownloadResult {
  success: boolean;
  errorMessage?: string;
}

export async function downloadSkin(
  el: HTMLElement,
  currentConfig: DashboardConfigRecord,
  hass: HomeAssistant | undefined,
  skinId: string,
  language: Language,
): Promise<DownloadResult> {
  try {
    await (hass as any)?.callService('skins_pro', 'download_skin', { skin_id: skinId });
    clearSkinMetadata(skinId);
    const next = deepClone(currentConfig);
    next.resource_pack = next.resource_pack || {};
    next.resource_pack.skin = skinId;
    next.resource_pack.base_path = `/local/skins-pro/${skinId}/`;
    next.downloaded_skins = [...new Set([...(next.downloaded_skins || []), skinId])];
    fire(el, next);
    fetch(`${STATS_API}/api/download/${skinId}`, { method: 'POST' }).catch(() => {});
    return { success: true };
  } catch (err: any) {
    const raw = err?.message || t(language, 'editorSkinStoreDependency');
    return { success: false, errorMessage: t(language, 'editorDownloadFailed', { message: raw }) };
  }
}
