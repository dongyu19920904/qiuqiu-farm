"use strict";
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), http = require("node:http");
const { chromium } = require("playwright");
const S = require("../src/state.js"), C = require("../src/config.js");
const ROOT = path.resolve(__dirname, ".."), EVIDENCE = path.join(ROOT, "docs/evidence/qiuqiu");
async function main() {
  const server = http.createServer((req, res) => {
    // Exercise project Pages subdirectory paths, including version queries.
    const url = new URL(req.url, "http://localhost");
    const rel = url.pathname.replace(/^\/qiuqiu-farm\//, "");
    const file = path.resolve(ROOT, rel || "index.html");
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json" };
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" }); fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const base = process.env.FARM_URL || `http://127.0.0.1:${server.address().port}/qiuqiu-farm/`;
  const browser = await chromium.launch();
  fs.mkdirSync(EVIDENCE, { recursive: true });
  try {
    for (const device of [{name:"desktop",width:1440,height:900},{name:"mobile",width:390,height:844},{name:"small",width:320,height:568}]) {
      const mobile = device.name !== "desktop";
      const context = await browser.newContext({viewport:{width:device.width,height:device.height},isMobile:mobile,hasTouch:mobile,serviceWorkers:"block"});
      try {
        const seed = S.defaultState(Date.now()); seed.level=3; seed.xp=C.xpForLevel(3); seed.coins=300; seed.storage.items.wheat=15; seed.tutorialDone=true;
        // An existing Traditional Chinese save must display in Simplified Chinese without changing its history.
        seed.story.dialogueLog=[{name:"鎮長",line:"農場重新開張，謝謝你照顧動物。"}];
        await context.addInitScript(({key,seed}) => { if (!sessionStorage.getItem("qiuqiu-fixture")) { localStorage.setItem(key,JSON.stringify(seed));sessionStorage.setItem("qiuqiu-fixture","1"); } }, {key:C.GAME.saveKey,seed});
        const page = await context.newPage(), errors=[], missing=[];
        page.on("pageerror",e=>errors.push(e.message)); page.on("response",r=>{if(r.status()>=400)missing.push(r.url());});
        await page.goto(base); await page.waitForFunction(()=>window.__farm&&window.Atlas?.isReady()&&!document.querySelector("#startupLoading"));
        assert.match(await page.title(), /秋秋农场/);
        const begin = page.locator("#worldBegin"); await begin.waitFor({state:"visible"}); await begin.click();
        const close = page.locator("#worldDialogue:not([hidden]) button"); if(await close.isVisible())await close.click();
        assert.equal(await page.locator("html").getAttribute("lang"),"zh-Hans");
        await page.evaluate(()=>__farm.refresh());
        assert.match(await page.locator("#storyPanel").textContent(),/镇长/);
        assert.match(await page.locator("#storyPanel").textContent(),/农场重新开张，谢谢你照顾动物。/);
        assert.equal(await page.evaluate(()=>__farm.state().story.dialogueLog[0].name),"鎮長");
        await page.locator("#settingsBtn").click();
        assert.match(await page.locator("#settingsModal").innerText(),/导出存档/);
        assert.match(await page.locator("#settingsModal").innerText(),/离线/);
        await page.locator("#settingsOk").click();
        const barn=await page.evaluate(()=>__farm.state().buildings.find(b=>b.type==="barn"));
        await page.evaluate((tile)=>__farm.focusTile(tile),barn.tileId);
        const click=async locator=>mobile?locator.tap():locator.click();
        await click(page.locator(`.ob[data-structure-id="${barn.structureId}"]`).first());
        await click(page.locator('#objectBubble [data-action="animals"]'));
        await click(page.locator('.abuy[data-type="hedgehog"]'));
        await click(page.locator('.abuy[data-type="pig"]'));
        const ids=await page.evaluate(()=>__farm.state().animals.filter(a=>a.type==="hedgehog"||a.type==="pig").map(a=>({id:a.id,type:a.type,adoptedAt:a.adoptedAt})));
        assert.equal(ids.length,2);
        const h=ids.find(a=>a.type==="hedgehog"), p=ids.find(a=>a.type==="pig");
        assert.equal(await page.locator('.abuy[data-type="hedgehog"]').count(),0);
        await click(page.locator(`.afeed[data-id="${h.id}"]`));
        await click(page.locator(`.agroom[data-id="${h.id}"]`));
        await click(page.locator(`.awater[data-id="${h.id}"]`));
        assert.ok(await page.evaluate(id=>__farm.state().animals.find(a=>a.id===id).affinity,h.id));
        assert.match(await page.locator("#tileContext").innerText(),/抚摸/);
        // Close original panel, then verify real map sprites and tap-reachable bubble buttons.
        await page.locator(".world-close").first().click();
        await page.evaluate(tile=>__farm.focusTile(tile),barn.tileId);
        await click(page.locator(`[data-animal-id="${p.id}"]`).first());
        assert.match(await page.locator('#objectBubble [data-action="groom"]').innerText(),/抚摸/);
        const reachable=await page.locator('#objectBubble button').evaluateAll(elements=>elements.every(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
        assert.ok(reachable,"animal buttons fit viewport");
        await click(page.locator('#objectBubble [data-action="groom"]'));
        await page.waitForFunction(id=>__farm.state().animals.find(a=>a.id===id).lastGroomedAt>0,p.id,{timeout:20000});
        // Rendering uses genuine alternating frames. Deterministic sleep sample freezes position.
        const pixelCheck = await page.evaluate(async () => {
          const sheet = Atlas.getFrame("animals_qiuqiu","pig_walk_a");
          const image=new Image();image.src=sheet.image;await image.decode();
          const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0);
          const result={};for(const type of ["hedgehog","pig"]){
            const a=Atlas.getFrame("animals_qiuqiu",type+"_walk_a"),b=Atlas.getFrame("animals_qiuqiu",type+"_walk_b");
            const pa=ctx.getImageData(a.x,a.y,48,48).data,pb=ctx.getImageData(b.x,b.y,48,48).data;
            result[type]={different:pa.some((v,i)=>v!==pb[i]),opaque:pa.filter((_,i)=>i%4===3&&pa[i]>0).length,transparent:pa.filter((_,i)=>i%4===3&&pa[i]===0).length};
          }return result;
        });
        for(const check of Object.values(pixelCheck)){assert.ok(check.different);assert.ok(check.opaque>100);assert.ok(check.transparent>100);}
        await page.evaluate(()=>__farm.safeSaveNow());
        await page.reload();await page.waitForFunction(()=>window.__farm&&window.Atlas?.isReady()&&!document.querySelector("#startupLoading"));
        const restored=await page.evaluate(()=>__farm.state().animals);
        assert.equal(await page.evaluate(()=>__farm.state().story.dialogueLog[0].line),seed.story.dialogueLog[0].line);
        assert.equal(restored.find(a=>a.id===p.id).adoptedAt,p.adoptedAt);
        assert.ok(restored.find(a=>a.id===h.id).affinity>0);assert.ok(restored.find(a=>a.id===p.id).lastGroomedAt>0);
        await page.evaluate(tile=>__farm.focusTile(tile),barn.tileId);
        await page.screenshot({path:path.join(EVIDENCE,device.name+".png")});
        assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
        console.log(`PASS ${device.name}: real adoption, care buttons/touch, frame pixels, growth timestamp and reload persistence, zero script/resource errors`);
      } finally {await context.close();}
    }
  } finally {await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
