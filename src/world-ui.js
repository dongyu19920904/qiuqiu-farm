/* World presentation and adventure integration; core rules stay DOM-free. */
(function () {
  "use strict";
  const A = window.AdventureAPI;
  if (!A) return;
  const sites = {
    fishing_dock: { tileId: "t2_9", sheet: "world_projects", frame: "fishing_dock", width: 1.65, visualYOffset: 1 },
    picnic_table: { tileId: "t10_10", sheet: "world_projects", frame: "picnic_table", width: 1.6 },
    garden: { tileId: "t6_2", sheet: "structures", frame: "flower_bed", width: 1.15 },
  };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const el = (id) => document.getElementById(id);
  const farm = () => window.__farm;
  let current = null, lastPanels = "", lastObjective = "", lastSites = "", lastFringe = "", lastTick = 0;
  let fishingRaf = 0, fishingPosition = 0, dialogueTimer = 0;
  const notify = (text) => { if (farm()) farm().toast(text); };
  const refresh = (s) => { current = s || current; if (!current) return; reconcile(current); renderObjective(current); renderPanels(); };
  const costText = (rows) => (rows || []).map((r) => `${esc(r.name)} ${Math.min(r.current, r.required)}/${r.required}`).join("・");
  const npcTile = (id) => current.map.tiles.find((t) => t.npc === id);
  const stationTile = (id) => current.map.tiles.find((t) => t.station === id);
  const homeTile = () => current.map.tiles.find((t) => t.structureId === "farmhouse");
  const siteTileId = (id) => (current.adventure.siteTiles || {})[id] || (window.WORLD_PROJECT_SITES || {})[id] || sites[id].tileId;

  // Record only successful mutations. Reading NPC dialogue is not a talk event.
  const hooks = {
    plant: (s, args, r) => ({ type: "plant", cropId: args[2] }),
    waterPlot: () => ({ type: "water" }),
    harvest: (s, args, r) => ({ type: "harvest", cropId: r.cropId, count: r.added }),
    fulfillOrder: () => ({ type: "order" }),
    gatherForage: (s, args, r) => {
      const node = (window.FORAGE_NODES || []).find((n) => n.id === args[1]);
      return { type: "forage", itemId: node && node.itemId, count: r.added };
    },
    feedAnimal: () => ({ type: "care" }), waterAnimal: () => ({ type: "care" }), groomAnimal: () => ({ type: "care" }),
  };
  Object.keys(hooks).forEach((name) => {
    const original = window[name]; if (typeof original !== "function") return;
    window[name] = function (...args) {
      A.ensure(args[0], Date.now());
      const result = original.apply(this, args);
      if (result && result.ok) A.record(args[0], hooks[name](args[0], args, result), Date.now());
      return result;
    };
  });

  function prepare(s) {
    current = s;
    A.ensure(s, Date.now());
    window.configureWorld(s);
    const standing = window.getTileById(s, s.player.tileId);
    if (standing && standing.adventureSite) {
      const free = s.map.tiles.filter((t) => window.isWalkable(s, t)).sort((a, b) => (Math.abs(a.x - standing.x) + Math.abs(a.y - standing.y)) - (Math.abs(b.x - standing.x) + Math.abs(b.y - standing.y)))[0];
      if (free) Object.assign(s.player, { tileId: free.id, x: free.x, y: free.y });
    }
    if (s.settings.worldEdition !== 75) {
      s.settings.mapViewMode = "natural";
      s.settings.smartAssistant = false;
      s.settings.worldEdition = 75;
    }
  }
  function reconcile(s) {
    A.ensure(s, Date.now());
    const counts = s.adventure.counts, stats = s.stats || {};
    const total = (map) => Object.values(map || {}).reduce((sum, n) => sum + (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0), 0);
    counts.plant = Math.max(counts.plant, stats.plantCount || 0);
    counts.harvest = Math.max(counts.harvest, total(stats.harvested));
    counts.order = Math.max(counts.order, stats.fulfilledOrders || 0);
    for (const id of Object.keys(window.FORAGE_ITEMS || {})) {
      s.adventure.byTarget.forage[id] = Math.max(s.adventure.byTarget.forage[id] || 0, (stats.collected || {})[id] || 0);
    }
    counts.forage = Math.max(counts.forage, total(s.adventure.byTarget.forage));
  }
  function rowsOf(q) { return (q.objectives || []).concat(q.requirements || []); }
  function targetFor(q) {
    if (!q) return null;
    if (q.canClaim) return npcTile(q.npcId);
    const row = rowsOf(q).find((r) => !r.complete);
    if (row) {
      if (row.type === "talk") return npcTile(row.id);
      if (row.type === "restore") return window.getTileById(current, siteTileId(row.id));
      if (row.type === "cook" || row.source === "meals") return homeTile();
      if (row.type === "fish" || row.source === "catch") return window.getTileById(current, siteTileId("fishing_dock"));
      if (row.type === "forage" || row.id === "river_mint") {
        if (!current.flags.bridgeRepaired) return window.bridgeMaterialTargetTile(current) || current.map.tiles.find((t) => t.bridge);
        const node = (window.FORAGE_NODES || []).find((n) => n.itemId === (row.id || "river_mint"));
        return node && current.map.tiles.find((t) => t.forage === node.id);
      }
      if (row.type === "order") return stationTile("order_board");
      if (row.type === "care") {
        const home = current.buildings.find((b) => b.id === (current.animals[0] || {}).homeId);
        return home && window.getTileById(current, home.tileId);
      }
      const cropId = row.consume && window.CROPS[row.id] ? row.id : "wheat";
      const active = window.activePlotCount(current);
      const plotTiles = current.map.tiles.filter((t) => t.plotIndex != null && t.plotIndex < active);
      if (row.type === "water") {
        const dryCrop = plotTiles.find((t) => window.canWaterPlot(current, t.plotIndex, Date.now()).ok);
        return dryCrop || plotTiles.find((t) => !current.plots[t.plotIndex].cropId)
          || plotTiles.find((t) => current.plots[t.plotIndex].cropId && window.getCropProgress(current, current.plots[t.plotIndex], Date.now()).ready)
          || null;
      }
      const tile = plotTiles.find((t) => {
        if (t.plotIndex == null || t.plotIndex >= active) return false;
        const p = current.plots[t.plotIndex];
        if (row.type === "plant") return !p.cropId;
        return p.cropId === cropId && window.getCropProgress(current, p, Date.now()).ready;
      }) || plotTiles.find((t) => !current.plots[t.plotIndex].cropId) || plotTiles[0];
      return tile;
    }
    return npcTile(q.npcId);
  }
  function renderObjective(s) {
    current = s;
    const box = el("questDock"); if (!box || !s) return false;
    const summary = A.summary(s, Date.now());
    const q = summary.currentQuest;
    const badge = el("storyBadge");
    if (badge) { badge.textContent = q && q.canClaim ? "!" : ""; badge.hidden = !(q && q.canClaim); }
    const unfinished = q && rowsOf(q).find((r) => !r.complete);
    const sig = JSON.stringify([q, summary.claimed]);
    if (sig === lastObjective) return true;
    lastObjective = sig;
    const step = q ? (unfinished ? `${unfinished.name} ${Math.min(unfinished.current, unfinished.required)}/${unfinished.required}` : "物品备齐，交给镇民") : "村民留下了野餐合照。继续经营你的农场。";
    const target = targetFor(q);
    box.dataset.quest = q ? q.id : "picnic_complete";
    box.dataset.targetId = target ? target.id : "";
    box.innerHTML = `<div class="world-chapter"><span>${q ? `第 ${q.chapter} 章・${esc(q.chapterName)}` : "收获野餐"}</span><span>${summary.claimed}/${summary.total}</span></div>
      <div class="world-objective-title">${q ? esc(q.name) : "农场又热闹起来了"}</div>
      <div class="world-objective-detail">${q ? esc(q.description) : "你留下的每一份收获，都有了去处。"}</div>
      <div class="world-objective-bottom"><span>${esc(step)}</span><button type="button" data-world-go>${q && q.canClaim ? "交付" : "前往"}</button></div>
      <div class="world-meter"><i style="width:${summary.claimed / summary.total * 100}%"></i></div>`;
    box.querySelector("[data-world-go]").onclick = () => q ? goQuest(q) : openKitchen();
    return true;
  }
  function openPanel(tab) {
    if (!farm()) return;
    farm().selectTab(tab);
    document.querySelector(".side-panel").classList.add("world-panel-open");
    renderPanels();
  }
  function closePanels() {
    const panel = document.querySelector(".side-panel");
    if (panel) panel.classList.remove("world-panel-open");
  }
  function renderPanels() {
    if (!current) return;
    const panel = el("adventurePanel"); if (!panel) return;
    const list = A.quests(current, Date.now());
    const projects = A.projects(current);
    const commissions = A.commissions(current, Date.now());
    const sig = JSON.stringify([list, projects, commissions]);
    if (sig !== lastPanels) {
      lastPanels = sig;
      panel.innerHTML = `<div class="adventure-quests">${list.map((q) => `<article class="adventure-quest ${q.status}" data-quest="${q.id}">
        <div class="world-chapter">第 ${q.chapter} 章・${esc(q.chapterName)} <span>${{ locked: "尚未开始", active: "进行中", ready: q.canClaim ? "可以交付" : "补齐物品", claimed: "已完成" }[q.status]}</span></div>
        <h3>${esc(q.name)}</h3><p>${esc(q.description)}</p>
        <div class="adventure-meta">${rowsOf(q).map((r) => `<span>${r.complete ? "✓" : "·"} ${esc(r.name)} ${Math.min(r.current, r.required)}/${r.required}</span>`).join("")}</div>
        ${q.status !== "claimed" && q.status !== "locked" ? `<div class="adventure-meta"><span>报酬 ${q.reward.coins} 金・${q.reward.xp} 经验</span></div><button data-quest-go="${q.id}">${q.canClaim ? "带去交付" : "前往目标"}</button>` : ""}</article>`).join("")}</div>
        <h3 class="pane-head">河畔委托</h3><p class="project-desc">市集每五分钟整理一批餐篮。多钓的鱼和料理，送给需要的邻居。</p>${commissions.map((c) => `<div class="adventure-quest"><h3>${esc(c.name)}</h3><p class="project-desc">${costText(c.requirements)}・报酬 ${c.reward.coins} 金${c.reward.materials.wood ? `・木料 ${c.reward.materials.wood}` : ""}</p><button data-commission="${c.id}" ${c.canClaim ? "" : "disabled"}>${c.completed ? "本批已送达" : c.unlocked ? c.canClaim ? "带去交付" : "餐篮未齐" : "修好钓台后开放"}</button></div>`).join("")}`;
      panel.querySelectorAll("[data-quest-go]").forEach((b) => { b.onclick = () => goQuest(list.find((q) => q.id === b.dataset.questGo)); });
      panel.querySelectorAll("[data-commission]").forEach((b) => { b.onclick = () => {
        closePanels();
        const c = commissions.find((entry) => entry.id === b.dataset.commission), tile = npcTile(c.npcId);
        if (!farm().travelAndDo(tile.id, "collect", () => { const r = A.deliverCommission(current, c.id, Date.now()); notify(r.message); if (r.ok) speak(window.NPCS[c.npcId].name, "东西收到了，下次也留一篮给我们吧。"); refresh(current); })) notify("先走完这段路，再去送餐篮。");
      }; });
    }
    const upgrades = el("buildingUpgrades");
    if (upgrades && !el("worldProjectsButton")) {
      const b = document.createElement("button"); b.id = "worldProjectsButton"; b.className = "btn buy"; b.textContent = "河畔复兴计划"; b.onclick = () => openProjects(); upgrades.before(b);
    }
    document.querySelectorAll(".side-body .pane-head").forEach((h) => {
      if (h.querySelector(".world-close")) return;
      const b = document.createElement("button"); b.className = "world-close"; b.textContent = "×"; b.title = "关闭菜单"; b.setAttribute("aria-label", "关闭菜单"); b.onclick = closePanels; h.prepend(b);
    });
  }
  function goQuest(q) {
    closePanels();
    if (!farm() || farm().moving()) { notify("先走完这段路，再接着做。"); return; }
    if (q.canClaim) { claimQuest(q); return; }
    const row = rowsOf(q).find((r) => !r.complete);
    if (row && row.type === "restore") { visitSite(row.id); return; }
    if (row && (row.type === "cook" || row.source === "meals")) { visitKitchen(); return; }
    if (row && (row.type === "fish" || row.source === "catch")) { visitSite("fishing_dock"); return; }
    if (row && row.type === "care") { visitAnimals(); return; }
    const target = targetFor(q);
    if (!target) { notify(row && row.type === "water" ? "这批作物都浇过了，等成熟后收成，再种一格来浇水。" : "先到田边准备下一批收获。"); return; }
    if (row && row.type === "water") {
      const plot = current.plots[target.plotIndex];
      const ready = plot.cropId && window.getCropProgress(current, plot, Date.now()).ready;
      if (!window.canWaterPlot(current, target.plotIndex, Date.now()).ok) {
        farm().setTool("hand");
        if (!plot.cropId && farm().selectSeed) farm().selectSeed("wheat");
        notify(ready ? "这株已成熟，先收成，再种一格来浇水。" : "先种下小麦，下一步再替它浇水。");
      } else farm().setTool("water");
    }
    else if (target.object) farm().setTool("clear");
    else farm().setTool("hand");
    if (row && row.consume && window.CROPS[row.id] && farm().selectSeed) farm().selectSeed(row.id);
    farm().clickTile(target.id);
  }
  function claimQuest(q) {
    const target = npcTile(q.npcId);
    if (!target) return;
    const started = farm().travelAndDo(target.id, "use", () => {
      const result = A.claim(current, q.id, Date.now());
      notify(result.message);
      if (result.ok) {
        speak((window.NPCS[q.npcId] || {}).name || "镇民", completionLine(q.id));
        if (q.id === "c3_harvest_picnic") showPicnic();
        refresh(current);
      }
    });
    if (!started) notify("现在走不到那里，先把路清出来。");
  }
  function completionLine(id) {
    const lines = {
      c1_homecoming: "门口终于有新苗了。这些木料你先收着，等河边的钓台修好，咱们再坐下来聊。",
      c1_first_harvest: "别只顾着把作物卖掉，留点小麦做自己的晚餐。农舍的灶台还能用。",
      c1_first_meal: "这块饼有你祖母的味道。鱼竿和剩下的木料拿去吧，河边一直在等人。",
      c2_fishing_dock: "踏板踩起来稳了。河里的鱼怕急，等浮标靠近绿色那段再提竿。",
      c2_river_basket: "鱼很新鲜，薄荷也香。我把木料备好了，河边再多放张桌子，就能招待大家。",
      c2_picnic_table: "座位我来安排。你去看看动物，接两张订单，野餐的事慢慢准备。",
      c3_good_neighbors: "鸡吃饱了，客人的货也交了。桌边缺点颜色，这些木料留给小花园。",
      c3_garden: "我把花压进本子了！还差你的点心和鱼，大家就能坐下来吃饭了。",
      c3_harvest_picnic: "以前这里好安静，现在每个人都有想带来的东西。这张合照，挂在农场吧！",
    };
    return lines[id] || "下次有收获，也记得来找我们。";
  }
  function speak(name, text) {
    clearTimeout(dialogueTimer);
    let box = el("worldDialogue");
    if (!box) { box = document.createElement("div"); box.id = "worldDialogue"; box.className = "world-dialogue"; box.setAttribute("role", "status"); document.body.appendChild(box); }
    box.innerHTML = `<button aria-label="关闭对话" title="关闭对话">×</button><b>${esc(name)}</b><p>${esc(text)}</p>`;
    box.hidden = false; box.querySelector("button").onclick = () => { box.hidden = true; };
    dialogueTimer = setTimeout(() => { box.hidden = true; }, 10000);
  }
  function modal(title, body) {
    closePanels();
    stopFishing();
    let box = el("worldModal");
    if (!box) { box = document.createElement("div"); box.id = "worldModal"; box.className = "modal world-modal"; box.setAttribute("aria-labelledby", "worldModalTitle"); document.body.appendChild(box); }
    box.innerHTML = `<div class="modal-card"><button class="world-modal-close" aria-label="关闭" title="关闭">×</button><h2 id="worldModalTitle">${esc(title)}</h2><div class="modal-body">${body}</div></div>`;
    box.querySelector(".world-modal-close").onclick = () => { stopFishing(); farm().closeModal("worldModal"); };
    farm().openModal("worldModal", ".world-modal-close");
    return box;
  }
  function visitSite(id) {
    const site = sites[id]; if (!site || !farm()) return;
    const started = farm().travelAndDo(siteTileId(id), "collect", () => {
      if (id === "fishing_dock" && A.projects(current).find((p) => p.id === id).restored) openFishing();
      else if (id === "picnic_table" && A.projects(current).find((p) => p.id === id).restored) openKitchen();
      else if (id === "garden" && A.summary(current, Date.now()).complete) openGuestbook();
      else openProjects(id);
    });
    if (!started) notify("等这段路走完，再靠近这里。");
  }
  function openProjects(selectedId) {
    const projects = A.projects(current);
    const selected = selectedId ? projects.filter((p) => p.id === selectedId) : projects;
    const box = modal("河畔复兴", selected.map((p) => `<div class="project-row" data-project="${p.id}"><h3>${esc(p.name)}</h3><p class="project-desc">${esc(p.description)}</p>
      <div class="project-cost">${costText(p.requirements)}</div>
      ${p.restored ? `<span>已修复</span>${p.id === "garden" ? "<p class='project-desc'>河畔压花已收进纪念册。</p>" : ""}` : `<button data-restore="${p.id}" ${p.canRestore ? "" : "disabled"}>${p.status === "locked" ? "先完成镇民任务" : p.canRestore ? "走过去修复" : "材料未齐"}</button>`}</div>`).join(""));
    box.querySelectorAll("[data-restore]").forEach((b) => { b.onclick = () => {
      farm().closeModal("worldModal");
      const started = farm().travelAndDo(siteTileId(b.dataset.restore), "hoe", () => {
        const r = A.restore(current, b.dataset.restore, Date.now()); notify(r.message); refresh(current); lastSites = ""; farm().paintMap();
      });
      if (!started) notify("先停下脚步，再开始修复。");
    }; });
  }
  function visitKitchen() {
    const target = homeTile();
    if (!farm().travelAndDo(target.id, "collect", openKitchen)) notify("先走完这段路，再回农舍。");
  }
  function visitAnimals() {
    const animal = current.animals[0];
    if (!animal) { notify("先在鸡舍迎接一只动物。"); return; }
    const home = current.buildings.find((b) => b.id === animal.homeId);
    if (!home || !farm().travelAndDo(home.tileId, "collect", () => {
      const box = modal("照顾农场的伙伴", `<p class="project-desc">${esc((window.ANIMALS[animal.type] || {}).name || "动物")}在鸡舍前等你。喂食、添水和梳理，都会留下照护纪录。</p><div class="recipe-row"><button data-care="feed">喂食</button> <button data-care="water">添水</button> <button data-care="groom">梳理</button></div>`);
      box.querySelectorAll("[data-care]").forEach((b) => { b.onclick = () => { farm().closeModal("worldModal"); farm().careAnimal(animal.id, b.dataset.care); }; });
    })) notify("先走完这段路，再到鸡舍。");
  }
  function openKitchen() {
    const recipes = A.recipes(current);
    const box = modal("农舍灶台", `<p class="project-desc">班伯的食谱放在灶边。料理留在餐篮里，交给镇民时才会取用。</p>` + recipes.map((r) => `<div class="recipe-row" data-recipe="${r.id}"><h3>${esc(r.name)} <small>餐篮 ${r.quantity}</small></h3><p class="project-desc">${esc(r.description)}</p><div class="project-cost">${costText(r.requirements)}</div><button data-cook="${r.id}" ${r.canCook ? "" : "disabled"}>${r.unlocked ? r.canCook ? "烹调一份" : "食材未齐" : "等班伯教你"}</button></div>`).join(""));
    box.querySelectorAll("[data-cook]").forEach((b) => { b.onclick = () => {
      farm().closeModal("worldModal");
      const target = homeTile();
      if (!farm().travelAndDo(target.id, "collect", () => { const r = A.cook(current, b.dataset.cook, Date.now()); notify(r.message); refresh(current); openKitchen(); })) notify("先走完这段路，再烹调。");
    }; });
  }
  function openMarket() {
    const items = Object.entries(current.storage.items).filter(([, qty]) => qty > 0);
    const q = A.summary(current, Date.now()).currentQuest;
    const needs = (q && q.requirements) || [];
    const box = modal("萝拉的市集", `<p class="project-desc">先留好镇民要的物品。缺建材时，也可以用收成换木料和石材。</p>
      ${items.map(([id, qty]) => {
        const def = window.getItemDef(id), reserved = needs.filter((r) => r.id === id).reduce((n, r) => n + r.required, 0);
        const sale = Math.max(0, qty - reserved);
        return `<div class="recipe-row"><h3>${esc(def ? def.name : id)}・${qty} 份</h3><p class="project-desc">${reserved ? `替目前委托保留 ${reserved} 份。` : "没有目前委托预留。"}</p><button data-sell="${esc(id)}" ${sale > 0 ? "" : "disabled"}>出售多余 ${sale} 份</button></div>`;
      }).join("") || '<p class="project-desc">篮子是空的。下一批作物收好再来。</p>'}
      <div class="recipe-row"><h3>建材行</h3><label class="project-desc" for="worldMaterialQty">数量 <select id="worldMaterialQty"><option value="1">1 份</option><option value="5">5 份</option><option value="10">10 份</option></select></label><br><button data-buy-material="wood">木料 1 份・6 金</button> <button data-buy-material="stone">石材 1 份・8 金</button></div>`);
    const atMarket = (effect) => {
      farm().closeModal("worldModal");
      const tile = current.map.tiles.find((t) => t.structureId === "shop");
      if (!farm().travelAndDo(tile.id, "collect", () => { effect(); refresh(current); openMarket(); })) notify("先走完这段路，再交易。");
    };
    box.querySelectorAll("[data-sell]").forEach((b) => { b.onclick = () => atMarket(() => {
      const id = b.dataset.sell, active = A.summary(current, Date.now()).currentQuest;
      const reserved = ((active && active.requirements) || []).filter((r) => r.id === id).reduce((n, r) => n + r.required, 0);
      const qty = Math.max(0, (current.storage.items[id] || 0) - reserved);
      const r = window.sellItem(current, id, qty, Date.now()); notify(r.coins ? `交易完成，收到 ${r.coins} 金。` : "先把这些留给镇民。");
    }); });
    box.querySelector("#worldMaterialQty").onchange = () => {
      const count = Number(box.querySelector("#worldMaterialQty").value);
      box.querySelectorAll("[data-buy-material]").forEach((b) => { const wood = b.dataset.buyMaterial === "wood"; b.textContent = `${wood ? "木料" : "石材"} ${count} 份・${count * (wood ? 6 : 8)} 金`; });
    };
    box.querySelectorAll("[data-buy-material]").forEach((b) => { b.onclick = () => { const count = Number(box.querySelector("#worldMaterialQty").value); atMarket(() => { const r = A.buyMaterial(current, b.dataset.buyMaterial, count, Date.now()); notify(r.message); }); }; });
  }
  function openSeedBag() {
    const crops = Object.values(window.CROPS);
    const box = modal("种子袋", `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${crops.map((crop) => `<button class="btn ghost" data-world-seed="${crop.id}" ${window.isCropUnlocked(current, crop.id) ? "" : "disabled"} style="min-height:80px;padding:6px;white-space:normal"><span class="ui-icon i-crop-${crop.id.replace(/_/g, "-")}" aria-hidden="true"></span><br>${esc(crop.name)}<br><small>${window.isCropUnlocked(current, crop.id) ? `${crop.seedCost} 金` : `Lv ${crop.unlockLevel}`}</small></button>`).join("")}</div>`);
    box.querySelectorAll("[data-world-seed]").forEach((b) => { b.onclick = () => { farm().selectSeed(b.dataset.worldSeed); farm().closeModal("worldModal"); }; });
  }
  function stopFishing() { if (fishingRaf) cancelAnimationFrame(fishingRaf); fishingRaf = 0; }
  function arrangePicnic(s) {
    if (!s.adventure.claimed.c3_harvest_picnic) return;
    window.configureWorld(s);
  }
  function showPicnic() {
    arrangePicnic(current);
    const box = modal("这次，大家都回来了", '<p class="project-desc">午后，葛瑞收起了告示，萝拉带来餐篮，班伯让鸡舍安静下来。图图把压好的小花放在桌边。</p><p class="project-desc">你种的麦子、河里的鱼和溪边的薄荷，现在都成了大家的第一顿野餐。</p><button class="btn buy" id="worldPicnicGo">到河畔找大家</button>');
    box.querySelector("#worldPicnicGo").onclick = () => { farm().closeModal("worldModal"); farm().setTool("hand"); farm().clickTile("t10_9"); };
  }
  function openGuestbook() {
    const box = modal("河畔留言本", `<p class="project-desc">镇民留了张合照。也替这座农场写下一句话吧。</p><label class="project-desc" for="worldNote">留给下一个收获日</label><input id="worldNote" maxlength="100" value="${esc(current.adventure.note || "")}" style="display:block;width:100%;padding:12px;margin:12px 0;border:1px solid #b7cdb9;border-radius:4px"><button class="btn buy" id="worldNoteSave">留下这句话</button>`);
    box.querySelector("#worldNoteSave").onclick = () => { current.adventure.note = box.querySelector("#worldNote").value.trim().slice(0, 100); farm().safeSaveNow(); farm().closeModal("worldModal"); notify("留言留在花园里了。"); };
  }
  function openFishing() {
    const s = A.summary(current, Date.now());
    const wait = s.fishing.remainingMs;
    const box = modal("河畔钓台", `<p class="project-desc">河面平静，浮标正在漂。等它进到绿色水域，再提竿。</p><div class="world-fishing-meter"><div class="world-fishing-zone"></div><div class="world-fishing-needle"></div></div><div class="world-fishing-result" role="status">${wait > 0 ? `鱼群还在散开，${Math.ceil(wait / 1000)} 秒后再来。` : "有鱼靠近了。"}</div><button class="btn buy" id="worldCatch" ${wait > 0 ? "disabled" : ""}>提竿</button><p class="project-cost">鱼篓 ${s.fishing.used}/${s.fishing.capacity}</p>`);
    if (wait > 0) return;
    const start = performance.now();
    function animate(t) {
      if (!box.classList.contains("show")) { stopFishing(); return; }
      fishingPosition = (Math.sin((t - start) / 440 - Math.PI / 2) + 1) / 2;
      const needle = box.querySelector(".world-fishing-needle");
      if (!needle) { stopFishing(); return; }
      needle.style.left = `calc(${fishingPosition * 100}% - 2px)`;
      fishingRaf = requestAnimationFrame(animate);
    }
    fishingRaf = requestAnimationFrame(animate);
    box.querySelector("#worldCatch").onclick = () => {
      const resultBox = box.querySelector(".world-fishing-result");
      if (fishingPosition < .36 || fishingPosition > .64) { resultBox.textContent = "鱼溜走了。沉住气，再等下一次靠近。"; return; }
      const r = A.fish(current, Date.now(), Math.random);
      resultBox.textContent = r.message;
      if (r.ok) { stopFishing(); box.querySelector("#worldCatch").disabled = true; resultBox.textContent += " 放进鱼篓，留给萝拉或野餐。"; notify(r.message); refresh(current); farm().safeSaveNow(); }
    };
  }
  function paintWorld(s, tileSize, t) {
    current = s;
    const world = el("mapWorld"); if (!world || !window.Atlas.isReady()) return;
    paintFringe(s, tileSize, world);
    const projects = A.projects(s);
    const sig = `${tileSize}|` + projects.map((p) => p.status + "@" + siteTileId(p.id)).join("|");
    if (sig !== lastSites || !world.querySelector(".world-site")) {
      lastSites = sig;
      world.querySelectorAll(".world-site").forEach((node) => node.remove());
      projects.forEach((p) => {
        const spec = sites[p.id], tile = window.getTileById(s, siteTileId(p.id));
        const frame = spec.sheet === "world_projects" ? spec.frame + (p.restored ? "_repaired" : "_broken") : spec.frame;
        const f = window.Atlas.getFrame(spec.sheet, frame); if (!f || !tile) return;
        const b = document.createElement("button"); b.type = "button"; b.className = "world-site" + (p.restored ? "" : " unrestored");
        b.dataset.kind = "world-project"; b.dataset.projectId = p.id; b.dataset.tileId = tile.id; b.dataset.restored = String(p.restored);
        b.dataset.sheet = spec.sheet; b.dataset.frame = frame;
        if (spec.sheet === "world_projects") b.classList.add("purpose-built");
        const w = tileSize * spec.width, h = w * f.h / f.w, baseline = (tile.y + .85 + (spec.visualYOffset || 0)) * tileSize;
        const anchor = f.anchor || [.5, 1];
        b.style.cssText = `left:${(tile.x + .5) * tileSize - w * anchor[0]}px;top:${baseline - h * anchor[1]}px;width:${w}px;height:${h}px;z-index:${Math.round(baseline)};`;
        Object.assign(b.style, window.Atlas.frameStyleFor(spec.sheet, frame, w, h));
        b.setAttribute("aria-label", p.name + (p.restored ? "，使用" : "，修复计划"));
        b.innerHTML = `<span class="world-site-label">${esc(p.name)}${p.restored ? "" : "・待修"}</span>${p.canRestore ? '<span class="world-marker"></span>' : ""}`;
        b.onclick = (event) => { event.stopPropagation(); visitSite(p.id); }; world.appendChild(b);
      });
    }
    paintMinimap(s, tileSize);
    const location = s.player.x >= 17 ? "东林・溪畔采集地" : s.player.y >= 9 ? "河畔・复兴计划" : "秋秋农场・祖母的田";
    if (el("worldLocation").textContent !== location) el("worldLocation").textContent = location;
  }
  function paintFringe(s, size, world) {
    const sig = `${size}|${s.map.width}|${s.map.height}`;
    if (sig === lastFringe) return;
    lastFringe = sig;
    let layer = el("worldFringe");
    if (!layer) { layer = document.createElement("div"); layer.id = "worldFringe"; layer.setAttribute("aria-hidden", "true"); world.prepend(layer); }
    layer.innerHTML = "";
    for (let y = -6; y < s.map.height + 6; y++) for (let x = -6; x < s.map.width + 6; x++) {
      if (x >= 0 && x < s.map.width && y >= 0 && y < s.map.height) continue;
      const node = document.createElement("div"); node.className = "world-fringe-tile";
      node.style.cssText = `left:${x * size}px;top:${y * size}px;width:${size}px;height:${size}px;`;
      const frame = "grass_center_0" + (1 + Math.abs((x * 13 + y * 17) % 4));
      Object.assign(node.style, window.Atlas.frameStyleFor("terrain", frame, size, size));
      layer.appendChild(node);
    }
  }
  function paintMinimap(s, size) {
    const button = el("worldMinimap"); if (!button) return;
    const canvas = button.querySelector("canvas"), ctx = canvas.getContext("2d"); if (!ctx) return;
    const colors = { grass: "#89ae60", soil: "#b98d56", path: "#e0c88c", water: "#6baabe" };
    ctx.clearRect(0, 0, 220, 120);
    s.map.tiles.forEach((tile) => { ctx.fillStyle = tile.region === "east" && !s.flags.bridgeRepaired ? "#516f45" : colors[tile.terrain] || "#89ae60"; ctx.fillRect(tile.x * 10, tile.y * 10, 10, 10); });
    s.map.tiles.filter((tile) => tile.structureId || tile.npc).forEach((tile) => { ctx.fillStyle = tile.npc ? "#eed793" : "#885253"; ctx.fillRect(tile.x * 10 + 2, tile.y * 10 + 2, 6, 6); });
    const scene = el("mapScene");
    ctx.strokeStyle = "rgba(255,255,235,.55)"; ctx.lineWidth = 1;
    ctx.strokeRect(-s.camera.x / size * 10, -s.camera.y / size * 10, scene.clientWidth / size * 10, scene.clientHeight / size * 10);
    ctx.fillStyle = "#fff5b2"; ctx.fillRect(s.player.x * 10 + 2, s.player.y * 10 + 2, 6, 6);
    button.onclick = (e) => { const r = canvas.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / r.width * s.map.width), y = Math.floor((e.clientY - r.top) / r.height * s.map.height); const tile = window.getTileXY(s, x, y); if (tile) { farm().setTool("hand"); farm().clickTile(tile.id); } };
  }
  function tick(s, t) {
    if (t - lastTick < 750) return;
    lastTick = t; current = s;
    reconcile(s);
    arrangePicnic(s);
    const header = document.querySelector("header");
    const portrait = window.innerWidth <= 859 && window.innerHeight > 500;
    if (portrait && header) document.documentElement.style.setProperty("--world-quest-top", Math.max(112, Math.ceil(header.getBoundingClientRect().bottom) + 12) + "px");
    if (window.innerWidth > 859 && header) document.documentElement.style.setProperty("--world-system-top", Math.max(78, Math.ceil(header.getBoundingClientRect().bottom) + 12) + "px");
    renderObjective(s);
    if (document.querySelector(".world-panel-open")) renderPanels();
    if (fishingRaf && !document.querySelector("#worldModal.show")) stopFishing();
  }
  function welcome(s, offline) {
    current = s;
    if (!s.adventure.welcomeSeen) {
      const box = modal("祖母把钥匙留给了你", '<p class="project-desc">「田荒了可以再种，河边的老桌子倒了可以再修。只要有人愿意回来，这里就还是一座农场。」</p><p class="project-desc">葛瑞在屋前等你。先跟他打声招呼，再替田里种下第一批小麦。</p><button class="btn buy" id="worldBegin">把农场接回来</button>');
      const finish = () => { s.adventure.welcomeSeen = true; farm().closeModal("worldModal"); farm().safeSaveNow(); };
      box.querySelector("#worldBegin").onclick = finish;
      box.querySelector(".world-modal-close").onclick = finish;
    } else if (offline && offline.offlineMs >= 300000 && s.settings.offlineSummary !== false) {
      notify(`你离开时，农场仍在生长。离线收益 ${offline.coins || 0} 金，成熟作物等你回来。`);
    }
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closePanels(); stopFishing(); }
    if ((e.key === "e" || e.key === "E") && farm() && !document.querySelector(".modal.show") && !/input|textarea|select/i.test((e.target || {}).tagName || "")) { el("actionA").click(); e.preventDefault(); }
  });
  document.addEventListener("DOMContentLoaded", () => {
    let dismissMapClick = false;
    document.addEventListener("pointerdown", (event) => {
      if (!document.querySelector(".world-panel-open") || document.querySelector(".modal.show")) return;
      if (!event.target.closest("#mapScene") || event.target.closest(".seed-hud, .mobile-controls, .scene-action-bar, #mapFitToggle, #worldMinimap")) return;
      closePanels(); dismissMapClick = true; event.preventDefault(); event.stopImmediatePropagation();
    }, true);
    document.addEventListener("click", (event) => {
      if (!dismissMapClick) return;
      dismissMapClick = false;
      if (event.target.closest("#mapScene")) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".side-panel, .world-dialogue, #questDock, .modal") && !document.querySelector(".modal.show")) closePanels();
    });
    const title = document.querySelector("[data-tab='tile']"); if (title) title.setAttribute("title", "选取目标信息");
    ["settingsBtn", "howToBtn", "genderToggle"].forEach((id) => { const b = el(id); if (b && !b.title) b.title = b.textContent.trim(); });
  });
  function markerTile(s) {
    current = s;
    const q = A.summary(s, Date.now()).currentQuest;
    const tile = targetFor(q);
    return tile ? tile.id : null;
  }
  function dialogue(npcId, fallback) {
    const q = A.summary(current, Date.now()).currentQuest;
    if (q && q.npcId === npcId) return q.canClaim ? "东西都备好了？我在这里等你，带来一起看看吧。" : q.description;
    if (npcId === "child") return current.adventure.claimed.c3_harvest_picnic ? "我把野餐合照收好了。下次再带你新种的东西来！" : "河边要是有桌子，我想带小花和点心来。你也会来吗？";
    if (npcId === "merchant") return "新鲜作物可以交订单。留一点给自己的餐篮，河边很快会需要它们。";
    if (npcId === "elder") return "下田时别忘了鸡舍。添水、梳毛、喂食，牠们都记得你。";
    return fallback;
  }
  window.FarmWorld = { prepare, refresh, tick, renderObjective, renderPanels, paintWorld, welcome, openKitchen, openMarket, openSeedBag, openProjects, visitSite, speak, openPanel, markerTile, dialogue };
})();
