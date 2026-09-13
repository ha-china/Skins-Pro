import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { TranslationKey } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderMaintenanceCard } from '../components/maintenance';
import { renderBars } from '../components/energy-bars';
import { localizedText } from '../utils';

function energyLabel(ctx: RenderContext, key: string): string {
  if (key === 'todayEnergy' || key === 'gridReturn') {
    return ctx.translate(key as TranslationKey);
  }
  return ctx.hass.localize?.('ui.panel.energy.' + key) || key;
}

export function renderEnergyView(
  ctx: RenderContext,
  energyValue: string,
  _energyUnit: string,
  compareValue: string,
): TemplateResult {
  const sources = ctx.energySources.length > 0 ? ctx.energySources : (
    energyValue !== '--' ? [{
      key: 'todayEnergy',
      entityId: ctx.config.energy?.entity || '',
      icon: 'mdi:lightning-bolt',
      unit: ctx.config.energy?.unit || 'kWh',
      history: ctx.energyHistory || [],
      yesterday: compareValue || undefined,
      today: energyValue,
    }] : []
  );

  return renderPageShell(
    ctx.translate('energy'),
    ctx.translate('todayEnergy'),
    html``,
    html`
      <div class="page-body single-column energy-detail-page">
        ${sources.map((src) => {
          const bars = renderBars(src.history);
          const label = energyLabel(ctx, src.key);
          return html`
            <section class="glass-card panel-energy page-energy-card compact-energy-card">
              <div class="section-title"><h2><ha-icon icon="${src.icon}"></ha-icon> ${label}</h2></div>
              <div class="env-list compact-energy-list">
                <div class="env-row"><div class="dot temp"><ha-icon icon="${src.icon}"></ha-icon></div><div class="muted">${label}</div><div class="env-value">${src.today} ${src.unit}</div></div>
                <div class="env-row"><div class="dot hum"><ha-icon icon="mdi:compare-vertical"></ha-icon></div><div class="muted">${ctx.translate('compareYesterday')}</div><div class="env-value">${src.yesterday || '--'}</div></div>
              </div>
              <div class="bars compact-energy-bars">${bars}</div>
            </section>
          `;
        })}
        ${renderMaintenanceCard(ctx.hass, ctx.translate)}
      </div>
    `
  );
}

export function renderHomeEnergyCard(
  ctx: RenderContext,
  energyValue: string,
  energyUnit: string,
  compareValue: string,
  energyBars: TemplateResult,
): TemplateResult | typeof nothing {
  if (!ctx.config.energy?.entity) return nothing;
  // Portrait + no data hides via .sp-energy-nodata in the structural CSS —
  // no JS breakpoint branch, so rotation reacts instantly.
  return html`
    <section class="glass-card panel-energy sp-energy-home-card${energyValue === '--' ? ' sp-energy-nodata' : ''}">
      <div class="section-title"><h2>${ctx.translate('todayEnergy')}</h2></div>
      <div class="energy-value">${energyValue}<small> ${energyUnit}</small></div>
      <div class="bars sp-energy-bars">${energyBars}</div>
      <div class="energy-footer"><span class="muted">${localizedText(ctx.config.energy?.compare_text, ctx.config.energy?.compare_text_zh, ctx.config.energy?.compare_text_en, ctx.language, ctx.translate('compareYesterday'))}</span><span class="down">${compareValue || '--'}</span></div>
    </section>
  `;
}
