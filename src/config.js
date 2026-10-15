/* =========================================================================
 * config.js — Pixel Idle Farm 資料層（純資料，無副作用）
 * 所有作物、升級、訂單、遊戲常數都在這裡。改平衡只動這個檔。
 * 同時被 index.html（瀏覽器）與 scripts/test-economy.js（Node）載入。
 * ========================================================================= */

// ===== 遊戲常數 =====
const GAME = {
  saveKey: "pixel_idle_farm_save_v1",
  version: 1,
  startCoins: 16,
  startPlots: 6,
  maxPlots: 12,
  baseStorage: 30,
  offlineCapMs: 8 * 60 * 60 * 1000, // 離線收益上限 8 小時
  tickMs: 250,                       // 畫面更新間隔
  autosaveMs: 5000,                  // 自動存檔間隔
  orderSlots: 3,                     // 同時掛單數
  orderTtlMs: 12 * 60 * 1000,        // 訂單存活 12 分鐘
};

// ===== 作物 =====
// growMs 成長毫秒、seedCost 種子成本、yield 收成數量、sellValue 單位直售價、
// xp 每次收成 XP、unlockLevel 解鎖等級、spriteRow crop-growth.png 的列、
// emoji 後備圖示、color 後備色塊（土壤上作物色）
// R71（B-01 縮幅）：flavor＝圖鑑「祖母手札」一句話（祖母信件文風）。欄位契約一次定案：
// 沒有 flavor 的品項圖鑑不顯示手札列，後續輪次純資料補齊即可，不再動 UI。
const CROPS = {
  wheat:      { id: "wheat",      name: "小麦",   growMs: 15000,  seedCost: 1,  yield: 2, sellValue: 1,  xp: 1,  unlockLevel: 1, spriteRow: 0, emoji: "🌾", color: "#e3c567",
    flavor: "第一把小麦别急着卖，先捧在手心闻闻太阳的味道，那是农场醒过来的声音。" },
  carrot:     { id: "carrot",     name: "胡萝卜", growMs: 45000,  seedCost: 4,  yield: 3, sellValue: 3,  xp: 3,  unlockLevel: 2, spriteRow: 1, emoji: "🥕", color: "#f08a3c",
    flavor: "胡萝卜要拔得慢，像把土里的心事轻轻请出来，急了就断在半路。" },
  tomato:     { id: "tomato",     name: "番茄",   growMs: 120000, seedCost: 12, yield: 4, sellValue: 8,  xp: 8,  unlockLevel: 3, spriteRow: 2, emoji: "🍅", color: "#e0473b",
    flavor: "番茄红得最透的那颗，留给路过的孩子，田边的甜要有人分享才算数。" },
  strawberry: { id: "strawberry", name: "草莓",   growMs: 300000, seedCost: 30, yield: 5, sellValue: 22, xp: 18, unlockLevel: 4, spriteRow: 3, emoji: "🍓", color: "#e23e57",
    flavor: "草莓娇气，弯腰摘它的人可不能娇气，趁露水未干时下手最甜。" },
  corn:       { id: "corn",       name: "玉米",   growMs: 210000, seedCost: 20, yield: 4, sellValue: 12, xp: 12, unlockLevel: 4, spriteRow: 4, emoji: "🌽", color: "#f0c84a", season: "夏",
    flavor: "夏天的玉米听得见雷声就长得快，你祖父总说那是天在替我们数日子。" },
  pumpkin:    { id: "pumpkin",    name: "南瓜",   growMs: 900000, seedCost: 85, yield: 3, sellValue: 80, xp: 55, unlockLevel: 5, spriteRow: 5, emoji: "🎃", color: "#e8821e" },
  radish:      { id: "radish",     name: "樱桃萝卜", growMs: 90000, seedCost: 10, yield: 4, sellValue: 5, xp: 6, unlockLevel: 5, emoji: "🌱", color: "#d94b58", season: "春", sheet: "crops4" },
  bell_pepper: { id: "bell_pepper", name: "甜椒", growMs: 360000, seedCost: 38, yield: 4, sellValue: 24, xp: 22, unlockLevel: 5, emoji: "🫑", color: "#4fae55", season: "夏", sheet: "crops2" },
  potato:      { id: "potato",      name: "马铃薯", growMs: 480000, seedCost: 45, yield: 5, sellValue: 22, xp: 28, unlockLevel: 6, emoji: "🥔", color: "#b9834b", season: "春", sheet: "crops2" },
  sunflower:   { id: "sunflower",   name: "向日葵", growMs: 420000, seedCost: 48, yield: 3, sellValue: 26, xp: 26, orderXp: 40, unlockLevel: 6, emoji: "🌻", color: "#e0a72a", season: "夏", sheet: "crops4" },
  grapes:      { id: "grapes",      name: "葡萄", growMs: 720000, seedCost: 72, yield: 4, sellValue: 55, xp: 42, unlockLevel: 7, emoji: "🍇", color: "#7c4aa6", season: "秋", sheet: "crops2" },
  melon:       { id: "melon",       name: "温室甜瓜", growMs: 840000, seedCost: 90, yield: 3, sellValue: 90, xp: 58, unlockLevel: 8, emoji: "🍈", color: "#8fcf6a", season: "冬", sheet: "crops2" },
  pea:          { id: "pea",         name: "豌豆", growMs: 540000, seedCost: 54, yield: 5, sellValue: 28, xp: 32, unlockLevel: 6, emoji: "🫛", color: "#55b95d", season: "春", sheet: "crops3" },
  sweet_potato: { id: "sweet_potato", name: "地瓜", growMs: 660000, seedCost: 68, yield: 4, sellValue: 48, xp: 40, unlockLevel: 7, emoji: "🍠", color: "#c46a3a", season: "秋", sheet: "crops3" },
  winter_kale:  { id: "winter_kale", name: "冬羽甘蓝", growMs: 780000, seedCost: 84, yield: 4, sellValue: 64, xp: 52, unlockLevel: 8, emoji: "🥬", color: "#4f9f83", season: "冬", sheet: "crops3" },
};
const CROP_SHEET = { cols: 5, rows: 6, stages: 5 }; // crop-growth.png 版面

// R71（B-03 第二 commit）：broadcast＝換季時的「晨光鎮廣播」一句話，
// 換季 toast 與離線摘要（有 seasonsAdvanced 時）共用；純文案，可整段回退。
const SEASONS = [
  { id: "春", name: "春季", icon: "🌸", broadcast: "晨光镇广播：春季到站，河风转暖，请各位把种子和盼望一起拿出来晒晒。" },
  { id: "夏", name: "夏季", icon: "☀️", broadcast: "晨光镇广播：夏季到站，日头正烈，先给田里补水，再给自己留一壶凉茶。" },
  { id: "秋", name: "秋季", icon: "🍂", broadcast: "晨光镇广播：秋季到站，谷仓开门，请记得替每一笔收成留下名字。" },
  { id: "冬", name: "冬季", icon: "❄️", broadcast: "晨光镇广播：冬季到站，炉火汤锅就位，霜底下还有绿意慢慢在长。" },
];
const SEASON_DURATION_MS = 20 * 60 * 1000;
const SEASON_UNLOCK_LEVEL = 6;
const SEASON_ORDER_BIAS = {
  春: {
    id: "spring_pea_market",
    name: "豌豆芽市",
    icon: "🌸",
    preferredItems: ["pea", "radish", "river_mint", "potato"],
    weight: 4,
    toast: "春季市集「豌豆芽市」偏好豌豆、樱桃萝卜与溪畔薄荷。",
  },
  夏: {
    id: "summer_river_pepper_week",
    name: "河岸甜椒周",
    icon: "☀️",
    preferredItems: ["bell_pepper", "sunflower", "amber_resin", "corn"],
    weight: 4,
    toast: "夏季市集「河岸甜椒周」偏好甜椒、向日葵与河岸货。",
  },
  秋: {
    id: "autumn_grape_chestnut_bundle",
    name: "葡萄栗子合单",
    icon: "🍂",
    preferredItems: ["grapes", "forest_chestnut", "sweet_potato", "wild_berry"],
    weight: 4,
    toast: "秋季市集「葡萄栗子合单」偏好葡萄、栗子与地瓜。",
  },
  冬: {
    id: "winter_frost_leaf_hotpot",
    name: "霜叶锅物",
    icon: "❄️",
    preferredItems: ["winter_kale", "frost_cherry", "potato", "mooncap_spore"],
    weight: 4,
    toast: "冬季市集「霜叶锅物」偏好冬羽甘蓝、霜樱果与暖锅食材。",
  },
};
const SEASON_EVENTS = {
  spring_seed_swap: {
    id: "spring_seed_swap",
    season: "春",
    name: "春播交换",
    icon: "🌱",
    desc: "把早春小麦交给镇民换一张豌豆播种贴纸，顺手记下今年第一轮播种。",
    requires: { wheat: 5 },
    reward: { xp: 8, collectible: "spring_seed_swap_sticker" },
    actionLabel: "交换小麦",
    done: "春播交换完成，豌豆芽市的第一张贴纸收进图鉴。",
  },
  summer_well_bless: {
    id: "summer_well_bless",
    season: "夏",
    name: "夏井祈愿",
    icon: "💧",
    desc: "到井边打水，替本季第一批干土补上一轮湿润。",
    reward: { xp: 4, waterAll: true, collectible: "summer_well_charm" },
    actionLabel: "汲水祈愿",
    station: "well",
    done: "夏井祈愿完成，水桶旁多了一枚小井绳结。",
  },
  autumn_share_basket: {
    id: "autumn_share_basket",
    season: "秋",
    name: "秋收分篮",
    icon: "🧺",
    desc: "把一篮秋季作物分给孩子们，让今年的收成有名字也有去处。",
    requiresSeasonCrop: 3,
    reward: { coins: 12, xp: 4, collectible: "autumn_share_label" },
    actionLabel: "分出秋篮",
    done: "秋收分篮完成，图图替篮子绑上了姓名牌。",
  },
  winter_hearth_soup: {
    id: "winter_hearth_soup",
    season: "冬",
    name: "冬灶汤",
    icon: "🍲",
    desc: "交一份冬羽甘蓝或两份马铃薯，替班伯的灶边汤锅添料。",
    requiresAny: { winter_kale: 1, potato: 2 },
    reward: { xp: 7, collectible: "winter_soup_note" },
    actionLabel: "添料入锅",
    done: "冬灶汤完成，班伯把汤锅旁的照护短笺交给你。",
  },
};

