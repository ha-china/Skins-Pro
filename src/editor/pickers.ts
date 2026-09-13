import type { AreaRegistryEntry } from '../types';
import type { Language } from '../i18n';
import { t, escapeHtml } from '../utils';

const ENTITY_PICKER_TAG = 'ha-entity-picker';

export { CONTROLLABLE_DOMAIN_LIST as CONTROLLABLE_DOMAINS } from '../selectors/domains';

export { ENTITY_PICKER_TAG };

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

export function entityPicker(label: string, path: string, value: string, domains?: string[], deviceClasses?: string[]): string {
  const dFilter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
  const dcFilter = deviceClasses?.length ? ` include-device-classes='${JSON.stringify(deviceClasses)}'` : '';
  return `
    <label>
      <span>${label}</span>
      <${ENTITY_PICKER_TAG} data-path="${path}"${dFilter}${dcFilter} value="${escapeAttr(value || '')}"></${ENTITY_PICKER_TAG}>
    </label>
  `;
}

export function listPicker(label: string, path: string, values: string[], domains?: string[], max?: number): string {
  const filter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
  const arr = Array.isArray(values) ? values : [];
  const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
    <div class="selector-row">
      <${ENTITY_PICKER_TAG} data-list-path="${path}" data-list-index="${i}"${filter} value="${escapeAttr(val || '')}"></${ENTITY_PICKER_TAG}>
      <button class="sp-del" data-del-path="${path}" data-del-index="${i}">✕</button>
    </div>
  `).join('');
  const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-path="${path}" data-add-max="${max ?? ''}">+</button>`;
  return `
    <label>
      <span>${label}</span>
      <div class="sp-list">${rows}</div>
      ${addBtn}
    </label>
  `;
}

export function areaPicker(
  areas: AreaRegistryEntry[],
  areasLoaded: boolean,
  values: string[],
  max: number | undefined,
  language: Language,
): string {
  if (!areasLoaded || areas.length === 0) {
    return `<p class="muted">${t(language, 'editorLoadingAreas')}</p>`;
  }
  const arr = Array.isArray(values) ? values : [];
  const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
    <div class="selector-row">
      <select data-area-path="home_selection.rooms" data-area-index="${i}">
        <option value="">—</option>
        ${areas.map(a => `<option value="${escapeAttr(a.area_id)}"${a.area_id === val ? ' selected' : ''}>${escapeHtml(a.name)}</option>`).join('')}
      </select>
      <button class="sp-del" data-del-area-path="home_selection.rooms" data-del-area-index="${i}">✕</button>
    </div>
  `).join('');
  const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-area-path="home_selection.rooms" data-add-max="${max ?? ''}">+</button>`;
  return `
    <div class="sp-list">${rows}</div>
    ${addBtn}
  `;
}
