import type { HomeAssistant } from '../types';
import type { Language } from '../i18n';
import { t, clearSkinMetadata } from '../utils';
import { deepClone, fire, type DashboardConfigRecord } from './config';

export const CDN_STORE = 'https://skins.hachina.dpdns.org';
export const STATS_API = 'https://hachina.dpdns.org';

const SKIN_DEP_URL = 'https://github.com/ha-china/skins-pro-hass';
const BATCH_SIZE = 20;
const SKIN_STATS_CACHE_MS = 5 * 60 * 1000;

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
let skinStatsFetchTs = 0;

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
  tags?: string[];
  description?: string;
}

export interface SkinStoreState {
  open: boolean;
  loading: boolean;
  error: string;
  themes: SkinStoreTheme[];
  searchQuery: string;
  hasMore: boolean;
  displayedCount: number;
}

function filterThemes(themes: SkinStoreTheme[], query: string): SkinStoreTheme[] {
  const q = query.trim();
  if (!q) return themes;

  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return themes;

  return themes.filter(theme => {
    const haystack = [
      theme.id,
      theme.name || '',
      theme.author || '',
      ...(theme.tags || []),
      theme.description || '',
    ].join(' ').toLowerCase();

    for (const token of tokens) {
      if (!haystack.includes(token)) return false;
    }
    return true;
  });
}

export function renderSkinStore(
  state: SkinStoreState,
  config: DashboardConfigRecord,
  language: Language,
): string {
  const displayStyle = state.open ? 'display:flex' : 'display:none';

  if (!state.open) {
    return `
    <div class="nav-overlay" data-store-overlay style="${displayStyle}">
      <div class="nav-dialog" style="max-width:1200px;width:95vw">
        <h3>${t(language, 'editorSkinStore')}</h3>
        <div data-store-body></div>
      </div>
    </div>`;
  }

  return `
    <div class="nav-overlay" data-store-overlay style="${displayStyle}">
      <div class="nav-dialog" style="max-width:1200px;width:95vw">
        <h3>${t(language, 'editorSkinStore')} <span class="store-dependency" style="font-size:0.7em;font-weight:400;color:var(--sp-text-muted,#888)">${linkifyDep(t(language, 'editorSkinStoreDependency'), language)}</span></h3>
        <div data-store-body>
          ${renderSkinStoreBody(state, config, language)}
        </div>
      </div>
    </div>
  `;
}

export function renderSkinStoreBody(
  state: SkinStoreState,
  config: DashboardConfigRecord,
  language: Language,
): string {
  if (state.loading) {
    return `<p style="text-align:center;padding:40px 0;color:var(--sp-text-muted,#888)">${t(language, 'loadingQuote')}</p>`;
  }
  if (state.error) {
    return `<p style="text-align:center;padding:40px 0;color:var(--sp-error,#e44)">${t(language, 'editorSkinStoreLoadFailed')}</p>`;
  }
  const downloaded: string[] = config.downloaded_skins || [];
  const filtered = filterThemes(state.themes, state.searchQuery);
  const displayedCount = state.displayedCount || BATCH_SIZE;
  const visible = filtered.slice(0, displayedCount);

  const cards = visible.map(theme => {
    const installed = downloaded.includes(theme.id);
    const dlCount = theme.downloads ?? '-';
    const likeCount = theme.likes ?? 0;
    const likedClass = theme.userLiked ? ' liked' : '';
    const tagsHtml = theme.tags?.length
      ? `<div class="store-tags">${theme.tags.slice(0, 4).map(tag => `<span class="store-tag">${tag}</span>`).join('')}</div>`
      : '';
    return `
      <div class="store-card ${installed ? 'store-installed' : ''}" data-store-theme="${theme.id}">
        <img src="${CDN_STORE}/${theme.thumbnail}" alt="${theme.name}" class="store-thumb" loading="lazy">
        <div class="store-info">
          <span class="store-name">${theme.name}${theme.author ? `<a href="https://github.com/${theme.author}" target="_blank" rel="noopener noreferrer" class="store-author">${theme.author}</a>` : ''}${theme.hasUpdate ? `<span class="store-update-badge">${t(language, 'editorSkinStoreNewVersion')}</span>` : ''}</span>
          ${tagsHtml}
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
  });

  const remaining = Math.max(0, filtered.length - displayedCount);
  const loader = remaining > 0
    ? `<div class="store-load-indicator" style="text-align:center;padding:12px;font-size:var(--sp-font-2xs,11px);color:var(--sp-text-muted,#888)">
        ${t(language, 'showAll')} (${remaining})
      </div>`
    : '';

  const resultLabel = filtered.length > 0
    ? `<div class="store-result-count" style="font-size:var(--sp-font-3xs,10px);color:var(--sp-text-muted,#888);margin-bottom:8px;padding:0 4px">${displayedCount} / ${filtered.length}</div>`
    : '';

  return `
      <input type="text" class="store-search" data-store-search placeholder="${t(language, 'editorSkinStoreSearch')}" value="${state.searchQuery || ''}" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:var(--sp-radius-pill,999px);border:1px solid var(--sp-border-muted,var(--divider-color,rgba(0,0,0,0.12)));background:var(--sp-device-bg,rgba(128,128,128,0.06));color:var(--sp-text-main,inherit);font:inherit;font-size:var(--sp-font-xs,14px);outline:none;margin-bottom:var(--sp-space-md,16px);">
      ${resultLabel}
      <div class="store-grid">${cards.join('')}</div>
      ${loader}
      <div class="nav-dialog-actions">
        <button class="nav-cancel" data-store-close>${t(language, 'editorSkinStoreClose')}</button>
      </div>`;
}

export async function fetchSkinThemes(): Promise<SkinStoreTheme[]> {
  const res = await fetch(`${CDN_STORE}/screenshots/registry.json?t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as SkinStoreTheme[];
  const themes = Array.isArray(data) ? data : [];
  return themes;
}

export async function fetchLocalSkinVersions(skins: string[]): Promise<Record<string, string>> {
  if (skins.length === 0) return {};
  const results: Record<string, string> = {};
  const chunkSize = 8;
  const chunks: string[][] = [];
  for (let i = 0; i < skins.length; i += chunkSize) {
    chunks.push(skins.slice(i, i + chunkSize));
  }
  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (skin) => {
      try {
        const res = await fetch(`/local/skins-pro/${skin}/strings.json?v=${Date.now()}`);
        if (res.ok) {
          const data = await res.json() as Record<string, unknown>;
          if (typeof data.version === 'string' && data.version) results[skin] = data.version;
        }
      } catch { /* ignore */ }
    }));
  }
  return results;
}

export async function fetchSkinStats(): Promise<void> {
  const now = Date.now();
  if (skinStatsFetchTs > 0 && (now - skinStatsFetchTs) < SKIN_STATS_CACHE_MS) return;
  try {
    const res = await fetch(`${STATS_API}/api/stats`);
    if (res.ok) {
      skinStats = await res.json();
      skinStatsFetchTs = now;
    }
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