// ===== 等級曲線（累計 XP 門檻）=====
// 解鎖節奏對齊 game-design：碼表 lv2 約 20 秒、lv5 約 8 分鐘內可達
const LEVEL_XP = [0, 8, 30, 90, 220, 480, 900, 1600, 2700, 4300];
function levelFromXp(xp) {
  let lv = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) if (xp >= LEVEL_XP[i]) lv = i + 1;
  return lv;
}
function xpForLevel(level) { return LEVEL_XP[level - 1] != null ? LEVEL_XP[level - 1] : Infinity; }

// ===== 升級（5 種，每種多級，cost 累進）=====
// effect 由 game.js 解讀：plotCount 加農地、growthSpeed 乘成長時間、
// sellBonus 加直售/訂單金、storageLevel 加倉容、helperLevel 解鎖自動收成
const UPGRADES = {
  plotCount: {
    name: "开垦农地", icon: "🟫", desc: "增加可种植的农地格数",
    levels: [
      { cost: 40,   value: 8 },
      { cost: 140,  value: 10 },
      { cost: 420,  value: 12 },
    ],
  },
  growthSpeed: {
    name: "肥沃土壤", icon: "🌱", desc: "所有作物成长更快",
    levels: [
      { cost: 50,   value: 0.9 },   // 成長時間 ×0.9
      { cost: 220,  value: 0.8 },
      { cost: 650,  value: 0.7 },
      { cost: 1800, value: 0.6 },
      { cost: 4200, value: 0.52 },
    ],
  },
  sellBonus: {
    name: "市集人脉", icon: "🪙", desc: "卖出与订单收益提升",
    levels: [
      { cost: 80,   value: 0.15 },  // +15%
      { cost: 260,  value: 0.30 },
      { cost: 720,  value: 0.50 },
      { cost: 2000, value: 0.80 },
      { cost: 4800, value: 1.05 },
    ],
  },
  storageLevel: {
    name: "扩建谷仓", icon: "📦", desc: "提高仓库容量上限",
    levels: [
      { cost: 50,   value: 40 },    // 容量 base+40 → 70
      { cost: 180,  value: 90 },
      { cost: 520,  value: 160 },
      { cost: 1400, value: 280 },
    ],
  },
  helperLevel: {
    name: "帮手机器人", icon: "🤖", desc: "自动收成成熟作物（离线也运作）",
    levels: [
      { cost: 300,  value: { autoHarvest: true, autoPlant: false } },
      { cost: 1200, value: { autoHarvest: true, autoPlant: true } }, // 進階：自動補種
    ],
  },
};
const UPGRADE_ORDER = ["plotCount", "growthSpeed", "sellBonus", "storageLevel", "helperLevel"];

// ===== 訂單設定 =====
// 訂單由已解鎖作物組成，獎金 = 作物直售總值 × payMultiplier（依稀有度）
const ORDER_RARITY = {
  common:   { label: "一般", payMult: 1.35, xpMult: 1.0, weight: 60, color: "#9aa7b4" },
  good:     { label: "优质", payMult: 1.7,  xpMult: 1.4, weight: 30, color: "#3b9ae0" },
  premium:  { label: "高级", payMult: 2.2,  xpMult: 1.9, weight: 10, color: "#b06ae0" },
  festival: { label: "丰年祭", payMult: 2.8, xpMult: 2.3, weight: 5, color: "#d88b2a" },
};
const ORDER_STREAK_BONUS = 0.05; // 每連續完成一單，獎金 +5%（上限見 game.js）
const ORDER_STREAK_CAP = 1.0;    // 連單獎金上限 +100%

// ===== 天氣（tier 5 解鎖，retention）=====
const WEATHER = {
  clear: { id: "clear", name: "晴朗", icon: "⛅", growthMul: 1.0,  sellMul: 1.0 },
  rain:  { id: "rain",  name: "降雨", icon: "🌧️", growthMul: 0.7,  sellMul: 1.0 },  // 成長加速
  sunny: { id: "sunny", name: "艳阳", icon: "☀️", growthMul: 1.0,  sellMul: 1.25 }, // 售價提升
  windy: { id: "windy", name: "微风", icon: "🍃", growthMul: 0.9,  sellMul: 1.05 }, // 小幅成長與售價加成
  fog:   { id: "fog",   name: "晨雾", icon: "🌫️", growthMul: 1.15, sellMul: 1.10 }, // 成長稍慢、售價稍高
  snow:  { id: "snow",  name: "降雪", icon: "🌨️", growthMul: 1.25, sellMul: 1.18 }, // 成長放慢、冬季貨價較高
  storm: { id: "storm", name: "暴风雨", icon: "⛈️", growthMul: 0.82, sellMul: 0.95 }, // 小幅加速但市集人流變少
};
const WEATHER_UNLOCK_LEVEL = 5;
const WEATHER_DURATION_MS = 10 * 60 * 1000; // 每段天氣 10 分鐘

// ===== 成就（永久微加成，非必要）=====
const ACHIEVEMENTS = {
  firstHarvest: { name: "第一桶金", desc: "完成第一次收成", icon: "🌱" },
  order10:      { name: "可靠农户", desc: "完成 10 笔订单", icon: "📜" },
  coins1k:      { name: "小富农",   desc: "累计赚得 1000 金币", icon: "💰" },
  allCrops:     { name: "全作物大师", desc: "解锁全部作物", icon: "🏆" },
  duckKeeper:   { name: "鸭舍新声", desc: "收集任一品质的鸭蛋", icon: "🦆" },
  seasonalTable:{ name: "四季餐桌", desc: "收成四种季节作物", icon: "🍽️" },
  festivalDeal: { name: "丰年祭供应商", desc: "完成一张丰年祭订单", icon: "🏮" },
  letterKeeper: { name: "信笺守护者", desc: "读完祖母留下的八封季节信", icon: "📬" },
  neighborLetters: { name: "四邻来信", desc: "读完葛瑞、萝拉、班伯与图图的镇民附笺", icon: "💌", noBonus: true },
  fullPantry:   { name: "满满食物柜", desc: "每一种作物都至少收成一次", icon: "🧺" },
  stallOwner:   { name: "四季摊主", desc: "兴建丰年祭小摊", icon: "🎪" },
};

// ===== MVP2：動物產品（可賣、可入訂單，與作物同存 storage.items）=====
// Stage 7：每種產品分 normal/good/premium 三級品質，由收集當下的動物親密度決定。
// itemId 命名：normal 用原始 id（如 egg），good/premium 加後綴（egg_good/egg_premium）。
const QUALITY_TIERS = ["normal", "good", "premium"];
const QUALITY_SELL_MUL = { normal: 1, good: 1.6, premium: 2.6 };
const QUALITY_LABEL = { normal: "", good: "优质", premium: "顶级" };
function buildProducts() {
  const base = {
    egg:   { name: "鸡蛋", emoji: "🥚", sellValue: 6,  source: "chicken" },
    milk:  { name: "牛奶", emoji: "🥛", sellValue: 18, source: "cow" },
    wool:  { name: "羊毛", emoji: "🧶", sellValue: 24, source: "sheep" },
    honey: { name: "蜂蜜", emoji: "🍯", sellValue: 15, source: "bee" },
    duck_egg: { name: "鸭蛋", emoji: "🥚", sellValue: 9, source: "duck", qualitySheet: "product_quality_duck" },
    truffle: { name: "松露", emoji: "🍄", sellValue: 20, source: "pig", qualitySheet: "product_quality_qiuqiu" },
  };
  const out = {};
  for (const bid of Object.keys(base)) {
    const b = base[bid];
    for (const q of QUALITY_TIERS) {
      const id = q === "normal" ? bid : bid + "_" + q;
      out[id] = { id, name: QUALITY_LABEL[q] + b.name, emoji: b.emoji, source: b.source,
        sellValue: Math.round(b.sellValue * QUALITY_SELL_MUL[q]), baseProduct: bid, quality: q };
      if (b.qualitySheet) out[id].qualitySheet = b.qualitySheet;
    }
  }
  return out;
}
const PRODUCTS = buildProducts();

