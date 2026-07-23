import type { DashboardConfig, DeviceConfig, EnvironmentMetricConfig, NavItemConfig, RoomConfig, SceneConfig } from '../types';

export const DEFAULT_ASSETS: Record<string, string> = {
  base: 'base-texture.jpg',
  stage: 'background.jpg',
  theme_css: 'theme.css',
  avatar: 'avatar.png',
  decor: 'decoration.png',
  light: 'icon-light.png',
  switch: 'icon-switch.png',
  button: 'icon-button.png',
  climate: 'icon-ac.png',
  water_heater: 'icon-water_heater.png',
  humidifier: 'icon-humidifier.png',
  fan: 'icon-fan.png',
  speaker: 'icon-speaker.png',
  remote: 'icon-remote.png',
  lock: 'icon-lock.png',
  camera: 'icon-camera.png',
  cover: 'icon-cover.png',
  valve: 'icon-valve.png',
  automation: 'icon-automation.png',
  media_player: 'icon-media_player.png',
  vacuum: 'icon-vacuum.png',
  sensor: 'icon-sensor.png',
  binary_sensor: 'icon-binary_sensor.png',
  update: 'icon-update.png',
  device_tracker: 'icon-device_tracker.png',
  person: 'icon-person.png',
  garden: 'icon-garden-light.png',
  room_living: 'room-living.jpg',
  room_bedroom: 'room-bedroom.jpg',
  room_kitchen: 'room-kitchen.jpg',
  room_garden: 'room-garden.jpg',
};

export const DEFAULT_NAV: NavItemConfig[] = [
  { key: 'home', icon: 'mdi:home', enabled: true },
  { key: 'devices', icon: 'mdi:devices', enabled: true },
  { key: 'scenes', icon: 'mdi:palette-swatch', enabled: true },
  { key: 'automations', icon: 'mdi:robot', enabled: true },
  { key: 'rooms', icon: 'mdi:door', enabled: true },
  { key: 'security', icon: 'mdi:shield-home', enabled: true },
  { key: 'energy', icon: 'mdi:lightning-bolt', enabled: true },
];

export const DEFAULT_DEVICES: DeviceConfig[] = [
  { entity: 'light.living_room_lights', image: 'light', color: 'yellow' },
  { entity: 'climate.living_room_ac', image: 'climate', color: 'blue', temperature_entity: 'sensor.living_room_temperature' },
  { entity: 'media_player.living_room_speaker', image: 'speaker', color: 'purple' },
  { entity: 'lock.front_door', image: 'lock', color: 'red' },
  { entity: 'light.garden_light_strip', image: 'garden', color: 'green' },
];

export const DEFAULT_ROOMS: RoomConfig[] = [
  { image: 'room_living', info_entity: 'sensor.living_room_summary' },
  { image: 'room_bedroom', info_entity: 'sensor.bedroom_summary' },
  { image: 'room_kitchen', info_entity: 'sensor.kitchen_summary' },
  { image: 'room_garden', info_entity: 'sensor.garden_summary' },
];

export const DEFAULT_SCENES: SceneConfig[] = [
  { entity: 'scene.home_mode', tone: 'morning', icon: 'mdi:home-import-outline', confirm: true },
  { entity: 'scene.good_night', tone: 'night', icon: 'mdi:weather-night', confirm: true },
  { entity: 'scene.welcome_home', tone: 'movie', icon: 'mdi:home-heart', confirm: true },
  { entity: 'scene.away_mode', tone: 'game', icon: 'mdi:exit-run', confirm: true },
];

export const DEFAULT_ENVIRONMENT: EnvironmentMetricConfig[] = [
  { entity: 'sensor.living_room_temperature', icon: 'mdi:thermometer', unit: '°C', variant: 'temp' },
  { entity: 'sensor.living_room_humidity', icon: 'mdi:water-percent', unit: '%', variant: 'hum' },
  { entity: 'sensor.pm25', icon: 'mdi:leaf', unit: '', variant: 'pm' },
];

export const DEFAULT_CONFIG: DashboardConfig = {
  type: 'custom:skins-pro-card',
  language: 'auto',
  resource_pack: {
    skin: 'modern',
    base_path: '__AUTO__',
    assets: DEFAULT_ASSETS,
  },
  weather: {
    entity: 'weather.home',
    temperature_entity: 'sensor.outdoor_temperature',
  },
  info: {
    entity: 'input_text.daily_quote',
  },
  fullscreen: false,
  use_area_pictures: false,
  downloaded_skins: [],
  devices: DEFAULT_DEVICES,
  rooms: DEFAULT_ROOMS,
  scenes: DEFAULT_SCENES,
  environment: DEFAULT_ENVIRONMENT,
  nav: DEFAULT_NAV,
  energy: {
    entity: 'sensor.energy_cost_today',
    unit: 'kWh',
  },
  media_player: {
    entity: '',
  },
  camera: {
    entity: '',
  },
  home_limits: {
    devices: 4,
    rooms: 4,
    scenes: 6,
    environment: 5,
  },
  home_selection: {
    devices: [],
    rooms: [],
    scenes: [],
    environment: [],
  },
};