# 秋秋农场（QiuQiu Farm）

在《阳光农场》R79 的原有像素世界中，种菜、照顾鸡鸭，与小刺猬、小猪一起经营农场。原地图、布局、主角动作、任务、料理、钓鱼、商店、金币与离线成长保留。

**在线游玩：<https://qiuqiu.aibioo.cn/>**
已绑定自定义域名，配置与验证见 [域名说明](docs/DEPLOYMENT.md)。原 GitHub Pages 地址将跳转至新域名；旧存档需导出/导入迁移。

## 迎接小伙伴

- 到原地图的**畜舍**，在建筑动物面板购买。小刺猬 Lv1、25 金币、全场一只；小猪 Lv3、80 金币。与原牛羊共用畜舍容量，牛羊仍在 Lv5 解锁。
- 刺猬吃 1 小麦，小猪吃 2 小麦。喂食、添水、抚摸会增加亲密度，沿用原照护冷却。刺猬长期陪伴，不产出商品。
- 小猪领养后 2 小时成年，离线也成长；成年后每 25 分钟找到松露，照护影响三种品质，可放入仓库、出售或完成订单。
- 点击地图中的动物可照护；新增动物使用独立像素帧走动、开心和睡眠。睡眠期间停止漫游，照护会唤醒。

## 存档与设备

每 5 秒自动保存，操作后保存；刷新恢复，离线结算上限沿用原版 8 小时。存档在本浏览器，手机和电脑独立。换域名、换设备前，使用设置内的**导出/导入存档**。保留原存档键，兼容原版存档；清理浏览器网站数据会清除本地进度。

## 本地运行与检查

运行时零依赖，无需构建：

```sh
python -m http.server 8000
# 浏览器打开 http://localhost:8000
npm ci
npx playwright install chromium
python -m pip install -r requirements-test.txt
npm run test:qiuqiu
npm run test:qiuqiu:e2e
npm test
npm run test:e2e
```

Windows 使用 D 盘缓存的执行方式与验收记录见 [进度](docs/PROGRESS.md)。新增动物素材可用 `node scripts/process-qiuqiu-animals.js` 从已保存的母版重建，无需重新调用生图服务。

## 来源与许可

原作：[mars-tw/pixel-idle-farm-skill](https://github.com/mars-tw/pixel-idle-farm-skill)，Copyright © 2026 mars-tw，MIT。保留 [LICENSE](LICENSE)、[CREDITS](CREDITS.md) 与 [原 README](docs/UPSTREAM_README.md)。本次不引入第三方游戏代码或素材；新增动物由内建 image_gen 生成，源图、完整提示词、哈希见 `assets/generated/qiuqiu/source/`。

改造方案：[PLAN](docs/PLAN.md)；完成证据和续做位置：[PROGRESS](docs/PROGRESS.md)。