// ===== Stage 12: East Forest forage, stored as items so orders/NPC requests can reuse it. =====
const FORAGE_ITEMS = {
  // R71（B-01）：flavor 契約同 CROPS——祖母手札一句話，無 flavor 則圖鑑不顯示手札列。
  forest_herb:   { id: "forest_herb",   name: "东林药草", emoji: "🌿", sellValue: 4, region: "east",
    flavor: "桥那边的药草要傍晚采，叶背带一点凉气的才留得住药性。" },
  glow_mushroom: { id: "glow_mushroom", name: "萤光菇",   emoji: "🍄", sellValue: 5, region: "east",
    flavor: "萤光菇会替迷路的人留一盏小灯，摘下它之前，记得先说声谢谢。" },
  wild_berry:    { id: "wild_berry",    name: "东林野莓", emoji: "🫐", sellValue: 6, region: "east", season: "秋",
    flavor: "最甜的野莓总长在最扎手的那丛，秋天教人先学会耐心，再尝甜。" },
  river_mint:    { id: "river_mint",    name: "溪畔薄荷", emoji: "🍃", sellValue: 7, region: "east", season: "春" },
  mooncap_spore: { id: "mooncap_spore", name: "月帽菇孢", emoji: "🌙", sellValue: 18, region: "east_deep", season: "冬" },
  amber_resin:   { id: "amber_resin",   name: "古树琥珀脂", emoji: "🟠", sellValue: 24, region: "east_deep", season: "夏" },
  forest_chestnut: { id: "forest_chestnut", name: "东林栗子", emoji: "🌰", sellValue: 20, region: "east_deep", season: "秋" },
  frost_cherry:    { id: "frost_cherry",    name: "霜樱果", emoji: "🍒", sellValue: 28, region: "east_deep", season: "冬" },
};
const FORAGE_NODE_COOLDOWN_MS = 10 * 60 * 1000;
const EAST_DEEP_FORAGE_COOLDOWN_MS = 30 * 60 * 1000;
const FORAGE_NODES = [
  { id: "east_herb_patch", itemId: "forest_herb", x: 18, y: 5, yield: 1, name: "东林药草丛",
    desc: "桥后林地才长得好的清香药草。", cooldownMs: FORAGE_NODE_COOLDOWN_MS },
  { id: "east_mushroom_log", itemId: "glow_mushroom", x: 21, y: 4, yield: 1, name: "萤光菇木",
    desc: "靠近古树根部的微光菇蕈。", cooldownMs: FORAGE_NODE_COOLDOWN_MS },
  { id: "east_berry_thicket", itemId: "wild_berry", x: 18, y: 7, yield: 1, name: "东林野莓丛",
    desc: "秋天最甜的灌木野莓，适合做小点心。", cooldownMs: FORAGE_NODE_COOLDOWN_MS },
  { id: "east_mint_spring", itemId: "river_mint", x: 20, y: 6, yield: 1, name: "溪畔薄荷",
    desc: "靠近湿润溪岸的清凉香草。", cooldownMs: FORAGE_NODE_COOLDOWN_MS },
  { id: "deep_mooncap_ring", itemId: "mooncap_spore", x: 20, y: 9, yield: 1, name: "月帽菇环",
    desc: "东林深处夜色较重的菇环，恢复很慢。", cooldownMs: EAST_DEEP_FORAGE_COOLDOWN_MS, requiresFlag: "eastDeepUnlocked" },
  { id: "deep_amber_root", itemId: "amber_resin", x: 21, y: 10, yield: 1, name: "古树琥珀根",
    desc: "老树根部渗出的琥珀色树脂，少量即可入委托。", cooldownMs: EAST_DEEP_FORAGE_COOLDOWN_MS, requiresFlag: "eastDeepUnlocked" },
  { id: "deep_chestnut_bush", itemId: "forest_chestnut", x: 20, y: 8, yield: 1, name: "东林栗木丛",
    desc: "深处草地旁的秋栗，壳厚但香气足。", cooldownMs: EAST_DEEP_FORAGE_COOLDOWN_MS, requiresFlag: "eastDeepUnlocked" },
  { id: "deep_frost_cherry", itemId: "frost_cherry", x: 19, y: 10, yield: 1, name: "霜樱果丛",
    desc: "冬霜后才转甜的小果，采收后要慢慢恢复。", cooldownMs: EAST_DEEP_FORAGE_COOLDOWN_MS, requiresFlag: "eastDeepUnlocked" },
];
const EAST_FORAGE_REPORT = {
  npcId: "merchant",
  wants: { forest_herb: 1, glow_mushroom: 1 },
  rewardCoins: 18,
  rewardXp: 6,
  offer: "东林的新货源要先登记。药草和萤光菇各带一份，我帮你开镇民委托。",
  done: "这批样品很稳，之后我会把东林采集品放进委托清单。",
};
const EAST_DEEP_UNLOCK_COST = { coins: 90, wood: 4, stone: 2 };
const COLLECTIBLES = {
  east_deep_rubbing: {
    id: "east_deep_rubbing",
    name: "东林年轮拓印",
    emoji: "📜",
    source: "解锁东林深处",
    desc: "古树根旁留下的年轮拓印，只作收藏纪录，不产生收益。",
  },
  festival_lantern: {
    id: "festival_lantern",
    name: "丰年祭小灯笼",
    emoji: "🏮",
    source: "完成丰年祭订单",
    desc: "祭典摊位留下的小灯笼，象征农场能供应四季物产。",
  },
  grandma_hat: {
    id: "grandma_hat",
    name: "祖母的草帽",
    emoji: "👒",
    source: "读完祖母的动物照护信",
    desc: "帽缘有补过的针脚，像是她在田埂上弯腰看小鸡时留下的影子。",
  },
  seed_pouch: {
    id: "seed_pouch",
    name: "手缝种子袋",
    emoji: "👝",
    source: "写下给祖母的回信",
    desc: "旧布袋重新装进新种子，提醒农场不是被继承，而是被继续照顾。",
  },
  spring_seed_swap_sticker: {
    id: "spring_seed_swap_sticker",
    name: "春播交换贴纸",
    emoji: "🌱",
    source: "完成春播交换",
    desc: "豌豆芽市的小贴纸，只记录第一轮春播，不提供收益加成。",
  },
  summer_well_charm: {
    id: "summer_well_charm",
    name: "夏井绳结",
    emoji: "💧",
    source: "完成夏井祈愿",
    desc: "绑在井桶上的短绳结，提醒人们夏季先留水给田。",
  },
  autumn_share_label: {
    id: "autumn_share_label",
    name: "秋篮姓名牌",
    emoji: "🏷️",
    source: "完成秋收分篮",
    desc: "图图写上的小姓名牌，让分享出去的收成也留在记忆里。",
  },
  winter_soup_note: {
    id: "winter_soup_note",
    name: "冬灶汤短笺",
    emoji: "🍲",
    source: "完成冬灶汤",
    desc: "班伯夹在照护笔记里的小纸条，只作故事收藏。",
  },
};

// ===== Stage 7：動物照護（餵食/澆水/梳理 → 親密度 → 產物品質）=====
// 親密度 0-100，「已收藏值 + 距上次照護的時間衰減」推導，不用 tick 模擬（跟作物成長同一套哲學）。
const AFFINITY_MAX = 100;
const AFFINITY_DECAY_PER_HOUR = 6;                 // 沒照護時，每小時衰減多少
const AFFINITY_HAPPY_THRESHOLD = 70;                // 達到「開心」狀態，UI 顯示 happy、掉 premium
const AFFINITY_GOOD_THRESHOLD = 35;                 // 達到 good 品質門檻
const CARE_GAIN = { feed: 22, water: 16, groom: 18 }; // 各照護動作的親密度增量
const CARE_COOLDOWN_MS = 20 * 1000;                 // 澆水/梳理（免費動作）冷卻，避免瘋狂點擊瞬間衝滿
const STATUS_STALE_MS = 3 * 60 * 1000;              // 超過此時間沒做某動作 → UI 顯示對應提示圖示
// 統一查作物或產品的賣價/名稱/emoji（訂單與倉庫共用）
function getItemDef(id) { return CROPS[id] || PRODUCTS[id] || FORAGE_ITEMS[id] || null; }
function itemSellValue(id) { const d = getItemDef(id); return d ? d.sellValue : 0; }

// ===== MVP2：建材（清障礙取得，用於蓋建築/加成；存 state.materials）=====
const MATERIALS = {
  wood:    { id: "wood",    name: "木材", emoji: "🪵" },
  stone:   { id: "stone",   name: "石材", emoji: "🪨" },
  compost: { id: "compost", name: "堆肥", emoji: "🍂" },
};

// ===== MVP2：地形（地圖磚規則，非裝飾）=====
const TERRAIN = {
  grass: { id: "grass", name: "草地", buildable: true,  walkable: true,  desc: "可兴建建筑" },
  soil:  { id: "soil",  name: "农土", buildable: false, walkable: true,  desc: "作物耕地（在上方农场种植）" },
  water: { id: "water", name: "水域", buildable: false, walkable: false, desc: "需架桥才能跨越/使用" },
  path:  { id: "path",  name: "步道", buildable: false, walkable: true,  desc: "加速移动与动作" },
};

// ===== MVP2：障礙物（可清除 → 取建材 + 釋出草地）=====
const OBSTACLES = {
  rock:  { id: "rock",  name: "巨石", emoji: "🪨", clearCost: 12, grants: { stone: 2 },   tall: false, desc: "清除得石材，发布草地" },
  stump: { id: "stump", name: "树桩", emoji: "🪵", clearCost: 8,  grants: { wood: 2 },    tall: false, desc: "清除得木材，发布草地" },
  bush:  { id: "bush",  name: "灌木", emoji: "🌿", clearCost: 10, grants: { compost: 3 }, tall: false, desc: "清除得堆肥，发布草地" },
  tree:  { id: "tree",  name: "大树", emoji: "🌳", clearCost: 18, grants: { wood: 4 },    tall: true,  desc: "高大会遮挡；清除得木材，发布草地" },
};

