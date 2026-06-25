import { buildAutoConfig, MinecraftDashboardCard } from './skins-pro-card';
import { MinecraftDashboardCardEditor } from './skins-pro-card-editor';

const CARD_TYPE = 'skins-pro-card';
const DASHBOARD_STRATEGY_TYPE = 'skins-pro';
const DASHBOARD_STRATEGY_TAG = `ll-strategy-dashboard-${DASHBOARD_STRATEGY_TYPE}`;

const safeDefine = (name: string, constructor: CustomElementConstructor) => {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
};

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description?: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
    customStrategies?: Array<{
      type: string;
      strategyType: 'dashboard' | 'view';
      name: string;
      description?: string;
      documentationURL?: string;
    }>;
  }
}

class SkinsProStrategy {
  public static async generate(_config?: unknown, hass?: unknown): Promise<Record<string, unknown>> {
    const autoConfig = hass && typeof hass === 'object' ? buildAutoConfig(hass as any) : { type: `custom:${CARD_TYPE}` };
    return {
          title: 'Skins Pro',
      views: [
        {
          title: 'Home',
          path: 'home',
          panel: true,
          cards: [
            {
              ...autoConfig,
            },
          ],
        },
      ],
    };
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    const element = document.createElement('div');
      element.innerHTML = '<div class="sp-strategy-info">Skins Pro uses the built-in default layout. Add the dashboard first, then customize entities and resource pack in the card editor only if needed.</div>';
    return element;
  }
}

const createDashboardStrategyElement = () => class extends HTMLElement {
  public static async generate(config: unknown, hass: unknown): Promise<Record<string, unknown>> {
    return SkinsProStrategy.generate(config, hass);
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    return SkinsProStrategy.getConfigElement();
  }
};

safeDefine(CARD_TYPE, MinecraftDashboardCard);
safeDefine('skins-pro-card-editor', MinecraftDashboardCardEditor);
safeDefine(DASHBOARD_STRATEGY_TAG, createDashboardStrategyElement());

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card?.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: 'Skins Pro Card',
    preview: true,
    description: 'Skin-switchable Home Assistant dashboard card with bilingual copy and replaceable resource packs.',
    documentationURL: 'https://github.com/ha-china/html-card-pro/discussions/11',
  });
}

window.customStrategies = window.customStrategies || [];
if (!window.customStrategies.some((item) => item?.type === DASHBOARD_STRATEGY_TYPE && item?.strategyType === 'dashboard')) {
  window.customStrategies.push({
    type: DASHBOARD_STRATEGY_TYPE,
    strategyType: 'dashboard',
    name: 'Skins Pro',
    description: 'A simplified multi-skin dashboard that can be added directly from Community dashboards.',
    documentationURL: 'https://github.com/ha-china/html-card-pro/discussions/11',
  });
}

console.log('Skins Pro Card loaded');

export { MinecraftDashboardCard };
