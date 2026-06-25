# Skins Pro

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Desmond-Dong&repository=Skins-Pro&category=plugin)

给你的 Home Assistant 换上 Minecraft 风格的主页吧！

Skins Pro 是一款社区仪表盘卡片，把整个界面变成了 MC 风格的启动器。自带中英文双语，还支持换皮肤——装上就能用，不用折腾。

- 从 Community dashboards 直接添加，开箱即用
- 内置两套皮肤（默认 &  Minecraft），也可以自己换
- 首次添加会自动帮你匹配家里的设备
- 所有资源打包在 dist 里，HACS 安装一次搞定

## Credits

- [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next) — 架构灵感来源
- [html-card-pro Discussions](https://github.com/ha-china/html-card-pro/discussions/11) — 最初的皮肤素材和视觉设计

## Installation

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Desmond-Dong&repository=Skins-Pro&category=plugin)

点上面的按钮一键添加，或者手动操作：

1. HACS → 自定义仓库 → 添加 `https://github.com/Desmond-Dong/Skins-Pro`，类型选 Dashboard
2. 安装 Skins Pro
3. 刷新 Home Assistant 前端
4. 设置 → 仪表盘 → 添加仪表盘 → 选 Skins Pro

## 开箱即用

添加后会自动创建一个带 Skins Pro 卡片的仪表盘，内置以下板块：

- ☀️ 天气
- 💬 语录展示
- 📱 快捷设备控制
- 🚪 房间快照
- 🎬 场景按钮
- ⚡ 今日用电
- 🌐 中英文自动切换

首次添加时会自动扫描你的 Home Assistant，尽量匹配已有的实体。如果匹配得不够准，直接在卡片编辑界面改就行，不用写 YAML。

## 换皮肤 / Resource Packs

内置了两套皮肤，装完就能切。你也可以自己定义资源路径和 CSS 变量来换风格。

默认路径会自动检测（基于 `import.meta.url`），装了 HACS 不用配就能用。如果你想用自己的素材，配一下 `resource_pack.base_path` 就行。

内置皮肤：

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

## 语言 / Language

`language` 支持三个值：

- `auto` — 跟随 Home Assistant 系统语言
- `zh-CN` — 强制中文
- `en` — 英文

每个标签都可以分别配 `*_zh` 和 `*_en`，不配的话会用内置默认值。

## 不想写 YAML？

本来就不用写。添加完仪表盘后，卡片会自动匹配你的实体。哪里不满意，在 UI 编辑界面改就行。

内部注册的资源：

- 仪表盘策略：`skins-pro`
- 卡片类型：`custom:skins-pro-card`

## 本地开发

```bash
npm install
npm run type-check
npm run build
```

构建产物在 `dist/`：

```
dist/
├── skins-pro.js          ← 主 JS
└── skins-pro/            ← 皮肤资源（图片 + CSS）
    ├── default/
    └── minecraft/
```

## 发布

打 tag 即可触发 GitHub Actions 自动构建并发布 Release：

```bash
git tag v1.2.0
git push origin v1.2.0
```

## 说明

- 这个项目是从 [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next) 重写的独立分支，有自己独立的 Git 历史和发布周期。
- 没有运行时依赖（不依赖 `lit`、`memoize-one` 等）。
- 有意保持精简，后续如需增加皮肤，不会带回原来那套复杂的配置体系。