// ===== MVP2：建築（生產模組，蓋在草地，影響經濟/進度）=====
// R74：levels 沿用全域升級的逐級資料風格；第 1 筆同時是建造成本與 Lv1 效果，
// 後續每筆是升到該級的成本與「該級完整效果」（不是與前級相加）。
// Lv2 金幣約為建造價 1.8～2.7 倍，Lv3 再為 Lv2 的 2.2～3 倍，並持續吃對應建材；
// 三段封頂避免瞬間無限升級，前期仍保留一個可企及的首次強化目標。
const BUILDINGS = {
  compostHeap: { id: "compostHeap", name: "堆肥场", emoji: "🍂", unlockLevel: 2,
                 levels: [
                   { cost: { coins: 60, compost: 3 }, effect: { growthAura: 0.90 }, effectLabel: "作物成长时间 ×0.90" },
                   { cost: { coins: 160, compost: 5 }, effect: { growthAura: 0.84 }, effectLabel: "作物成长时间 ×0.84" },
                   { cost: { coins: 480, compost: 9 }, effect: { growthAura: 0.78 }, effectLabel: "作物成长时间 ×0.78" },
                 ],
                 maxCount: 1,
                 desc: "Lv1 作物成长时间 ×0.90（全场，最多 1 座生效）" },
  silo:        { id: "silo", name: "筒仓", emoji: "🏗️", unlockLevel: 3,
                 levels: [
                   { cost: { coins: 180, stone: 4 }, effect: { storageBonus: 90 }, effectLabel: "仓库容量 +90" },
                   { cost: { coins: 360, stone: 7 }, effect: { storageBonus: 170 }, effectLabel: "仓库容量 +170" },
                   { cost: { coins: 980, stone: 12 }, effect: { storageBonus: 300 }, effectLabel: "仓库容量 +300" },
                 ],
                 maxCount: 1,
                 desc: "Lv1 仓库容量 +90（最多 1 座生效）" },
  chickenCoop: { id: "chickenCoop", name: "鸡舍", emoji: "🐔", unlockLevel: 3,
                 levels: [
                   { cost: { coins: 140, wood: 4 }, effect: { unlockAnimal: ["chicken"], capacity: 3 }, effectLabel: "可住 3 只鸡" },
                   { cost: { coins: 320, wood: 7 }, effect: { unlockAnimal: ["chicken"], capacity: 4 }, effectLabel: "可住 4 只鸡" },
                   { cost: { coins: 820, wood: 12 }, effect: { unlockAnimal: ["chicken"], capacity: 5 }, effectLabel: "可住 5 只鸡" },
                 ],
                 maxCount: 2,
                 desc: "解锁鸡，生产鸡蛋（Lv1 每座 3 只；全场最多 2 座）" },
  barn:        { id: "barn", name: "畜舍", emoji: "🛖", unlockLevel: 5,
                 levels: [
                   { cost: { coins: 420, wood: 10, stone: 4 }, effect: { unlockAnimal: ["cow", "sheep", "hedgehog", "pig"], capacity: 4 }, effectLabel: "可住 4 只动物" },
                   { cost: { coins: 760, wood: 14, stone: 6 }, effect: { unlockAnimal: ["cow", "sheep", "hedgehog", "pig"], capacity: 5 }, effectLabel: "可住 5 只动物" },
                   { cost: { coins: 1800, wood: 22, stone: 10 }, effect: { unlockAnimal: ["cow", "sheep", "hedgehog", "pig"], capacity: 6 }, effectLabel: "可住 6 只动物" },
                 ],
                 maxCount: 2,
                 desc: "刺猬 Lv1、小猪 Lv3、牛羊 Lv5；共用容量（Lv1 每座 4 只；全场最多 2 座）" },
  beeBox:      { id: "beeBox", name: "蜂箱", emoji: "🐝", unlockLevel: 6,
                 levels: [
                   { cost: { coins: 320, wood: 6 }, effect: { unlockAnimal: ["bee"], capacity: 2, growthAura: 0.92 }, effectLabel: "可住 2 群蜂・成长 ×0.92" },
                   { cost: { coins: 680, wood: 10, compost: 4 }, effect: { unlockAnimal: ["bee"], capacity: 3, growthAura: 0.88 }, effectLabel: "可住 3 群蜂・成长 ×0.88" },
                   { cost: { coins: 1540, wood: 18, compost: 8 }, effect: { unlockAnimal: ["bee"], capacity: 4, growthAura: 0.84 }, effectLabel: "可住 4 群蜂・成长 ×0.84" },
                 ],
                 maxCount: 1,
                 desc: "Lv1 产蜂蜜 + 作物成长 ×0.92（最多 1 座生效）" },
  duckPen:     { id: "duckPen", name: "鸭舍", emoji: "🦆", unlockLevel: 6,
                 levels: [
                   { cost: { coins: 380, wood: 8, stone: 2 }, effect: { unlockAnimal: ["duck"], capacity: 3 }, effectLabel: "可住 3 只鸭" },
                   { cost: { coins: 720, wood: 12, stone: 4 }, effect: { unlockAnimal: ["duck"], capacity: 4 }, effectLabel: "可住 4 只鸭" },
                   { cost: { coins: 1580, wood: 20, stone: 8 }, effect: { unlockAnimal: ["duck"], capacity: 5 }, effectLabel: "可住 5 只鸭" },
                 ],
                 maxCount: 1,
                 desc: "解锁鸭，生产鸭蛋（Lv1 每座 3 只；全场最多 1 座）" },
  memory_garden: { id: "memory_garden", name: "祖母花圃", emoji: "🏵️", unlockLevel: 4,
                 levels: [
                   { cost: { wood: 6, compost: 4 }, effect: { orderXpBonus: 0.05, mailFlavor: true }, effectLabel: "订单 XP +5%" },
                   { cost: { coins: 240, wood: 10, compost: 7 }, effect: { orderXpBonus: 0.08, mailFlavor: true }, effectLabel: "订单 XP +8%" },
                   { cost: { coins: 720, wood: 18, compost: 12 }, effect: { orderXpBonus: 0.12, mailFlavor: true }, effectLabel: "订单 XP +12%" },
                 ],
                 maxCount: 1,
                 desc: "Lv1 订单 XP +5%，并解锁一封花圃短笺（最多 1 座）" },
  greenhouse:  { id: "greenhouse", name: "温室", emoji: "🏡", unlockLevel: 8,
                 levels: [
                   { cost: { coins: 760, wood: 10, stone: 6 }, effect: { growthAura: 0.88 }, effectLabel: "作物成长时间 ×0.88" },
                   { cost: { coins: 1500, wood: 18, stone: 10 }, effect: { growthAura: 0.82 }, effectLabel: "作物成长时间 ×0.82" },
                   { cost: { coins: 3400, wood: 28, stone: 18 }, effect: { growthAura: 0.76 }, effectLabel: "作物成长时间 ×0.76" },
                 ],
                 maxCount: 1,
                 desc: "Lv1 全年控温，作物成长时间 ×0.88（最多 1 座生效）" },
  festival_stall: { id: "festival_stall", name: "丰年祭小摊", emoji: "🎪", unlockLevel: 7,
                 levels: [
                   { cost: { coins: 620, wood: 8, stone: 4 }, effect: { seasonalSellBonus: 0.15 }, effectLabel: "当季作物直售 +15%" },
                   { cost: { coins: 1300, wood: 14, stone: 7 }, effect: { seasonalSellBonus: 0.24 }, effectLabel: "当季作物直售 +24%" },
                   { cost: { coins: 3000, wood: 24, stone: 12 }, effect: { seasonalSellBonus: 0.35 }, effectLabel: "当季作物直售 +35%" },
                 ],
                 maxCount: 1,
                 desc: "Lv1 当季作物直售额外 +15%（最多 1 座生效）" },
};
// 舊有建造、動物解鎖與靜態稽核仍讀 def.cost / def.effect；由 levels[0] 衍生，
// 避免保留兩份可能漂移的 Lv1 真值。
for (const def of Object.values(BUILDINGS)) {
  def.cost = def.levels[0].cost;
  def.effect = def.levels[0].effect;
}
const BUILDING_ORDER = ["compostHeap", "silo", "chickenCoop", "barn", "memory_garden", "beeBox", "duckPen", "festival_stall", "greenhouse"];

// ===== MVP2：動物（蓋家 → 計時生產 → 收集 → 入訂單/賣出；可餵食加速）=====
// produceMs 生產週期、feedCost 餵食成本（用作物加速、立即產出）、unlockLevel 解鎖等級
const ANIMALS = {
  hedgehog: { id: "hedgehog", name: "小刺猬", emoji: "🦔", product: null, home: "barn", unlockLevel: 1, cost: 25, feedCost: { wheat: 1 }, sheet: "animals_qiuqiu", careSheet: "animals_qiuqiu", pet: true, maxCount: 1, rests: true },
  pig: { id: "pig", name: "小猪", emoji: "🐷", product: "truffle", produceMs: 25 * 60 * 1000, matureMs: 2 * 60 * 60 * 1000, home: "barn", unlockLevel: 3, cost: 80, feedCost: { wheat: 2 }, sheet: "animals_qiuqiu", careSheet: "animals_qiuqiu", pet: true, rests: true },
  chicken: { id: "chicken", name: "鸡",  emoji: "🐔", product: "egg",   produceMs: 6 * 60 * 1000,  home: "chickenCoop", unlockLevel: 3, cost: 40,  feedCost: { wheat: 2 } },
  cow:     { id: "cow",     name: "牛",  emoji: "🐄", product: "milk",  produceMs: 20 * 60 * 1000, home: "barn",        unlockLevel: 5, cost: 220, feedCost: { carrot: 2 } },
  sheep:   { id: "sheep",   name: "羊",  emoji: "🐑", product: "wool",  produceMs: 30 * 60 * 1000, home: "barn",        unlockLevel: 5, cost: 180, feedCost: { carrot: 3 } },
  bee:     { id: "bee",     name: "蜜蜂", emoji: "🐝", product: "honey", produceMs: 15 * 60 * 1000, home: "beeBox",      unlockLevel: 6, cost: 120, feedCost: { wheat: 3 } },
  duck:    { id: "duck",    name: "鸭",  emoji: "🦆", product: "duck_egg", produceMs: 10 * 60 * 1000, home: "duckPen", unlockLevel: 6, cost: 95, feedCost: { potato: 2 }, sheet: "animals_duck", careSheet: "animals_duck" },
};

// ===== 互動工具（roadmap：明確工具模式，點擊行為依工具改變）=====
const TOOLS = {
  hand:    { id: "hand",    name: "手", icon: "👆", desc: "种植/收成作物、收集产物" },
  water:   { id: "water",   name: "浇水", icon: "💧", desc: "对已种植的干土浇水加速一轮" },
  clear:   { id: "clear",   name: "清除", icon: "⛏️", desc: "清除地图上的石/桩/灌木取建材" },
  build:   { id: "build",   name: "建造", icon: "🏗️", desc: "在草地兴建建筑" },
  inspect: { id: "inspect", name: "查看", icon: "🔍", desc: "查看砖/作物的信息与效果" },
};
const TOOL_ORDER = ["hand", "water", "clear", "build", "inspect"];
const MOISTURE_MUL = 0.75;            // 濕土：當輪成長時間 ×0.75（更快）

// ===== Stage 4/5 世界（22×12，camera 跟隨，地圖為主畫面）=====
// 西側 0–15＝主農場；col16＝河（含斷橋）；cols17–21＝東林空地（封鎖區，修橋後解鎖）。
// S=農土 g=草地 p=步道 w=水域 R=石 U=樹樁 b=灌木 T=大樹(遮擋) B=斷橋 E=事件點
const MAP_W = 22, MAP_H = 12;
const EAST_REGION_MIN_X = 17;         // x ≥ 此值＝東林封鎖區（state.flags.bridgeRepaired 後可走）
const TILE_PX = 48;                   // 邏輯磚像素邊長（場景以像素佈局 + camera）
function buildV4Layout() {
  const g = Array.from({ length: MAP_H }, () => Array(MAP_W).fill("g"));
  const set = (x, y, c) => { if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) g[y][x] = c; };
  const hline = (y, x0, x1) => { for (let x = x0; x <= x1; x++) if (g[y][x] === "g") set(x, y, "p"); };
  const vline = (x, y0, y1) => { for (let y = y0; y <= y1; y++) if (g[y][x] === "g") set(x, y, "p"); };
  // 農土田 4×3 = 12 plots（cols2-5, rows1-3）
  for (let y = 1; y <= 3; y++) for (let x = 2; x <= 5; x++) set(x, y, "S");
  // 步道網（北南主道 col7、西側連田 row4、北橫道 row3、西道 col1、南橫道 row9、東道 col14、中橫道 row6）
  vline(7, 1, 9); hline(4, 4, 7); hline(3, 7, 14);
  hline(9, 3, 10); hline(6, 7, 11); vline(10, 9, 10);
  vline(14, 3, 4);
  // 池塘（左下 3×2）+ 旁草地放水井
  for (let y = 10; y <= 11; y++) for (let x = 0; x <= 2; x++) set(x, y, "w");
  set(0, 9, "w");
  // 障礙（可清/遮擋）
  set(4, 0, "T"); set(13, 0, "T"); set(9, 7, "T");   // 大樹（遮擋）
  set(3, 6, "R"); set(10, 5, "R");                   // 巨石
  set(6, 10, "b"); set(13, 11, "b");                 // 灌木
  set(8, 8, "U");                                    // 樹樁（擋住通往南區的舊路 → clear_old_path 任務）
  // ===== Stage 5：河 + 斷橋 + 東林封鎖區 =====
  for (let y = 0; y <= 11; y++) set(16, y, "w");     // col16 整條河（阻斷東西）
  hline(4, 14, 15);                                  // 把 col14 主道往東接到河西岸 (15,4)
  set(16, 4, "B");                                   // 斷橋（修好才可走過河）
  hline(4, 17, 20);                                  // 東岸登陸 (17,4) → 東林步道
  set(20, 4, "E");                                   // 事件點：東林古樹
  set(19, 8, "D");                                   // 東林深處入口（輕門檻解鎖）
  set(18, 2, "T"); set(21, 8, "T"); set(19, 9, "b"); // 東林裝飾（樹/灌木）
  return g.map((row) => row.join(""));
}
const MAP_LAYOUT = buildV4Layout();
const TERRAIN_CODE = { S: "soil", g: "grass", p: "path", w: "water" };
const OBSTACLE_CODE = { R: "rock", U: "stump", b: "bush", T: "tree" };
const PLAYER_START = { x: 7, y: 5 };  // 主道中央，可達田地/站點/建築
const WORLD_PROJECT_SITES = { fishing_dock: "t2_9", picnic_table: "t10_10", garden: "t6_2" };
const PICNIC_NPC_SEATS = { mayor: "t8_10", merchant: "t11_10", elder: "t9_11", child: "t12_10" };
const MOVE_MS = 200;                  // 每格移動 tween 毫秒
// ===== Stage 5：修橋成本 + 事件點 =====
const BRIDGE_COST = { wood: 6, stone: 4 };   // 修橋消耗（清樹樁得木材、清石得石頭）
const EVENTS = {
  east_clearing: {
    id: "east_clearing", name: "东林古树", tileChar: "E", x: 20, y: 4,
    desc: "穿过修好的断桥，东林深处有一棵古树。",
    reward: { coins: 120, materials: { wood: 3 } },   // 首次抵達一次性獎勵
    once: true,
  },
  east_deep_gate: {
    id: "east_deep_gate", name: "东林深处入口", tileChar: "D", x: 19, y: 8,
    desc: "枝叶挡住的小径，需要补强踏板后才能进入更深处。",
    once: true,
  },
};

