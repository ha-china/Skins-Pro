# Skins Pro

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Desmond-Dong&repository=Skins-Pro&category=plugin)

A Minecraft-style Home Assistant dashboard card with bilingual (zh/en) support and replaceable resource packs.

一款 Minecraft 风格的 Home Assistant 仪表盘卡片，支持中英文双语和可替换资源包。

- direct add from Home Assistant Community dashboards / 可从 Community dashboards 直接添加
- no runtime dependencies / 无运行时依赖
- Chinese and English labels / 中英文标签
- replaceable resource packs for visuals and style / 可替换的皮肤资源包
- auto-detects entities on first add / 首次添加时自动探测实体
- all assets bundled — install and go / 所有资源打包在内，安装即用

## Credits

- **Original Project**: [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next) — architectural inspiration.
- **Initial Assets & Design**: [html-card-pro Discussions](https://github.com/ha-china/html-card-pro/discussions/11) — initial skin assets and visual concept.

## Installation

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Desmond-Dong&repository=Skins-Pro&category=plugin)

1. Click the badge above, or go to HACS → Custom repositories and add `https://github.com/Desmond-Dong/Skins-Pro` as a Dashboard.
2. Install `Skins Pro`.
3. Reload the Home Assistant frontend if prompted.
4. Go to `Settings → Dashboards → Add dashboard` and select `Skins Pro`.

## Default Behavior

After adding the dashboard, it creates one dashboard view with one custom card:

```yaml
type: custom:skins-pro-card
```

The card contains built-in defaults for:

- weather
- quote
- device shortcuts
- room snapshots
- scene buttons
- energy block
- bilingual labels

When the dashboard is added from Community dashboards, the strategy now tries to auto-detect common Home Assistant entities and writes a usable default card config for you.

If the mapping is not ideal, you can open the card editor in the UI and adjust it there without editing YAML.

If your entity IDs match the defaults closely, it works with minimal editing. If not, you can edit the card config in the dashboard UI and remap the entities.

## Resource Packs

Resource packs let you change the visual style without changing code.

By default, the repository ships with bundled skins under:

```text
/hacsfiles/<repository>/skins-pro/{skin}/
```

The auto-detection logic resolves assets from `import.meta.url`, so in most cases you do not need to set `resource_pack.base_path` manually. After installation via HACS, the path resolves automatically.

You can still use `resource_pack.base_path` to point to your own asset directory, and optionally override file names in `resource_pack.assets` or CSS tokens in `resource_pack.theme`.

Bundled skins:

```text
skins-pro/
  default/
    base-texture.jpg
    stage-background.jpg
    avatar-steve.jpg
    decor-wolf-lantern.jpg
    icon-light.jpg
    icon-ac.jpg
    icon-speaker.jpg
    icon-lock.jpg
    icon-garden-light.jpg
    room-living.jpg
    room-bedroom.jpg
    room-kitchen.jpg
    room-garden.jpg
    theme.css
  minecraft/
    base-texture.jpg
    stage-background.jpg
    avatar-steve.jpg
    decor-wolf-lantern.jpg
    icon-light.jpg
    icon-ac.jpg
    icon-speaker.jpg
    icon-lock.jpg
    icon-garden-light.jpg
    room-living.jpg
    room-bedroom.jpg
    room-kitchen.jpg
    room-garden.jpg
    theme.css
```

Example card config:

```yaml
type: custom:skins-pro-card
language: auto
resource_pack:
  base_path: __AUTO__
  theme:
    --mc-sidebar-width: 190px
    --mc-app-padding: 18px
    --mc-stage-radius: 32px
    --mc-glass-bg: rgba(32,14,3,.92)
    --mc-panel-bg: rgba(245,240,230,.95)
devices:
  - entity: light.living_room_lights
    name_zh: 客厅灯光
    name_en: Living lights
    area_zh: 客厅
    area_en: Living room
    image: light
    action: toggle
    color: yellow
  - entity: climate.living_room_ac
    name_zh: 空调
    name_en: Air conditioner
    area_zh: 客厅
    area_en: Living room
    image: climate
    action: more-info
    color: blue
    temperature_entity: sensor.living_room_temperature
rooms:
  - name_zh: 客厅
    name_en: Living room
    image: room_living
    info_entity: sensor.living_room_summary
    target: /lovelace/living-room
scenes:
  - entity: scene.good_night
    name_zh: 晚安
    name_en: Night
    subtitle_zh: 晚安场景
    subtitle_en: Good night
    icon: mdi:weather-night
    tone: night
    confirm: true
```

## Language

Set `language` to one of these values:

- `auto`: follow Home Assistant language
- `zh-CN`: force Chinese
- `en`: force English

For most labels, you can define both `*_zh` and `*_en` fields.

## No-YAML Workflow

The intended flow is now:

1. Add `Skins Pro` from Community dashboards.
2. Let the built-in strategy auto-detect common entities.
3. If needed, open the card editor and fix weather, quote, energy, and resource pack path visually.

You do not need to manually paste a full Lovelace YAML template anymore.

## Community Dashboard Strategy

This project still registers itself as a dashboard strategy so it can be added directly from Community dashboards.

Registered strategy types:

- `skins-pro`

Registered card types:

- `skins-pro-card`

## Development

```bash
npm install
npm run type-check
npm run build
```

Build output:

```text
dist/skins-pro.js
```

## Notes

- This project is a complete rewrite and fork of [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next). It has its own independent Git history and release cycle.
- The project no longer depends on `lit`, `memoize-one`, or other runtime packages.
- The current implementation is intentionally minimal and opinionated.
- If needed, more visual packs can be added later without bringing back the old complex settings architecture.
