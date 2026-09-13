// Skins Pro — standalone rewrite inspired by dwains-dashboard-next concepts
// Architecture reference: https://github.com/dwainscheeren/dwains-dashboard-next

import { buildAutoConfig } from './config';
import { SkinsProCard } from './skins-pro-card';
import './skins-pro-card-editor';

const CARD_TYPE = 'skins-pro-card';
const DASHBOARD_STRATEGY_TYPE = 'skins-pro';
const DASHBOARD_STRATEGY_TAG = `ll-strategy-dashboard-${DASHBOARD_STRATEGY_TYPE}`;

const registered = new Set<string>();

function defineElement(name: string, constructor: CustomElementConstructor) {
  if (registered.has(name)) return;
  try {
    customElements.define(name, constructor);
    registered.add(name);
  } catch {
    // already defined, skip
  }
}

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
    const savedConfig = (_config && typeof _config === 'object' ? _config : {}) as Record<string, any>;
    const { type: _ignoredStrategyType, ...userConfig } = savedConfig;
    let cardConfig: Record<string, any>;

    if (hass && typeof hass === 'object') {
      try {
        const autoConfig = buildAutoConfig(hass as any);
        const sc = (key: string) => savedConfig[key] || {};
        cardConfig = {
          ...autoConfig,
          ...userConfig,
          type: `custom:${CARD_TYPE}`,
          weather: { ...autoConfig.weather, ...sc('weather') },
          energy: { ...autoConfig.energy, ...sc('energy') },
          info: { ...autoConfig.info, ...sc('info') },
          resource_pack: { ...autoConfig.resource_pack, ...sc('resource_pack') },
          home_selection: { ...autoConfig.home_selection, ...sc('home_selection') },
        };
      } catch (err) {
        console.error('[SkinsPro] generate error', err);
        cardConfig = { ...userConfig, type: `custom:${CARD_TYPE}` };
      }
    } else {
      cardConfig = { ...userConfig, type: `custom:${CARD_TYPE}` };
    }

    return {
      title: 'Skins Pro',
      views: [
        {
          title: 'Home',
          path: 'home',
          panel: true,
          cards: [cardConfig],
        },
      ],
    };
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('skins-pro-card-editor');
  }
}

class SkinsProStrategyDashboard extends HTMLElement {
  public static async generate(config: unknown, hass: unknown): Promise<Record<string, unknown>> {
    return SkinsProStrategy.generate(config, hass);
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    return SkinsProStrategy.getConfigElement();
  }
}

defineElement(CARD_TYPE, SkinsProCard);
defineElement(DASHBOARD_STRATEGY_TAG, SkinsProStrategyDashboard);

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

export { SkinsProCard };