// ===== 多格建築/結構（單一大型 sprite 覆蓋多格 footprint，加遮擋）=====
// footprint = w×h 磚；anchorTile = 互動站立基準（玩家走到相鄰）；sheet/frame 為素材；
// occlude = 高於地面、角色走到後方被遮住。
const STRUCTURES = [
  { id: "farmhouse", type: "farmhouse", name: "农舍",   sheet: "buildings", frame: "farmhouse",    x: 11, y: 4, w: 3, h: 2, occlude: true,  interaction: "home" },
  { id: "coop",      type: "coop",      name: "鸡舍",   sheet: "buildings", frame: "chicken_coop", x: 3,  y: 7, w: 2, h: 2, occlude: true,  interaction: "coop", building: "chickenCoop" },
  { id: "barn",      type: "barn",      name: "畜舍",   sheet: "buildings", frame: "barn",         x: 12, y: 6, w: 2, h: 2, occlude: true,  interaction: "barn",  building: "barn" },
  { id: "shop",      type: "shop",      name: "市集摊", sheet: "buildings", frame: "shop",         x: 11, y: 1, w: 2, h: 2, occlude: true,  interaction: "shop" },
];

// ===== 地圖站點（固定設施，需「走過去 + 播動作」才觸發；非裝飾）=====
const STATIONS = {
  order_board: { id: "order_board", name: "订单看板", frame: "order_board",  action: "station", effect: "orders", desc: "走过去查看市集订单" },
  storage:     { id: "storage",     name: "仓库木箱", frame: "storage_crate", action: "carry",   effect: "sell",   desc: "走过去卖出所有库存" },
  mailbox:     { id: "mailbox",     name: "信箱",     frame: "mailbox",       action: "station", effect: "mail",   desc: "走过去看信件与任务" },
  sign:        { id: "sign",        name: "告示牌",   frame: "order_board",   action: "station", effect: "story",  desc: "走过去阅读秋秋农场告示" },
  well:        { id: "well",        name: "水井",     frame: "well",          action: "water",   effect: "well",   desc: "走过去汲水替全部干土浇水" },
};
// 放在草地磚（須為 grass、不堵障礙唯一通道、不與 STRUCTURES footprint 重疊）：
const STATION_PLACEMENT = [
  { type: "mailbox",     x: 8,  y: 5 },
  { type: "sign",        x: 6,  y: 5 },
  { type: "order_board", x: 9,  y: 2 },
  { type: "storage",     x: 10, y: 7 },
  { type: "well",        x: 3,  y: 10 },
];

// ===== Stage 6：NPC 鎮民（地圖實體，走近才能交談；台詞依故事進度變化）=====
// phase：start（序章）→ ch1done → bridge → ch2done → ch3done → ch4done → ch5done → postscript
const NPCS = {
  mayor: { id: "mayor", name: "镇长 葛瑞", title: "晨光镇长", frame: "mayor", lines: {
    start:   ["晨光镇欢迎你回来，孩子。", "你祖母的田荒了好一阵，先到告示牌接第一张委托吧。"],
    ch1done: ["麦香又飘回镇上了，大家都在谈论你。", "东边那座桥年久失修——把它修好，就能踏进东林。"],
    bridge:  ["桥通了！东林的古树是晨光镇的老守护。", "去树下看看，听说藏着你祖母留下的旧物。"],
    ch2done: ["连东林都走遍了，真有你祖母的影子。", "想让农场更热闹？去找老农班伯，学学照顾动物吧。"],
    ch3done: ["作物跟动物你都顾得妥妥贴贴，镇民都看在眼里。", "以后我这偶尔会带点小委托来，别嫌我麻烦啊。"],
    ch4done: ["丰年祭办得稳，四季物产也站上台面了。", "晨光镇今年的招牌，就靠你的农场撑起来。"],
    ch5done: ["你祖母把信交给我时，手一直按着那顶草帽。", "现在我懂了，她等的不是旧农场回来，是你愿意把它往前带。"],
    postscript: ["明年的丰年祭我想多留一排摊位，让四季物产都有自己的牌子。", "农场不用急着变大，只要每一季都有人愿意再走回来。"] } },
  merchant: { id: "merchant", name: "商人 萝拉", title: "市集商人", frame: "merchant", lines: {
    start:   ["新鲜货色看一下？等你有了作物，市集随时收购。"],
    ch1done: ["你的麦子品质不错，订单看板上的客人会喜欢。"],
    bridge:  ["东林通了？那边的野花蜜，以后说不定能进货。"],
    ch2done: ["生意越来越好，多亏你把路打通了。"],
    ch3done: ["听说你连优质蛋奶都能收成，这可以当晨光镇的招牌货！", "手头有好货的话，记得留一份给我试卖。"],
    ch4done: ["四季货架终于补齐，甜椒、葡萄和鸭蛋都能挂上祭典牌。", "丰年祭那张订单，我会替你放在市集最显眼的位置。"],
    ch5done: ["你祖母以前总把最好的种子留到最后才卖，说那是替明年留路。", "你回的那封信，我会替她放在货架最里侧，不给风吹走。"],
    postscript: ["下季的货单我先替你空着，甜椒、向日葵和葡萄都有人问。", "别把市集看成终点，它只是让农场故事被更多人带走的地方。"] } },
  elder: { id: "elder", name: "老农 班伯", title: "隔壁老农", frame: "elder", lines: {
    start:   ["鸡舍那只母鸡养得还行，记得常喂牠。"],
    ch1done: ["想要更多蛋奶？把动物顾好，产量自然上来。"],
    bridge:  ["东林的草肥，以后放羊吃草最好。"],
    ch2done: ["下次该认真养群动物了——亲密度高，产物品质才好。"],
    ch3done: ["照护的手艺算是出师了，不过动物要天天顾，可别松懈。", "手头若有多的产物，拿来让我瞧瞧成果也好。"],
    ch4done: ["你连鸭都照顾得服服贴贴，这座农场真的成气候了。", "季节会轮，手艺不能停，记得让田地跟着天时走。"],
    ch5done: ["她那年把草帽挂在鸡舍旁，说总有一天会有人接着戴。", "你照顾得好，动物知道，土地也知道。"],
    postscript: ["花圃那边若长了杂草，别急着拔光，有些小花会自己报季节。", "动物明天还是会饿，这很好，表示农场还在活着。"] } },
  child: { id: "child", name: "孩童 图图", title: "镇上孩童", frame: "child", lines: {
    start:   ["你会种田吗？教教我嘛！"],
    ch1done: ["哇，你收成了好多麦子！"],
    bridge:  ["桥修好了！我可以去河对面玩了吗？"],
    ch2done: ["东林的古树好大喔，你看过了吗？"],
    ch3done: ["我也想帮忙跑腿！可以帮我准备一盒野餐点心吗？"],
    ch4done: ["丰年祭的灯笼超漂亮！下次我也要帮忙挂。"],
    ch5done: ["我看见信箱亮了一下，好像故事真的住在里面。", "以后我也要写信，写给长大后还记得农场的自己。"],
    postscript: ["我在野餐地图上又画了一条路，等秋天我们去找栗子。", "如果你明年还在，我就把最大的向日葵留给农场门口。"] } },
};
const NPC_PLACEMENT = [
  { type: "mayor",    x: 10, y: 4, facing: "down" },
  { type: "merchant", x: 14, y: 2, facing: "down" },
  { type: "elder",    x: 5,  y: 8, facing: "down" },
  { type: "child",    x: 8,  y: 7, facing: "down" },
];

// ===== Stage 10：NPC 重複委託（走近 NPC 觸發，交付後進冷卻，非到期制）=====
// pool 只是候選白名單，實際生成時會跟 availableOrderItems(state) 取交集，
// 確保永遠不會要求玩家還沒解鎖/還沒收集過的品項（沿用 D 系統的發現閥門）。
const NPC_REQUEST_COOLDOWN_MS = 8 * 60 * 1000; // 交付後多久可再接下一張委託
// R71（B-02 縮幅）：flavorOffer/flavorDone 各 2 變體/人；選句用該張委託的 createdAt
// 取模（決定性，不引入 Math.random），同一張委託反覆對話永遠同一句，offer/done 同索引成組。
const NPC_REQUESTS = {
  mayor:    { pool: ["wheat", "carrot", "tomato", "radish", "corn", "bell_pepper", "sunflower", "potato", "melon"], rewardMul: 1.0,
    flavorOffer: ["镇上想办点小活动，能否匀些{item}给我？",
                  "公告栏刚贴出新活动，帐上还缺{item}，能请农场支持一批吗？"],
    flavorDone:  ["有你真好，晨光镇又热闹一场。",
                  "我会把农场记在活动谢名单的第一行。"] },
  merchant: { pool: ["strawberry", "corn", "pumpkin", "radish", "bell_pepper", "sunflower", "potato", "grapes", "melon", "forest_herb", "glow_mushroom", "wild_berry", "river_mint", "mooncap_spore", "amber_resin", "forest_chestnut", "frost_cherry", "egg_good", "egg_premium", "duck_egg_good", "duck_egg_premium", "milk_good", "milk_premium", "wool_good", "wool_premium", "honey_good", "honey_premium"], rewardMul: 1.15,
    flavorOffer: ["市集缺货，手头有{item}吗？",
                  "外地旅人指名要{item}，价钱好谈，货先到先赢。"],
    flavorDone:  ["生意兴隆，多亏你这批货。",
                  "这批我记你一笔好价，下次有稀罕货先想到我。"] },
  elder:    { pool: ["radish", "potato", "winter_kale", "egg", "duck_egg", "milk", "wool", "honey", "forest_herb", "glow_mushroom", "wild_berry", "river_mint", "mooncap_spore", "amber_resin", "forest_chestnut", "frost_cherry", "egg_good", "duck_egg_good", "milk_good", "wool_good", "honey_good"], rewardMul: 1.1,
    flavorOffer: ["帮我张罗点{item}，我拿去炖汤。",
                  "入夜前想备妥{item}，老骨头的汤锅等不了太晚。"],
    flavorDone:  ["这品质，照顾得很用心啊。",
                  "嗯，这手艺你祖母看了也会点头。"] },
  child:    { pool: ["wheat", "carrot", "radish", "corn", "sunflower", "strawberry", "grapes", "wild_berry", "frost_cherry"], rewardMul: 0.85,
    flavorOffer: ["可以给我一点{item}吗？我肚子饿了！",
                  "我想带{item}去野餐分给大家，可以先给我一份吗？"],
    flavorDone:  ["谢谢你！好好吃！",
                  "耶！我要把最好吃的留到最后一口！"] },
};

