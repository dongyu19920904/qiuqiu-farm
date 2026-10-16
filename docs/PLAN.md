# 秋秋农场最小改造方案

日期：2026-10-15。目标：保留上游 R79 的地图、UI、像素素材、主角动画和完整玩法，仅更名并扩展刺猬、小猪。

## 源码调查

- 上游：<https://github.com/mars-tw/pixel-idle-farm-skill>；原生 HTML/CSS/JS，运行时零依赖；开发依赖仅 Playwright。无需构建或更换框架。
- `src/config.js`：动物、建筑、作物、产品、任务与商店数据。`src/game.js`：纯规则、亲密度、照护冷却、生产、离线结算。`src/state.js`：localStorage、版本迁移与地图修复。
- `src/ui.js`：原有 atlas 精灵、建筑与动物面板、地图移动、触控；`src/atlas.js` 从 v4 manifest 读取 frame。`src/adventure.js` / `src/world-ui.js`：现有主线世界，保持原状。
- 已有鸡、牛、羊、蜜蜂、鸭；通用 feed / water / groom、亲密度、开心状态、漫游、品质经济。所有动物目前都被假定产出产品，陪伴型刺猬需少量空产品分支。
- 22×12 地图、相机、y-sort、作物种植/浇水/收获、商店/金币/任务/离线成长均已存在，直接保留。
- 存档键 `pixel_idle_farm_save_v1` 保留；动物迁移按配置识别类型并保留扩展字段，无需新存档系统。新增 `adoptedAt` 只用于小猪成长，老动物兼容补齐。
- `.github/workflows/ci.yml` 已含测试和 Pages artifact 部署。扩展新增动物测试即可，保留原守门与浏览器检查。
- 根 LICENSE 为 MIT，Copyright © 2026 mars-tw；CREDITS 明确仓库自有素材随 MIT 提供、AI 生成披露。保留 LICENSE 和全部原署名。

## 素材调查与选择

- DustDFG 刺猬：<https://opengameart.org/content/pixel-art-hedgehog>，24×24，idle/move/sleep，CC BY-SA 4.0，需署名且衍生素材保留同许可。
- Tnypixels 小猪：<https://tnypixels.itch.io/tiny-farm-animals-pixel-art-asset-pack>，页面标注 CC0，猪有三视图，但与原版 48px 图集比例、轮廓与动作组织不同。
- 本版采用内建 image_gen 新生成的 16 帧刺猬/小猪，原动物 atlas 仅作为风格参考。新增独立 `assets/generated/qiuqiu/` 图集，保留原图、提示词、处理脚本与哈希、披露来源。未复制第三方候选素材。

## 实施顺序与文件

1. 原版基线：本地运行、原系统规则与真实浏览器测试，记录环境与结果到 PROGRESS。
2. 更名：`index.html`、`offline.html`、`manifest.webmanifest`、`package*.json`、运行时显示文案、README；不改布局、字体、图标和控件。更新版本链以刷新 PWA 缓存。
3. 刺猬：config 注册低价陪伴动物，入住现有畜舍；game 对无产品动物跳过生产/收集、喂食仍增加亲密度；ui 原梳理按钮针对新动物显示“抚摸”，使用专用休息帧。
4. 小猪：同住畜舍、原价格与容量规则；幼年→成年依领养时间成长，成年每 25 分钟找到松露，使用现有三品质产品/仓库/出售/订单通路。原五类动物行为不变。
5. 存档/交互：兼容缺失时间字段、刷新恢复、离线成长、陪伴动物不生成空产品；保持原导入/导出接口。
6. 测试：新增规则回归与桌面/390px/320px 浏览器用例，验证图集透明度/帧不为空/步态差异、地图显示/睡眠/抚摸/喂食/刷新持久化；运行原有规则、主线与 UI 测试。
7. GitHub：创建独立公开 `dongyu19920904/qiuqiu-farm`，不覆盖其他仓库；沿用 Actions Pages，验证 HTTPS 与资源。自定义域名只绑定指定子域名，DNS 无权限时交付 CNAME 精确说明。

## 风险与影响

- 动物共用畜舍容量，不扩大地图/经济容量；刺猬 Lv1、小猪 Lv3，牛羊原解锁级别不变。旧畜舍升级后仍能容纳新种类。
- 空产品动物会触及生产、离线与 UI 的少数通用入口；必须以鸡鸭及全部原回归验证。
- 新图集处理只新增文件，不覆盖原 atlas。行走必须改变四肢姿势；休息时停止位置移动。
- localStorage 受 origin 隔离：GitHub 默认域名与自定义域名间存档不会自动共享；切域名前用现有导出/导入功能迁移。手机与电脑暂不自动同步。
- DNS 生效与证书签发依赖外部状态；不能将部署回执当作域名验收。先保留可玩的默认 Pages 入口，再在 DNS 就绪后绑定域名。
- 网络环境中 git pack 下载停滞；当前通过 GitHub 官方 API 获取并按 Git blob SHA-1 校验完整源码快照，记录上游提交供追溯。

较大改动均不在本版范围：独立动物后端、联机/社交、新地图、UI 重做、现有框架/经济/主线重构。

## 2026-10-16 简体中文跟进

按用户要求将游戏内所有文字统一为简体中文：转换 index/offline 及 src 中实际显示的字符串，设置 zh-Hans/zh-CN 与简体系统字体后备。保留原字号、布局、美术、动画和规则；无新增运行时依赖。旧存档的历史对话与订单文案只在显示时转换，原存档内容不改写。同步 PWA 缓存版本及原测试中的文字断言，复验规则、手机/桌面、刷新恢复后发布到现有域名。

已完成并通过本地、云端与公网三视口验收，发布记录及证据见 PROGRESS.md。

## 2026-10-16 手机误选字

用户反馈触摸时出现“复制 / 全选”。最小修复为 index.html 的页面防选字样式（标准与 WebKit user-select、iOS touch-callout），仅为 input/textarea/contenteditable 恢复文本选择及长按菜单。保持所有触摸监听、滚动、玩法与存档逻辑。更新缓存版本，增加桌面/390px/320px 的重复点击、900ms 原生触摸长按及真实存档框全选/替换回归，接入原 CI 后部署现有域名。

依据：[MDN user-select](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/user-select)、[Apple Safari CSS touch-callout](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariCSSRef/Articles/StandardCSSProperties.html)。真机的系统菜单无法由桌面 Chromium 模拟直接验证，实际手机表现需用户刷新后反馈。
