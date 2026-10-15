/* R75 adventure rules. Load after config.js; no DOM, timers, or save replacement.
 * Call ensure on load, then record successful external game actions only.
 * cook/fish/restore record their own events; record never grants inventory.
 * Selectors return detached arrays. Mutators return { ok, message, ... }.
 */
(function (root) {
  "use strict";
  const C = typeof module !== "undefined" && module.exports ? require("./config.js") : (root.CONFIG || root);
  const VERSION = 1;
  const COUNT_CAP = 1000000;
  const EVENT_CAP = 100;
  const MEAL_CAP = 99;
  const CATCH_CAP = 99;
  const FISH_COOLDOWN_MS = 30000;
  const EVENTS = ["plant", "water", "harvest", "talk", "forage", "fish", "cook", "restore", "order", "care"];
  const CHAPTERS = [
    { id: "home", name: "回家与第一餐" },
    { id: "river", name: "河畔复兴" },
    { id: "picnic", name: "收获野餐" },
  ];
  const PROJECTS = [
    { id: "fishing_dock", name: "河畔钓台", description: "补好河边踏板，班伯会借你一支鱼竿。", target: { kind: "river", id: "fishing_dock", tileId: "t2_9" },
      cost: { wood: 4, stone: 2 }, unlockQuest: "c1_first_meal", unlocks: ["fishing", "fishing_rod"] },
    { id: "picnic_table", name: "野餐桌", description: "铺好桌面，让大家带着料理来河边坐坐。", target: { kind: "station", id: "picnic_table", tileId: "t10_10" },
      cost: { wood: 6, wheat: 4 }, unlockQuest: "c2_river_basket", unlocks: ["baked_carrot", "mint_tea", "meal_gifts"] },
    { id: "garden", name: "花园", description: "整理一片小花圃，留下压花和野餐后的留言。", target: { kind: "station", id: "garden", tileId: "t6_2" },
      cost: { coins: 80, wood: 4 }, unlockQuest: "c3_good_neighbors", unlocks: ["pressed_flower", "garden_guestbook"] },
  ];
  const RECIPES = [
    { id: "rustic_bread", name: "农家麦饼", description: "把刚收的小麦烤成第一餐。", ingredients: { wheat: 2 }, unlockQuest: "c1_first_harvest" },
    { id: "baked_carrot", name: "胡萝卜烤饼", description: "加上胡萝卜，烤一份能带去野餐的点心。", ingredients: { wheat: 1, carrot: 2 }, unlockProject: "picnic_table" },
    { id: "mint_tea", name: "溪畔薄荷茶", description: "用溪畔薄荷泡茶，配上一小片麦饼。", ingredients: { river_mint: 1, wheat: 1 }, unlockProject: "picnic_table" },
  ];
  const FISH = [
    { id: "river_carp", name: "河鲤" },
    { id: "silver_dace", name: "银鲫" },
    { id: "river_perch", name: "溪鲈" },
  ];
  const COLLECTIBLES = {
    pressed_flower: { id: "pressed_flower", name: "河畔压花", description: "花园整理好后留下的第一朵小花。" },
    picnic_memory: { id: "picnic_memory", name: "收获野餐合照", description: "麦饼、薄荷茶和镇民一起入镜的那个下午。" },
  };
  const goal = (type, count, name, id) => ({ type, count, name, id: id || null });
  const reward = (coins, xp, materials, extra) => Object.assign({ coins, xp, materials: materials || {} }, extra || {});
  const QUESTS = [
    { id: "c1_homecoming", chapter: 1, name: "把田叫醒", npcId: "mayor", description: "跟葛瑞打声招呼，再种下三格作物，替它们浇水。", target: { kind: "npc", id: "mayor" }, wants: {},
      goals: [goal("talk", 1, "和葛瑞交谈", "mayor"), goal("plant", 3, "播种农地"), goal("water", 3, "浇水农地")], reward: reward(12, 2, { wood: 6, stone: 2 }) },
    { id: "c1_first_harvest", chapter: 1, name: "留一把小麦", npcId: "elder", description: "收下第一批作物，找班伯聊聊，把两份小麦留给他的灶台。", target: { kind: "npc", id: "elder" }, wants: { wheat: 2 },
      goals: [goal("harvest", 6, "收获作物数量"), goal("talk", 1, "和班伯交谈", "elder")], reward: reward(16, 6, { wood: 4, stone: 4 }) },
    { id: "c1_first_meal", chapter: 1, name: "回家的第一餐", npcId: "elder", description: "在野餐厨房做一份农家麦饼，带给班伯尝尝。他准备好了修钓台的木料。", target: { kind: "station", id: "kitchen", tileId: "t10_10" }, wants: {}, wantsMeals: { rustic_bread: 1 },
      goals: [goal("cook", 1, "烹调农家麦饼", "rustic_bread")], reward: reward(20, 4, { wood: 6 }, { fishingRod: true }) },
    { id: "c2_fishing_dock", chapter: 2, name: "河边有个落脚处", npcId: "elder", description: "用四份木材、两份石材修好钓台，再试试班伯的鱼竿。", target: { kind: "river", id: "fishing_dock", tileId: "t2_9" }, wants: {},
      goals: [goal("restore", 1, "修复河畔钓台", "fishing_dock")], reward: reward(16, 4) },
    { id: "c2_river_basket", chapter: 2, name: "河风里的提篮", npcId: "merchant", description: "钓两尾鱼，采一份溪畔薄荷。萝拉收一尾鱼和薄荷，替野餐桌备好木料。", target: { kind: "river", id: "fishing_dock", tileId: "t2_9" }, wants: { river_mint: 1 }, wantsCatch: 1,
      goals: [goal("fish", 2, "钓获鱼只"), goal("forage", 1, "采集溪畔薄荷", "river_mint")], reward: reward(24, 6, { wood: 6 }) },
    { id: "c2_picnic_table", chapter: 2, name: "多放几张椅子", npcId: "merchant", description: "修好野餐桌，找萝拉确认座位，再交两份胡萝卜试做点心。", target: { kind: "station", id: "picnic_table", tileId: "t10_10" }, wants: { carrot: 2 },
      goals: [goal("restore", 1, "修复野餐桌", "picnic_table"), goal("talk", 1, "和萝拉交谈", "merchant")], reward: reward(32, 8) },
    { id: "c3_good_neighbors", chapter: 3, name: "邻居都到齐", npcId: "elder", description: "照顾动物三次、完成两张订单，把两份小麦带给班伯。野餐前先把日常顾好。", target: { kind: "npc", id: "elder" }, wants: { wheat: 2 },
      goals: [goal("care", 3, "照顾动物"), goal("order", 2, "完成订单"), goal("talk", 1, "和班伯交谈", "elder")], reward: reward(40, 8, { wood: 4 }) },
    { id: "c3_garden", chapter: 3, name: "桌边的小花园", npcId: "child", description: "整理花园，烤胡萝卜饼、泡薄荷茶。图图想把第一朵小花压进笔记本。", target: { kind: "station", id: "garden", tileId: "t6_2" }, wants: {},
      goals: [goal("restore", 1, "整理花园", "garden"), goal("cook", 1, "烹调胡萝卜烤饼", "baked_carrot"), goal("cook", 1, "烹调溪畔薄荷茶", "mint_tea")], reward: reward(0, 8, {}, { collectible: "pressed_flower" }) },
    { id: "c3_harvest_picnic", chapter: 3, name: "把收获端上桌", npcId: "child", description: "找图图一起开饭。带一份麦饼、一份胡萝卜烤饼、一壶薄荷茶和两尾鱼，留张野餐合照。", target: { kind: "npc", id: "child" }, wants: {},
      wantsMeals: { rustic_bread: 1, baked_carrot: 1, mint_tea: 1 }, wantsCatch: 2,
      goals: [goal("talk", 1, "和图图交谈", "child"), goal("restore", 1, "修复河畔钓台", "fishing_dock"), goal("restore", 1, "修复野餐桌", "picnic_table"), goal("restore", 1, "整理花园", "garden")],
      reward: reward(24, 12, {}, { collectible: "picnic_memory", guestbook: true }) },
  ];

  function object(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
  function own(value, id) { return object(value) && Object.prototype.hasOwnProperty.call(value, id); }
  function qty(value, cap) { return Number.isFinite(value) && value > 0 ? Math.min(cap || COUNT_CAP, Math.floor(value)) : 0; }
  function credit(value, amount) { return Math.min(Number.MAX_SAFE_INTEGER, qty(value, Number.MAX_SAFE_INTEGER) + amount); }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function sum(values) { return Math.min(COUNT_CAP, Object.values(values || {}).reduce((n, v) => n + qty(v), 0)); }
  function at(state, now) {
    if (now === undefined) return Math.max(qty(state && state.lastSeenAt, Number.MAX_SAFE_INTEGER), qty(state && state.adventure && state.adventure.updatedAt, Number.MAX_SAFE_INTEGER));
    return Number.isSafeInteger(now) && now >= 0 ? now : null;
  }
  function fail(reason, message, extra) { return Object.assign({ ok: false, reason, message }, extra || {}); }
  function ok(message, extra) { return Object.assign({ ok: true, message }, extra || {}); }
  function itemName(id) {
    const def = (C.getItemDef && C.getItemDef(id)) || (C.MATERIALS || {})[id] || RECIPES.find((r) => r.id === id);
    return def ? def.name : id;
  }
  function cleanCounts(map, ids, cap) {
    const out = {};
    for (const id of ids) out[id] = qty(own(map, id) ? map[id] : 0, cap);
    return out;
  }
  function claimed(a, id) { return own(a.claimed, id) && a.claimed[id] === true; }
  function restored(a, id) { return !!(a.projects[id] && a.projects[id].restored); }

  // One-time lower bounds only: no invented repeated care/talk history or rewards.
  function backfill(state, a) {
    const s = object(state.stats) ? state.stats : {};
    const completed = (state.story && state.story.completed) || {};
    const harvest = object(s.harvested) ? sum(s.harvested) : qty(s.harvested);
    const floor = {
      plant: Math.max(qty(s.plantCount), (Array.isArray(state.plots) ? state.plots : []).filter((p) => p && p.cropId).length, completed.plant_wheat ? 1 : 0),
      water: Math.max(qty(s.waterCount), (Array.isArray(state.plots) ? state.plots : []).filter((p) => p && p.cropId && Number.isFinite(p.wateredAt) && p.wateredAt >= p.plantedAt).length, completed.first_water ? 1 : 0),
      harvest: Math.max(harvest, qty(s.totalHarvested)),
      order: qty(s.fulfilledOrders),
      forage: sum(Object.fromEntries(Object.keys(C.FORAGE_ITEMS || {}).map((id) => [id, s.collected && s.collected[id]]))),
      care: Math.max(qty(s.careCount), qty(s.animalCareCount), qty(s.cared), (Array.isArray(state.animals) ? state.animals : []).reduce((n, animal) => n + ["lastFedAt", "lastWateredAt", "lastGroomedAt"].filter((key) => animal && qty(animal[key], Number.MAX_SAFE_INTEGER) > 0).length, 0), completed.feed_care_animal ? 1 : 0),
    };
    for (const type of Object.keys(floor)) a.counts[type] = Math.max(a.counts[type], qty(floor[type]));
    for (const id of Object.keys(C.NPCS || {})) {
      if (state.story && state.story.dialogueSeen && state.story.dialogueSeen[id]) a.byTarget.talk[id] = Math.max(a.byTarget.talk[id] || 0, 1);
    }
    if (completed.learn_animal_care) a.byTarget.talk.elder = Math.max(a.byTarget.talk.elder || 0, 1);
    for (const id of Object.keys(C.FORAGE_ITEMS || {})) a.byTarget.forage[id] = Math.max(a.byTarget.forage[id] || 0, qty(s.collected && s.collected[id]));
    a.counts.talk = Math.max(a.counts.talk, sum(a.byTarget.talk));
    a.counts.fish = Math.max(a.counts.fish, sum(a.catch));
    a.counts.cook = Math.max(a.counts.cook, sum(a.meals));
    for (const r of RECIPES) a.byTarget.cook[r.id] = Math.max(a.byTarget.cook[r.id] || 0, a.meals[r.id]);
    for (const id of Object.keys(C.CROPS || {})) a.byTarget.harvest[id] = Math.max(a.byTarget.harvest[id] || 0, qty(s.harvested && s.harvested[id]));
    a.counts.restore = Math.max(a.counts.restore, PROJECTS.filter((p) => restored(a, p.id)).length);
    a.migrated = true;
  }
  function goalCount(a, g) {
    if (g.type === "restore" && g.id) return restored(a, g.id) ? 1 : 0;
    return g.id ? qty(a.byTarget[g.type] && a.byTarget[g.type][g.id]) : a.counts[g.type];
  }
  function requirements(state, wants, source) {
    const inventory = source === "meals" ? state.adventure.meals : source === "materials" ? state.materials : source === "coins" ? { coins: state.coins } : (state.storage && state.storage.items);
    return Object.entries(wants || {}).map(([id, required]) => {
      const current = qty(inventory && inventory[id], Number.MAX_SAFE_INTEGER);
      return { source, id, name: id === "coins" ? "金币" : itemName(id), current, required, complete: current >= required, consume: true };
    });
  }
  function questRequirements(state, q) {
    const rows = requirements(state, q.wants, "inventory").concat(requirements(state, q.wantsMeals, "meals"));
    if (q.wantsCatch) rows.push({ source: "catch", id: "any", name: "河鱼", current: sum(state.adventure.catch), required: q.wantsCatch, complete: sum(state.adventure.catch) >= q.wantsCatch, consume: true });
    return rows;
  }
  function costRequirements(state, cost) {
    return Object.entries(cost).flatMap(([id, required]) => requirements(state, { [id]: required }, id === "coins" ? "coins" : own(C.MATERIALS, id) ? "materials" : "inventory"));
  }
  function unlockedQuest(a, index) { return index === 0 || claimed(a, QUESTS[index - 1].id); }
  function sync(state, now) {
    const a = state.adventure;
    QUESTS.forEach((q, index) => {
      const rec = a.quests[q.id];
      if (claimed(a, q.id)) rec.status = "claimed";
      else if (!unlockedQuest(a, index)) rec.status = "locked";
      else if (rec.readyAt !== null || (q.goals.every((g) => goalCount(a, g) >= g.count) && questRequirements(state, q).every((r) => r.complete))) {
        rec.status = "ready";
        if (rec.readyAt === null) rec.readyAt = now;
      } else rec.status = "active";
    });
  }
  function ensure(state, now) {
    if (!object(state)) return fail("bad_state", "存档数据不完整。");
    now = at(state, now);
    if (now === null) return fail("bad_time", "时间数据无效。");
    if (!object(state.adventure)) state.adventure = {};
    const a = state.adventure;
    a.version = VERSION;
    a.createdAt = Number.isSafeInteger(a.createdAt) && a.createdAt >= 0 ? a.createdAt : now;
    a.updatedAt = Math.max(qty(a.updatedAt, Number.MAX_SAFE_INTEGER), now);
    a.counts = cleanCounts(a.counts, EVENTS);
    if (!object(a.byTarget)) a.byTarget = {};
    a.byTarget.talk = cleanCounts(a.byTarget.talk, Object.keys(C.NPCS || {}));
    a.byTarget.forage = cleanCounts(a.byTarget.forage, Object.keys(C.FORAGE_ITEMS || {}));
    a.byTarget.harvest = cleanCounts(a.byTarget.harvest, Object.keys(C.CROPS || {}));
    a.byTarget.cook = cleanCounts(a.byTarget.cook, RECIPES.map((r) => r.id));
    a.byTarget.restore = cleanCounts(a.byTarget.restore, PROJECTS.map((p) => p.id));
    a.meals = cleanCounts(a.meals, RECIPES.map((r) => r.id), MEAL_CAP);
    a.catch = cleanCounts(a.catch, FISH.map((f) => f.id), CATCH_CAP);
    let free = CATCH_CAP;
    for (const f of FISH) { a.catch[f.id] = Math.min(free, a.catch[f.id]); free -= a.catch[f.id]; }
    if (!object(a.collectibles)) a.collectibles = {};
    if (!object(a.unlocks)) a.unlocks = {};
    if (!object(a.claimed)) a.claimed = {};
    if (!object(a.quests)) a.quests = {};
    if (!object(a.projects)) a.projects = {};
    for (const p of PROJECTS) {
      const previous = object(a.projects[p.id]) ? a.projects[p.id] : {};
      a.projects[p.id] = Object.assign({}, previous, { restored: previous.restored === true || previous.status === "restored", restoredAt: Number.isSafeInteger(previous.restoredAt) && previous.restoredAt >= 0 ? previous.restoredAt : null });
    }
    for (const q of QUESTS) {
      const rec = object(a.quests[q.id]) ? a.quests[q.id] : {};
      if (rec.status === "claimed" || rec.rewardGranted === true) a.claimed[q.id] = true;
      rec.readyAt = Number.isSafeInteger(rec.readyAt) && rec.readyAt >= 0 ? rec.readyAt : rec.status === "ready" ? now : null;
      rec.claimedAt = Number.isSafeInteger(rec.claimedAt) && rec.claimedAt >= 0 ? rec.claimedAt : claimed(a, q.id) ? now : null;
      a.quests[q.id] = rec;
    }
    if (a.lastFishAt !== null && !(Number.isSafeInteger(a.lastFishAt) && a.lastFishAt >= 0)) a.lastFishAt = null;
    if (a.migrated !== true) backfill(state, a);
    if (restored(a, "fishing_dock") || claimed(a, "c1_first_meal")) a.unlocks.fishingRod = true;
    if (restored(a, "garden")) a.collectibles.pressed_flower = true;
    sync(state, now);
    return ok("冒险数据已就绪。", { adventure: a });
  }
  function record(state, event, now) {
    const e = typeof event === "string" ? { type: event } : event;
    if (!object(e) || !EVENTS.includes(e.type)) return fail("unknown_event", "没有这个冒险事件。");
    if (e.ok === false) return fail("failed_event", "未完成的行动不会计入任务。");
    const raw = e.count !== undefined ? e.count : e.qty !== undefined ? e.qty : e.added !== undefined ? e.added : 1;
    if (!Number.isSafeInteger(raw) || raw <= 0) return fail("bad_count", "事件数量必须是正整数。");
    const candidates = e.type === "talk" ? [e.npcId, e.id] : e.type === "cook" ? [e.recipeId, e.id] : e.type === "restore" ? [e.projectId, e.id] : [e.itemId, e.cropId, e.id];
    const id = candidates.find((value) => value !== undefined && value !== null);
    const allowed = e.type === "talk" ? Object.keys(C.NPCS || {}) : e.type === "cook" ? RECIPES.map((r) => r.id) : e.type === "restore" ? PROJECTS.map((p) => p.id) : e.type === "forage" ? Object.keys(C.FORAGE_ITEMS || {}) : ["plant", "water", "harvest"].includes(e.type) ? Object.keys(C.CROPS || {}) : e.type === "fish" ? FISH.map((f) => f.id) : null;
    if ((id !== undefined && allowed && (typeof id !== "string" || !allowed.includes(id))) || (e.type === "talk" && id === undefined)) return fail("unknown_target", "找不到事件对象。");
    const init = ensure(state, now); if (!init.ok) return init;
    const a = state.adventure;
    const count = Math.min(EVENT_CAP, raw);
    a.counts[e.type] = Math.min(COUNT_CAP, a.counts[e.type] + count);
    if (id && a.byTarget[e.type]) a.byTarget[e.type][id] = Math.min(COUNT_CAP, (a.byTarget[e.type][id] || 0) + count);
    sync(state, at(state, now));
    return ok("已记下这次行动。", { type: e.type, count, total: a.counts[e.type] });
  }
  function quests(state, now) {
    if (!ensure(state, now).ok) return [];
    const a = state.adventure;
    return QUESTS.map((q, index) => {
      const objectives = q.goals.map((g) => ({ type: g.type, id: g.id, name: g.name, current: goalCount(a, g), required: g.count, complete: goalCount(a, g) >= g.count, consume: false }));
      const needs = questRequirements(state, q);
      return Object.assign(copy(q), { chapterName: CHAPTERS[q.chapter - 1].name, previousId: index ? QUESTS[index - 1].id : null, nextId: QUESTS[index + 1] ? QUESTS[index + 1].id : null,
        status: a.quests[q.id].status, readyAt: a.quests[q.id].readyAt, claimedAt: a.quests[q.id].claimedAt, objectives, requirements: needs,
        canClaim: !claimed(a, q.id) && unlockedQuest(a, index) && objectives.every((g) => g.complete) && needs.every((r) => r.complete) });
    });
  }
  function consume(state, rows) {
    for (const r of rows) {
      if (r.source === "catch") {
        let left = r.required;
        for (const f of FISH) { const take = Math.min(left, state.adventure.catch[f.id]); state.adventure.catch[f.id] -= take; left -= take; }
      } else if (r.source === "coins") state.coins -= r.required;
      else {
        const map = r.source === "materials" ? state.materials : r.source === "meals" ? state.adventure.meals : state.storage.items;
        map[r.id] -= r.required;
        if (map[r.id] === 0 && r.source === "inventory") delete map[r.id];
      }
    }
  }
  function grant(state, r) {
    if (r.coins) {
      state.coins = credit(state.coins, r.coins);
      if (!object(state.stats)) state.stats = {};
      state.stats.totalCoinsEarned = credit(state.stats.totalCoinsEarned, r.coins);
    }
    if (r.xp) {
      state.xp = credit(state.xp, r.xp);
      state.level = Math.max(qty(state.level) || 1, C.levelFromXp(state.xp));
    }
    if (Object.keys(r.materials).length && !object(state.materials)) state.materials = {};
    for (const [id, count] of Object.entries(r.materials)) state.materials[id] = credit(state.materials[id], count);
    if (r.fishingRod) state.adventure.unlocks.fishingRod = true;
    if (r.collectible) state.adventure.collectibles[r.collectible] = true;
    if (r.guestbook) state.adventure.unlocks.gardenGuestbook = true;
  }
  function claim(state, id, now) {
    const index = QUESTS.findIndex((q) => q.id === id);
    if (index < 0) return fail("unknown_quest", "找不到这个任务。");
    const init = ensure(state, now); if (!init.ok) return init;
    const a = state.adventure; const q = QUESTS[index];
    if (claimed(a, id)) return fail("already_claimed", "这份奖励已经领过了。");
    if (!unlockedQuest(a, index)) return fail("locked", "先完成前一个任务。");
    if (!q.goals.every((g) => goalCount(a, g) >= g.count)) return fail("not_ready", "任务目标还没完成。");
    const rows = questRequirements(state, q);
    if (!rows.every((r) => r.complete)) return fail("missing_resources", "要交付的物品还没备齐。", { requirements: rows });
    consume(state, rows);
    a.claimed[id] = true;
    a.quests[id].status = "claimed";
    a.quests[id].rewardGranted = true;
    a.quests[id].claimedAt = at(state, now);
    grant(state, q.reward);
    sync(state, at(state, now));
    return ok("「" + q.name + "」完成了。", { id, reward: copy(q.reward), nextId: QUESTS[index + 1] ? QUESTS[index + 1].id : null });
  }
  function projects(state) {
    if (!ensure(state).ok) return [];
    return PROJECTS.map((p) => {
      const done = restored(state.adventure, p.id); const unlocked = claimed(state.adventure, p.unlockQuest);
      const rows = costRequirements(state, p.cost);
      return Object.assign(copy(p), { target: Object.assign({}, p.target, { tileId: (state.adventure.siteTiles || {})[p.id] || p.target.tileId }), status: done ? "restored" : unlocked ? "available" : "locked", restored: done, restoredAt: state.adventure.projects[p.id].restoredAt,
        requirements: rows, canRestore: !done && unlocked && rows.every((r) => r.complete) });
    });
  }
  function restore(state, id, now) {
    const p = PROJECTS.find((entry) => entry.id === id);
    if (!p) return fail("unknown_project", "找不到这个修复计划。");
    const init = ensure(state, now); if (!init.ok) return init;
    if (restored(state.adventure, id)) return fail("already_restored", "这里已经修好了。");
    if (!claimed(state.adventure, p.unlockQuest)) return fail("locked", "先完成前面的镇民任务。");
    const rows = costRequirements(state, p.cost);
    if (!rows.every((r) => r.complete)) return fail("missing_resources", "修复材料还没备齐。", { requirements: rows });
    consume(state, rows);
    state.adventure.projects[id] = { restored: true, restoredAt: at(state, now) };
    if (id === "fishing_dock") state.adventure.unlocks.fishingRod = true;
    if (id === "garden") state.adventure.collectibles.pressed_flower = true;
    record(state, { type: "restore", projectId: id }, now);
    return ok(p.name + "修好了。", { id, cost: copy(p.cost), unlocks: p.unlocks.slice() });
  }
  function recipeUnlocked(a, r) { return r.unlockQuest ? claimed(a, r.unlockQuest) : restored(a, r.unlockProject); }
  function recipes(state) {
    if (!ensure(state).ok) return [];
    return RECIPES.map((r) => {
      const unlocked = recipeUnlocked(state.adventure, r); const rows = requirements(state, r.ingredients, "inventory");
      return Object.assign(copy(r), { target: { kind: "station", id: "kitchen", tileId: "t10_10" }, status: unlocked ? "available" : "locked", unlocked, quantity: state.adventure.meals[r.id], output: { id: r.id, source: "meals", qty: 1 },
        requirements: rows, canCook: unlocked && state.adventure.meals[r.id] < MEAL_CAP && rows.every((need) => need.complete) });
    });
  }
  function cook(state, id, now) {
    const r = RECIPES.find((entry) => entry.id === id);
    if (!r) return fail("unknown_recipe", "找不到这道料理。");
    const init = ensure(state, now); if (!init.ok) return init;
    if (!recipeUnlocked(state.adventure, r)) return fail("locked", "这道料理还没解锁。");
    if (state.adventure.meals[id] >= MEAL_CAP) return fail("meals_full", "这道料理已经备得够多了。");
    const rows = requirements(state, r.ingredients, "inventory");
    if (!rows.every((need) => need.complete)) return fail("missing_resources", "料理食材还没备齐。", { requirements: rows });
    consume(state, rows);
    state.adventure.meals[id]++;
    record(state, { type: "cook", recipeId: id }, now);
    return ok(r.name + "做好了。", { meal: { id, name: r.name, qty: 1 }, quantity: state.adventure.meals[id], consumed: copy(r.ingredients) });
  }
  function fish(state, now, rng) {
    const init = ensure(state, now); if (!init.ok) return init;
    const a = state.adventure; now = at(state, now);
    if (!restored(a, "fishing_dock")) return fail("locked", "先修好河畔钓台。");
    const remainingMs = a.lastFishAt === null ? 0 : Math.max(0, FISH_COOLDOWN_MS - (now - a.lastFishAt));
    if (remainingMs > 0) return fail("cooldown", "鱼还没靠近，等一下再抛竿。", { remainingMs });
    if (sum(a.catch) >= CATCH_CAP) return fail("catch_full", "鱼篓满了，先把鱼交给镇民。");
    let pick, qualityRoll;
    try { const random = rng === undefined ? Math.random : rng; pick = random(); qualityRoll = random(); }
    catch (_) { return fail("bad_rng", "这次抛竿没有成功。"); }
    if (!Number.isFinite(pick) || !Number.isFinite(qualityRoll)) return fail("bad_rng", "这次抛竿没有成功。");
    const unit = (n) => Math.max(0, Math.min(1 - Number.EPSILON, n));
    const def = FISH[Math.floor(unit(pick) * FISH.length)];
    const quality = unit(qualityRoll) < 0.7 ? "normal" : unit(qualityRoll) < 0.95 ? "good" : "premium";
    a.catch[def.id]++;
    a.lastFishAt = now;
    record(state, { type: "fish" }, now);
    return ok("钓到了" + def.name + "。", { catch: { id: def.id, name: def.name, quality, qty: 1, caughtAt: now }, cooldownMs: FISH_COOLDOWN_MS, nextFishAt: now + FISH_COOLDOWN_MS });
  }
  function summary(state, now) {
    const init = ensure(state, now); if (!init.ok) return init;
    const a = state.adventure; const list = quests(state, now);
    const current = list.find((q) => q.status !== "claimed") || null;
    const chapters = CHAPTERS.map((c, i) => {
      const done = list.filter((q) => q.chapter === i + 1 && q.status === "claimed").length;
      return Object.assign({}, c, { number: i + 1, claimed: done, total: 3, status: done === 3 ? "complete" : current && current.chapter === i + 1 ? "active" : "locked" });
    });
    return ok(current ? "下一件事：" + current.name : "镇民已经到齐，野餐开始了。", { chapter: current ? current.chapter : 3, chapters, currentQuest: current, claimed: list.filter((q) => q.status === "claimed").length, total: 9, complete: current === null,
      counts: copy(a.counts), meals: copy(a.meals), catch: copy(a.catch),
      collectibles: Object.values(COLLECTIBLES).filter((entry) => a.collectibles[entry.id]).map(copy),
      unlocks: { kitchen: claimed(a, "c1_first_harvest"), fishing: restored(a, "fishing_dock"), fishingRod: a.unlocks.fishingRod === true, mealGifts: restored(a, "picnic_table"), gardenGuestbook: restored(a, "garden") && claimed(a, "c3_harvest_picnic") },
      fishing: { cooldownMs: FISH_COOLDOWN_MS, remainingMs: a.lastFishAt === null ? 0 : Math.max(0, FISH_COOLDOWN_MS - (at(state, now) - a.lastFishAt)), used: sum(a.catch), capacity: CATCH_CAP } });
  }
  function buyMaterial(state, id, count, now) {
    const prices = { wood: 6, stone: 8 };
    if (!own(prices, id) || !Number.isSafeInteger(count) || count < 1 || count > 10) return fail("bad_purchase", "找不到这笔建材订购。");
    const init = ensure(state, now); if (!init.ok) return init;
    const cost = prices[id] * count;
    if (!Number.isFinite(state.coins) || state.coins < cost) return fail("missing_resources", "金币不够，先交一张订单吧。");
    if (!object(state.materials)) state.materials = {};
    const previous = qty(state.materials[id], Number.MAX_SAFE_INTEGER);
    if (!Number.isSafeInteger(previous + count)) return fail("materials_full", "建材已经备得够多了。");
    state.coins -= cost; state.materials[id] = previous + count;
    return ok("买到 " + count + " 份" + itemName(id) + "。", { id, count, cost });
  }
  const COMMISSIONS = [
    { id: "river_market", name: "萝拉的河鲜篮", npcId: "merchant", wantsCatch: 2, reward: reward(18, 3) },
    { id: "elder_supper", name: "班伯的灶边晚餐", npcId: "elder", wantsCatch: 1, wantsMeals: { rustic_bread: 1 }, reward: reward(14, 3, { wood: 2 }) },
    { id: "child_tea", name: "图图的野餐茶", npcId: "child", wantsMeals: { mint_tea: 1 }, reward: reward(12, 3) },
  ];
  function commissions(state, now) {
    if (!ensure(state, now).ok) return [];
    const a = state.adventure;
    const cycle = Math.floor(at(state, now) / 300000);
    if (!object(a.commissions) || !Number.isSafeInteger(a.commissions.cycle) || a.commissions.cycle < cycle) a.commissions = { cycle, completed: [] };
    if (!Array.isArray(a.commissions.completed)) a.commissions.completed = [];
    return COMMISSIONS.map((c) => {
      const unlocked = restored(a, "fishing_dock") && (c.id !== "child_tea" || restored(a, "picnic_table"));
      const rows = questRequirements(state, c);
      const done = a.commissions.completed.includes(c.id);
      return Object.assign(copy(c), { unlocked, completed: done, requirements: rows, canClaim: unlocked && !done && rows.every((r) => r.complete), refreshAt: (a.commissions.cycle + 1) * 300000 });
    });
  }
  function deliverCommission(state, id, now) {
    if (!COMMISSIONS.some((c) => c.id === id)) return fail("unknown_commission", "找不到这份河畔委托。");
    const entry = commissions(state, now).find((c) => c.id === id);
    if (!entry) return fail("bad_state", "委托数据还没准备好。");
    if (!entry.unlocked) return fail("locked", "先修好河畔钓台和需要的餐桌。");
    if (entry.completed) return fail("already_claimed", "这批委托已经交付了，等下一批吧。");
    if (!entry.canClaim) return fail("missing_resources", "先把餐篮里的东西备齐。");
    consume(state, entry.requirements);
    state.adventure.commissions.completed.push(id);
    grant(state, entry.reward);
    record(state, "order", now);
    return ok(entry.name + "已送到。", { id, reward: entry.reward });
  }
  const AdventureAPI = { ensure, record, quests, claim, projects, restore, recipes, cook, fish, summary, buyMaterial, commissions, deliverCommission };
  if (typeof window !== "undefined") window.AdventureAPI = AdventureAPI;
  if (typeof module !== "undefined" && module.exports) module.exports = AdventureAPI;
})(typeof window !== "undefined" ? window : globalThis);