// ===== R15/R19：鎮民一次性支線（固定小委託；不使用隨機報酬公式）=====
const NPC_SIDE_QUESTS = {
  mayor: {
    id: "mayor_notice_board", npcId: "mayor", title: "公告栏重新开张",
    wants: { wheat: 4 }, rewardCoins: 16, rewardXp: 3,
    offer: "镇上的公告栏要重新开张，先送 4 份小麦来当第一批登记样品吧。",
    done: "公告栏终于像样了，大家会更常来看你的农场消息。",
    lore: "镇公所的公告栏其实是旧农场留下的木板，重新贴满委托后，镇民才开始把农场当成生活的一部分。",
    steps: [
      { id: "mayor_notice_board_1", title: "公告栏重新开张",
        wants: { wheat: 4 }, rewardCoins: 16, rewardXp: 3,
        offer: "镇上的公告栏要重新开张，先送 4 份小麦来当第一批登记样品吧。",
        done: "公告栏终于像样了，大家会更常来看你的农场消息。" },
      { id: "mayor_notice_board_2", title: "巡路便当",
        wants: { carrot: 2 }, rewardCoins: 9, rewardXp: 2,
        offer: "修好的路要巡一圈，帮我准备 2 份胡萝卜当巡路便当。",
        done: "巡路的人有东西吃，桥边的回报也会更准时。" },
      { id: "mayor_notice_board_3", title: "镇会样品",
        wants: { tomato: 1 }, rewardCoins: 10, rewardXp: 3,
        offer: "镇会想看农场现在能供应什么，带 1 份番茄当样品就好。",
        done: "镇会记下来了，这块公告栏会继续替农场接上镇上的需求。" },
    ],
  },
  merchant: {
    id: "merchant_forest_bundle", npcId: "merchant", title: "东林试卖组",
    wants: { forest_herb: 1, glow_mushroom: 1 }, rewardCoins: 14, rewardXp: 4,
    offer: "我想把东林货做成试卖组，药草和萤光菇各一份就好。",
    done: "包装起来很有卖相，东林的名字会慢慢传出去。",
    lore: "商人把东林采集物列成小镇的新货架，外地旅人因此开始问起这座被河隔开很久的森林。",
    steps: [
      { id: "merchant_forest_bundle_1", title: "东林试卖组",
        wants: { forest_herb: 1, glow_mushroom: 1 }, rewardCoins: 14, rewardXp: 4,
        offer: "我想把东林货做成试卖组，药草和萤光菇各一份就好。",
        done: "包装起来很有卖相，东林的名字会慢慢传出去。" },
      { id: "merchant_forest_bundle_2", title: "森林香包",
        wants: { wild_berry: 1, river_mint: 1 }, rewardCoins: 14, rewardXp: 4,
        offer: "下一批要做森林香包，野莓和薄荷各一份，味道会更完整。",
        done: "香味很清楚，这批可以放到市集摊前面。" },
      { id: "merchant_forest_bundle_3", title: "旅人样货",
        wants: { corn: 1 }, rewardCoins: 13, rewardXp: 3,
        offer: "外地旅人想买能久放的农产，带 1 份玉米让我配成样货。",
        done: "有农产也有森林货，旅人会记得这座镇不只卖一种东西。" },
    ],
  },
  elder: {
    id: "elder_coop_check", npcId: "elder", title: "鸡舍巡查",
    wants: { egg: 2 }, rewardCoins: 12, rewardXp: 4,
    offer: "让我看看你照顾鸡舍的成果，带 2 颗鸡蛋来。",
    done: "蛋壳厚实，鸡舍照护算是稳了。",
    lore: "老农以前也替镇上看顾过动物棚，现在他把照护笔记留给农场，让年轻镇民能接手。",
    steps: [
      { id: "elder_coop_check_1", title: "鸡舍巡查",
        wants: { egg: 2 }, rewardCoins: 12, rewardXp: 4,
        offer: "让我看看你照顾鸡舍的成果，带 2 颗鸡蛋来。",
        done: "蛋壳厚实，鸡舍照护算是稳了。" },
      { id: "elder_coop_check_2", title: "照护笔记",
        wants: { egg_good: 1 }, rewardCoins: 10, rewardXp: 3,
        offer: "若照护得更细，蛋会不一样。带 1 颗良好鸡蛋让我记到笔记里。",
        done: "这个品质能当教学范例，笔记会更完整。" },
      { id: "elder_coop_check_3", title: "老农草药",
        wants: { forest_herb: 1, glow_mushroom: 1 }, rewardCoins: 11, rewardXp: 3,
        offer: "动物棚也需要驱潮的草药，东林药草和萤光菇各带一份来。",
        done: "棚里会干爽些。这套照护法，以后可以交给镇上的孩子。" },
    ],
  },
  child: {
    id: "child_picnic_pack", npcId: "child", title: "野餐小包",
    wants: { wheat: 2, carrot: 2 }, rewardCoins: 10, rewardXp: 3,
    offer: "我想做一份野餐小包，可以帮我准备小麦和胡萝卜吗？",
    done: "野餐小包完成！我会分一点给大家。",
    lore: "孩子把第一次野餐画成地图，标出桥、菇木和薄荷水边，成了小镇新的散步路线。",
    steps: [
      { id: "child_picnic_pack_1", title: "野餐小包",
        wants: { wheat: 2, carrot: 2 }, rewardCoins: 10, rewardXp: 3,
        offer: "我想做一份野餐小包，可以帮我准备小麦和胡萝卜吗？",
        done: "野餐小包完成！我会分一点给大家。" },
      { id: "child_picnic_pack_2", title: "森林点心",
        wants: { wild_berry: 1 }, rewardCoins: 7, rewardXp: 2,
        offer: "野餐如果有东林野莓就更像冒险了，可以带 1 份吗？",
        done: "甜甜的！我会在地图上画一颗莓果记号。" },
      { id: "child_picnic_pack_3", title: "路线标记",
        wants: { wheat: 2, carrot: 1 }, rewardCoins: 7, rewardXp: 2,
        offer: "最后要做路线标记的小点心，再给我 2 份小麦和 1 份胡萝卜。",
        done: "完成！大家可以照着我的野餐地图走到东林边。" },
    ],
  },
};

