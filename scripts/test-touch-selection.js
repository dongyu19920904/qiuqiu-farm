"use strict";
// Regression: gameplay text must not be selected by repeated taps/long presses;
// the real save textarea must still allow selecting and replacing text.
const assert = require("node:assert/strict"), fs = require("node:fs"), http = require("node:http"), path = require("node:path");
const { chromium } = require("playwright"), S = require("../src/state.js"), C = require("../src/config.js"), A = require("../src/adventure.js");
const root = path.resolve(__dirname, ".."), version = require("../package.json").appVersion;
const mime = { ".html":"text/html", ".js":"application/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".webmanifest":"application/manifest+json" };
async function main() {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url,"http://local").pathname;
    const file = path.resolve(root,"."+(pathname === "/" ? "/index.html" : pathname)), relative = path.relative(root,file);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200,{"Content-Type":mime[path.extname(file)] || "application/octet-stream"}); fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  let browser;
  try {
    browser = await chromium.launch();
    for (const device of [{name:"desktop",width:1440,height:900,mobile:false},{name:"mobile",width:390,height:844,mobile:true},{name:"small",width:320,height:568,mobile:true}]) {
      const context = await browser.newContext({viewport:{width:device.width,height:device.height},isMobile:device.mobile,hasTouch:device.mobile,serviceWorkers:"block"});
      try {
        const seed = S.defaultState(Date.now()); A.ensure(seed,Date.now()); seed.adventure.welcomeSeen=true; seed.tutorialDone=true;
        await context.addInitScript(({key,seed})=>localStorage.setItem(key,JSON.stringify(seed)),{key:C.GAME.saveKey,seed});
        const page = await context.newPage(), errors=[], missing=[];
        page.on("pageerror",e=>errors.push(e.message)); page.on("response",r=>{if(r.status()>=400)missing.push(r.url());});
        await page.goto(process.env.FARM_URL || `http://127.0.0.1:${server.address().port}/`);
        await page.waitForFunction(()=>window.__farm && window.Atlas?.isReady() && !document.querySelector("#startupLoading"));
        assert.equal(await page.evaluate(()=>__farm.pwaVersion()),version);
        const title = page.locator(".world-objective-title");
        await title.dblclick({position:{x:12,y:10}});
        assert.equal(await page.evaluate(()=>getSelection().toString()),"","Repeated clicks must not select the quest text");
        if (device.mobile) {
          const cdp = await context.newCDPSession(page);
          try {
            for (const target of [title,page.locator(".world-chapter")]) {
              const box = await target.boundingBox(); assert.ok(box);
              await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:box.x+12,y:box.y+box.height/2}]});
              await page.waitForTimeout(900); // Exceed the browser's native long-press threshold.
              await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
              assert.equal(await page.evaluate(()=>getSelection().toString()),"","Long-pressing gameplay text must not select it");
            }
          } finally { await cdp.detach(); }
        }
        assert.equal(await page.locator("body").evaluate(el=>getComputedStyle(el).userSelect),"none");
        const tap = async locator=>device.mobile ? locator.tap() : locator.click();
        await tap(page.locator("#settingsBtn"));
        const field = page.locator("#saveCodeBox"); await field.scrollIntoViewIfNeeded();
        assert.equal(await field.evaluate(el=>getComputedStyle(el).userSelect),"text");
        await field.fill("save-code-123"); await field.press("ControlOrMeta+A");
        assert.equal(await field.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd)),"save-code-123","Save text must remain selectable for copy/paste");
        await field.press("Backspace"); await page.keyboard.insertText("replacement-code");
        assert.equal(await field.inputValue(),"replacement-code","Selected save text can still be replaced");
        await page.locator("#settingsOk").scrollIntoViewIfNeeded(); await tap(page.locator("#settingsOk"));
        assert.equal(await page.locator("#settingsModal").isVisible(),false,"Normal taps must still operate controls");
        assert.deepEqual(errors,[]); assert.deepEqual(missing,[]);
        console.log(`PASS ${device.name}: no gameplay selection, native touch hold, editable save selection/replacement and normal taps`);
      } finally { await context.close(); }
    }
  } finally { if(browser)await browser.close(); await new Promise(resolve=>server.close(resolve)); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
