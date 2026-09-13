// Single source of truth for "controllable" domains.
// Previously duplicated as a Set in src/components/device-card.ts and as an
// array in src/editor/pickers.ts.
export const CONTROLLABLE_DOMAIN_LIST: readonly string[] = [
  'light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock', 'climate',
  'vacuum', 'humidifier', 'water_heater', 'siren', 'automation', 'group', 'input_boolean',
];

export const CONTROLLABLE_DOMAINS: ReadonlySet<string> = new Set(CONTROLLABLE_DOMAIN_LIST);