// ===== 故事任務（地圖驅動：信箱/告示觸發、目標在地圖上有標記）=====
const QUESTS = {
  intro_reopen_farm: { id: "intro_reopen_farm", title: "回到秋秋农场",
    desc: "先走到告示牌或信箱，看看开源农场的第一张任务。", next: "plant_wheat",
    trigger: "read_sign", marker: { kind: "station", type: "sign" } },
  plant_wheat:       { id: "plant_wheat", title: "种下第一批小麦",
    desc: "选小麦种子，走到空农土种下。", next: "first_water",
    objective: "plant", marker: { kind: "soil" } },
  first_water:       { id: "first_water", title: "替小麦浇水",
    desc: "走到水井汲水，或用浇水工具替麦田浇水。", next: "first_harvest",
    objective: "water", marker: { kind: "station", type: "well" } },
  first_harvest:     { id: "first_harvest", title: "收成小麦",
    desc: "等小麦成熟后走过去收成。", next: "first_delivery",
    objective: "harvest", marker: { kind: "soil" } },
  first_delivery:    { id: "first_delivery", title: "交付第一张订单",
    desc: "走到订单看板，交付首收小麦可完成的新手订单。", next: "clear_old_path",
    objective: "deliver", marker: { kind: "station", type: "order_board" } },
  clear_old_path:    { id: "clear_old_path", title: "清开荒地旧路",
    desc: "用清除工具清掉挡路的树桩，取得修桥用木材并打通南边。", next: "repair_bridge",
    objective: "clear", marker: { kind: "obstacle", object: "stump" }, chapter: 1 },
  // ===== 第二章：世界可探索（Stage 5）=====
  repair_bridge:     { id: "repair_bridge", title: "修复东边断桥",
    desc: "依任务 Dock 的材料清单清除大树与巨石，凑齐木材 6、石头 4 后走到断桥修复。", next: "explore_new_area",
    objective: "repair_bridge", marker: { kind: "bridge" }, chapter: 2 },
  explore_new_area:  { id: "explore_new_area", title: "探索东林空地",
    desc: "过桥走到东林古树，看看封锁已久的东边有什么。", next: "discover_east_forage",
    objective: "reach_event", marker: { kind: "event", event: "east_clearing" }, chapter: 2 },
  discover_east_forage: { id: "discover_east_forage", title: "辨认东林采集点",
    desc: "前往东林的药草丛或菇木，先记下可采集的位置。", next: "collect_east_forage",
    objective: "discover_forage", marker: { kind: "forage" }, chapter: 2 },
  collect_east_forage: { id: "collect_east_forage", title: "收集东林样品",
    desc: "各采集一份东林药草与萤光菇，带回镇上确认用途。", next: "report_east_forage",
    objective: "collect_forage", marker: { kind: "forage" }, chapter: 2 },
  report_east_forage: { id: "report_east_forage", title: "回报东林新货源",
    desc: "把东林药草与萤光菇交给商人登记，让采集品进入镇民委托。", next: "learn_animal_care",
    objective: "report_forage", marker: { kind: "npc", type: "merchant" }, chapter: 2 },
  // ===== 第三章：動物照護（Stage 7）=====
  learn_animal_care: { id: "learn_animal_care", title: "跟老农学动物照护",
    desc: "找老农班伯聊聊，学习怎么照顾动物。", next: "feed_care_animal",
    trigger: "npc_elder", marker: { kind: "npc", type: "elder" }, chapter: 3 },
  feed_care_animal:  { id: "feed_care_animal", title: "喂食、浇水或梳理一只动物",
    desc: "走到鸡舍或畜舍，选一只动物喂食、浇水或梳理。", next: "raise_affinity_happy",
    objective: "care_animal", marker: { kind: "structure", id: "coop" }, chapter: 3 },
  raise_affinity_happy: { id: "raise_affinity_happy", title: "让一只动物养到开心",
    desc: "多照顾同一只动物，亲密度达到开心程度。", next: "collect_quality_product",
    objective: "affinity_happy", marker: { kind: "structure", id: "coop" }, chapter: 3 },
  collect_quality_product: { id: "collect_quality_product", title: "收集一份优质或顶级产物",
    desc: "亲密度够高时收集，产物品质会提升。", next: "deliver_quality_order",
    objective: "collect_quality", marker: { kind: "structure", id: "coop" }, chapter: 3 },
  deliver_quality_order: { id: "deliver_quality_order", title: "卖出或交付优质产物",
    desc: "把优质/顶级产物直售或交付订单，让晨光镇尝尝用心照顾的成果。", next: "prepare_four_seasons",
    objective: "deliver_quality", chapter: 3 },
  // ===== 第四章：豐年祭・四季物產（R47）=====
  prepare_four_seasons: { id: "prepare_four_seasons", title: "备齐四季物产",
    desc: "至少收成四种不同季节的作物，让祭典摊位有春夏秋冬的代表。",
    next: "welcome_ducks", objective: "harvest_four_seasons", marker: { kind: "soil" }, chapter: 4 },
  welcome_ducks: { id: "welcome_ducks", title: "迎接鸭舍新成员",
    desc: "兴建鸭舍、饲养鸭，收集一颗鸭蛋作为新物产样品。",
    next: "finish_festival_order", objective: "collect_duck_egg", marker: { kind: "building", type: "duckPen" }, chapter: 4 },
  finish_festival_order: { id: "finish_festival_order", title: "完成丰年祭订单",
    desc: "交付一张丰年祭订单，让四季物产正式登上晨光镇祭典。",
    next: null, objective: "festival_order", marker: { kind: "station", type: "order_board" }, chapter: 4 },
};
const FIRST_QUEST = "intro_reopen_farm";
// 章節任務分組（故事面板：第一章完成度 X/6，第二章 X/2、第三章 X/5 另計）
const PROLOGUE_QUESTS = ["intro_reopen_farm", "plant_wheat", "first_water", "first_harvest", "first_delivery", "clear_old_path"];
const CHAPTER2_QUESTS = ["repair_bridge", "explore_new_area", "discover_east_forage", "collect_east_forage", "report_east_forage"];
const CHAPTER3_QUESTS = ["learn_animal_care", "feed_care_animal", "raise_affinity_happy", "collect_quality_product", "deliver_quality_order"];
const CHAPTER4_QUESTS = ["prepare_four_seasons", "welcome_ducks", "finish_festival_order"];

const LETTERS = [
  {
    id: "letter_first_delivery",
    title: "第一封：田重新会呼吸",
    from: "祖母",
    season: "春",
    unlock: { type: "story_completed", id: "first_delivery" },
    body: [
      "孩子，若你读到这封信，表示第一批作物已经从土里回到仓库，也回到晨光镇人的餐桌上。",
      "你祖父第一次牵着我的手播种时，整块田还硬得像睡着的石头，我们也是从几把小麦开始，慢慢听见土地吐气。",
      "不要急着把荒芜看成失败，荒芜有时只是等一个愿意弯腰的人。",
      "你肯回来，我就知道秋秋农场还记得家的方向。"
    ],
  },
  {
    id: "letter_bridge",
    title: "第二封：桥那边的风",
    from: "祖母",
    season: "夏",
    unlock: { type: "flag", flag: "bridgeRepaired" },
    body: [
      "东桥若修好了，你一定会先听见河面上的风，声音跟你小时候在门口追蜻蜓时一样。",
      "那座桥是你祖父跟镇上的人一起搭的，他说农场不能只顾自己的田，也要替大家留一条路。",
      "后来木板老了，我的膝盖也老了，只能把那边的林子交给时间看守。",
      "现在你走过去时，请替我摸摸桥栏，跟它说一声：我们回来了。"
    ],
  },
  {
    id: "letter_animals",
    title: "第三封：母鸡认得温柔",
    from: "祖母",
    season: "春",
    unlock: { type: "animal_happy" },
    body: [
      "动物其实比人更早知道一座农场有没有被好好照顾。",
      "旱灾那年，我们省下井水给母鸡喝，牠少下了好几周的蛋，却在第一场雨后站到门口叫我起床。",
      "你祖父笑说，那不是催人工作，是牠在确认家里的人还在。",
      "如果牠们愿意靠近你，就把草帽戴稳，慢慢说话，田边所有活物都听得懂温柔。"
    ],
  },
  {
    id: "letter_spring",
    title: "第四封：春天的第一把泥",
    from: "祖母",
    season: "春",
    unlock: { type: "season_reached", season: "春" },
    body: [
      "春天来时，别只看花，先抓一把湿泥闻闻。",
      "泥里有去年的叶、有冬天慢慢化开的寒气，也有你还没种下去的盼望。",
      "我年轻时总在春分前后种豌豆，因为它们攀得快，好像替人把心事往上拉。",
      "若你觉得重新开始很笨拙，就让春天教你，所有新芽一开始都站不稳。"
    ],
  },
  {
    id: "letter_summer",
    title: "第五封：夏日要记得留水",
    from: "祖母",
    season: "夏",
    unlock: { type: "season_reached", season: "夏" },
    body: [
      "夏天的晨光镇会亮得让人瞇眼，连石板路都像刚烤过。",
      "旱灾最严重那一年，我跟你祖父把水桶排在井边，先给苗、再给鸡，最后才轮到自己洗手。",
      "那时我学会一件事：丰收不是把所有东西都拿到手，而是知道该替明天留下什么。",
      "你若种甜椒、玉米或地瓜，记得看天，也记得看自己的力气。"
    ],
  },
  {
    id: "letter_autumn",
    title: "第六封：秋天把名字留下",
    from: "祖母",
    season: "秋",
    unlock: { type: "season_reached", season: "秋" },
    body: [
      "秋天是我最喜欢记帐的季节，因为每一笔收成后面都有一个人的名字。",
      "葡萄送去给萝拉，栗子留给图图，地瓜要挑几条细长的，让镇长拿去分给巡路的人。",
      "你祖父常说，农场的仓库若只堆满货，就会变得很安静；若记得要分给谁，门口才会热闹。",
      "所以别怕把好东西拿出去，土地给你的，不会因为分享就变少。"
    ],
  },
  {
    id: "letter_winter",
    title: "第七封：霜里也有绿",
    from: "祖母",
    season: "冬",
    unlock: { type: "season_reached", season: "冬" },
    body: [
      "冬天的田看起来慢，其实只是把力气藏在土里。",
      "我晚年最爱种冬羽甘蓝，叶子被霜碰过后反而更甜，像人经过一些冷日子，心也会变得更懂珍惜。",
      "你祖父走后的第一个冬天，我每天都到田埂站一下，不说话，只看那些还肯发绿的叶。",
      "孩子，若哪天你觉得孤单，就去看看冬天的菜，它们会告诉你：还能长。"
    ],
  },
  {
    id: "letter_festival",
    title: "第八封：丰年祭的灯",
    from: "祖母",
    season: "四季",
    unlock: { type: "festival_orders", count: 1 },
    body: [
      "若丰年祭的灯笼又挂起来了，我想晨光镇一定比我记忆里更亮。",
      "我把这些信交给葛瑞时，没有把话说满，因为我不知道回来的人会不会怨我留下太多未完成的事。",
      "可我一直相信，农场不是祖母的，也不是祖父的，它属于每一个愿意让土地和人重新靠近的人。",
      "现在轮到你写一封信了，不必写给过去的我，写给明天还会走进这块田的自己。"
    ],
  },
  {
    id: "letter_mayor_notice_back",
    title: "葛瑞：公告栏背面的字",
    from: "葛瑞",
    season: "四季",
    unlock: { type: "side_quest_done", npcId: "mayor" },
    body: [
      "我把旧公告栏翻修时，才看见背面刻着你祖母的字：『留一格给还没回家的人。』",
      "以前我只当那是她念旧，直到你把委托一张张接回来，镇上的人又开始在栏前停步。",
      "谢谢你让这块木板不只是公告，也像一扇重新打开的门。"
    ],
  },
  {
    id: "letter_merchant_ledger_leaf",
    title: "萝拉：市集帐本夹层",
    from: "萝拉",
    season: "四季",
    unlock: { type: "side_quest_done", npcId: "merchant" },
    body: [
      "整理帐本时，我找到一张你祖母留下的夹页，上面只写着『好货要有人情味才卖得远』。",
      "你送来的森林香包和农产样货，让这句话突然变得很会算帐。",
      "下次来市集，我替你留一格最不怕风吹的位置。"
    ],
  },
  {
    id: "letter_elder_care_note",
    title: "班伯：照护笔记末页",
    from: "班伯",
    season: "四季",
    unlock: { type: "side_quest_done", npcId: "elder" },
    body: [
      "照护笔记最后一页本来是空的，我今天补上一行：『有人愿意慢慢学，动物就愿意慢慢信。』",
      "你送来的蛋、草料和成果都不算夸张，却很稳，这比一时的热闹更难得。",
      "农场的声音回来了，以后每天照常做就好。"
    ],
  },
  {
    id: "letter_child_picnic_map",
    title: "图图：野餐地图背面",
    from: "图图",
    season: "四季",
    unlock: { type: "side_quest_done", npcId: "child" },
    body: [
      "我在野餐地图背面画了农场，田是方方的，桥是亮亮的，信箱旁边有一颗大大的星星。",
      "你给我的点心都很好吃，可是最好的是大家又有地方可以去。",
      "等下次丰年祭，我要把这张地图拿给所有人看。"
    ],
  },
  {
    id: "letter_memory_garden",
    title: "花圃边的短笺",
    from: "祖母",
    season: "四季",
    unlock: { type: "building_owned", id: "memory_garden" },
    body: [
      "如果你替我留下一小块花圃，请别把它整理得太整齐。",
      "有些花会自己选地方长，像人会自己选回家的日子。",
      "你若从旁边走过，就当我在田埂上向你点头。"
    ],
  },
];
const CHAPTER5_LETTERS = [
  "letter_first_delivery",
  "letter_bridge",
  "letter_animals",
  "letter_spring",
  "letter_summer",
  "letter_autumn",
  "letter_winter",
  "letter_festival",
];
const TOWNSFOLK_LETTERS = [
  "letter_mayor_notice_back",
  "letter_merchant_ledger_leaf",
  "letter_elder_care_note",
  "letter_child_picnic_map",
];

const MAP_DEFAULT = { width: MAP_W, height: MAP_H };
// 走路方向 → walk-cycle sheet 列（4 列：下/左/右/上）
const FACING_ROW = { down: 0, left: 1, right: 2, up: 3 };

// ===== 匯出（瀏覽器掛 window、Node 用 module.exports）=====
// Legacy saves keep their original text; convert historical dialogue only when displayed.
const LEGACY_ZH_HANS = {"與":"与","復":"复","興":"兴","穫":"获","釣":"钓","補":"补","邊":"边","會":"会","魚":"鱼","鋪":"铺","讓":"让","帶":"带","來":"来","園":"园","壓":"压","後":"后","農":"农","麥":"麦","餅":"饼","剛":"刚","蘿":"萝","蔔":"卜","點":"点","鯉":"鲤","銀":"银","鯽":"鲫","鱸":"鲈","鎮":"镇","鏡":"镜","個":"个","聲":"声","種":"种","們":"们","澆":"浇","談":"谈","兩":"两","給":"给","數":"数","廚":"厨","嚐":"尝","準":"准","備":"备","調":"调","腳":"脚","處":"处","試":"试","風":"风","裡":"里","籃":"篮","採":"采","獲":"获","隻":"只","幾":"几","張":"张","確":"确","認":"认","鄰":"邻","齊":"齐","顧":"顾","動":"动","訂":"订","單":"单","圖":"图","進":"进","筆":"笔","記":"记","開":"开","飯":"饭","壺":"壶","幣":"币","檔":"档","資":"资","時":"时","間":"间","無":"无","險":"险","緒":"绪","沒":"没","這":"这","計":"计","務":"务","須":"须","對":"对","獎":"奖","勵":"励","經":"经","領":"领","過":"过","標":"标","還":"还","畫":"画","鎖":"锁","夠":"够","拋":"抛","簍":"篓","滿":"满","購":"购","買":"买","鮮":"鲜","託":"托","東":"东","瀏":"浏","覽":"览","讀":"读","縮":"缩","貼":"贴","錨":"锚","內":"内","徑":"径","銳":"锐","載":"载","敗":"败","將":"将","預":"预","設":"设","顯":"显","傳":"传","絕":"绝","層":"层","純":"纯","級":"级","遊":"游","戲":"戏","離":"离","線":"线","掛":"挂","鐘":"钟","長":"长","價":"价","塊":"块","鑑":"鉴","話":"话","欄":"栏","約":"约","項":"项","續":"续","輪":"轮","別":"别","賣":"卖","聞":"闻","陽":"阳","場":"场","輕":"轻","請":"请","斷":"断","紅":"红","顆":"颗","嬌":"娇","氣":"气","彎":"弯","乾":"干","聽":"听","見":"见","總":"总","說":"说","櫻":"樱","馬":"马","鈴":"铃","溫":"温","藍":"蓝","換":"换","廣":"广","轉":"转","曬":"晒","頭":"头","涼":"凉","穀":"谷","倉":"仓","門":"门","爐":"炉","湯":"汤","鍋":"锅","綠":"绿","週":"周","貨":"货","葉":"叶","紙":"纸","順":"顺","願":"愿","濕":"湿","潤":"润","繩":"绳","結":"结","綁":"绑","護":"护","箋":"笺","檻":"槛","節":"节","碼":"码","達":"达","墾":"垦","脈":"脉","擴":"扩","庫":"库","幫":"帮","機":"机","運":"运","階":"阶","組":"组","優":"优","質":"质","豐":"丰","連":"连","豔":"艳","霧":"雾","較":"较","變":"变","戶":"户","賺":"赚","師":"师","鴨":"鸭","應":"应","櫃":"柜","攤":"摊","產":"产","當":"当","親":"亲","決":"决","綴":"缀","頂":"顶","雞":"鸡","則":"则","藥":"药","橋":"桥","螢":"萤","盞":"盏","燈":"灯","謝":"谢","叢":"丛","學":"学","樹":"树","適":"适","環":"环","滲":"渗","殼":"壳","樣":"样","穩":"稳","紀":"纪","錄":"录","籠":"笼","徵":"征","緣":"缘","針":"针","縫":"缝","寫":"写","舊":"旧","裝":"装","繼":"继","憶":"忆","夾":"夹","條":"条","餵":"喂","減":"减","導":"导","擬":"拟","狀":"状","態":"态","費":"费","卻":"却","瘋":"疯","擊":"击","衝":"冲","統":"统","稱":"称","礙":"碍","於":"于","蓋":"盖","築":"筑","磚":"砖","規":"规","飾":"饰","釋":"释","樁":"桩","擋":"挡","響":"响","濟":"济","該":"该","為":"为","並":"并","強":"强","額":"额","靜":"静","訊":"讯","隨":"随","側":"侧","區":"区","邏":"逻","輯":"辑","佈":"布","網":"网","橫":"横","陸":"陆","構":"构","觸":"触","發":"发","閱":"阅","疊":"叠","實":"实","體":"体","詞":"词","歡":"欢","陣":"阵","飄":"飘","論":"论","熱":"热","鬧":"闹","爾":"尔","煩":"烦","辦":"办","檯":"台","撐":"撑","現":"现","錯":"错","虧":"亏","終":"终","問":"问","養":"养","藝":"艺","鬆":"松","雜":"杂","報":"报","餓":"饿","嗎":"吗","複":"复","選":"选","際":"际","遠":"远","閥":"阀","勻":"匀","帳":"帐","錢":"钱","贏":"赢","羅":"罗","燉":"炖","麼":"么","細":"细","範":"范","驅":"驱","號":"号","湊":"凑","習":"习","員":"员","飼":"饲","從":"从","牽":"牵","蕪":"芜","災":"灾","覺":"觉","嚴":"严","誰":"谁","愛":"爱","訴":"诉","屬":"属","頁":"页","誇":"夸","難":"难","匯":"汇","測":"测","擁":"拥","檢":"检","類":"类","許":"许","維":"维","圍":"围","寬":"宽","丟":"丢","賴":"赖","刪":"删","駐":"驻","漲":"涨","積":"积","損":"损","尋":"寻","餘":"余","繞":"绕","誤":"误","關":"关","鈕":"钮","義":"义","棄":"弃","賠":"赔","彙":"汇","審":"审","淨":"净","殘":"残","語":"语","遷":"迁","僅":"仅","髒":"脏","壞":"坏","歷":"历","證":"证","視":"视","墊":"垫","專":"专","擇":"择","擾":"扰","隱":"隐","捲":"卷","籤":"签","執":"执","負":"负","擔":"担","棟":"栋","鏈":"链","饋":"馈","閉":"闭","納":"纳","甦":"苏","營":"营","詳":"详","啟":"启","監":"监","頻":"频","電":"电","頓":"顿","診":"诊","軒":"轩","戰":"战","盡":"尽","燼":"烬","嘗":"尝","製":"制","註":"注","冊":"册","慶":"庆","議":"议","鍵":"键","創":"创","獨":"独","緩":"缓","幀":"帧","礎":"础","擠":"挤","盤":"盘","摺":"折","遺":"遗","況":"况","噴":"喷","暫":"暂","飢":"饥","飽":"饱","牆":"墙","衛":"卫","勢":"势","迴":"回","鉤":"钩","驗":"验","顏":"颜","夥":"伙","譜":"谱","鑰":"钥"};
function simplifyLegacyText(value) {
  return String(value == null ? "" : value).replace(/[\s\S]/g, (char) => LEGACY_ZH_HANS[char] || char);
}

const CONFIG = {
  simplifyLegacyText,
  GAME, CROPS, CROP_SHEET, SEASONS, SEASON_DURATION_MS, SEASON_UNLOCK_LEVEL,
  SEASON_ORDER_BIAS, SEASON_EVENTS,
  LEVEL_XP, levelFromXp, xpForLevel,
  UPGRADES, UPGRADE_ORDER, ORDER_RARITY, ORDER_STREAK_BONUS, ORDER_STREAK_CAP,
  WEATHER, WEATHER_UNLOCK_LEVEL, WEATHER_DURATION_MS, ACHIEVEMENTS,
  PRODUCTS, FORAGE_ITEMS, FORAGE_NODES, FORAGE_NODE_COOLDOWN_MS, EAST_DEEP_FORAGE_COOLDOWN_MS,
  EAST_FORAGE_REPORT, EAST_DEEP_UNLOCK_COST, COLLECTIBLES,
  getItemDef, itemSellValue, MATERIALS, TERRAIN, OBSTACLES,
  BUILDINGS, BUILDING_ORDER, ANIMALS, MAP_DEFAULT,
  TOOLS, TOOL_ORDER, MOISTURE_MUL,
  MAP_LAYOUT, TERRAIN_CODE, OBSTACLE_CODE, PLAYER_START, MOVE_MS, FACING_ROW,
  STATIONS, STATION_PLACEMENT,
  WORLD_PROJECT_SITES, PICNIC_NPC_SEATS,
  MAP_W, MAP_H, TILE_PX, STRUCTURES, QUESTS, FIRST_QUEST,
  EAST_REGION_MIN_X, BRIDGE_COST, EVENTS, PROLOGUE_QUESTS, CHAPTER2_QUESTS, CHAPTER3_QUESTS, CHAPTER4_QUESTS,
  LETTERS, CHAPTER5_LETTERS, TOWNSFOLK_LETTERS,
  NPCS, NPC_PLACEMENT, NPC_REQUESTS, NPC_REQUEST_COOLDOWN_MS, NPC_SIDE_QUESTS,
  QUALITY_TIERS, QUALITY_SELL_MUL, QUALITY_LABEL,
  AFFINITY_MAX, AFFINITY_DECAY_PER_HOUR, AFFINITY_HAPPY_THRESHOLD, AFFINITY_GOOD_THRESHOLD,
  CARE_GAIN, CARE_COOLDOWN_MS, STATUS_STALE_MS,
};
if (typeof window !== "undefined") Object.assign(window, CONFIG, { CONFIG });
if (typeof module !== "undefined" && module.exports) module.exports = CONFIG;
