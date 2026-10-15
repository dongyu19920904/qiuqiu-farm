"use strict";
// Reproducible packing of the generated 4x4 source; original farm sheets are untouched.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require("playwright");
const OUT = path.resolve(__dirname, "../assets/generated/qiuqiu");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const data = fs.readFileSync(path.join(OUT, "source/animals-master.png")).toString("base64");
    const result = await page.evaluate(async (data) => {
      const image = new Image(); image.src = "data:image/png;base64," + data; await image.decode();
      const source = document.createElement("canvas"); source.width = image.width; source.height = image.height;
      const sc = source.getContext("2d", { willReadFrequently: true }); sc.drawImage(image, 0, 0);
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 192;
      const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
      // Source row bands follow the clear transparent gutters in the generated master.
      const bands = [0, .28, .52, .74, 1];
      const frames = {}, bounds = [];
      for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
        const x = Math.round(col * image.width / 4), y = Math.round(bands[row] * image.height);
        const w = Math.round(image.width / 4), h = Math.round(bands[row + 1] * image.height) - y;
        const pixels = sc.getImageData(x, y, w, h).data;
        let left = w, right = -1, top = h, bottom = -1;
        for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
          if (pixels[(yy * w + xx) * 4 + 3] < 128) continue;
          left = Math.min(left, xx); right = Math.max(right, xx); top = Math.min(top, yy); bottom = Math.max(bottom, yy);
        }
        if (right < left) throw Error("Empty animal frame");
        const bw = right - left + 1, bh = bottom - top + 1;
        const scale = Math.min(40 / bw, 38 / bh), dw = Math.round(bw * scale), dh = Math.round(bh * scale);
        ctx.drawImage(source, x + left, y + top, bw, bh, col * 48 + Math.floor((48 - dw) / 2), row * 48 + 42 - dh, dw, dh);
        const type = row < 2 ? "hedgehog" : "pig";
        const pose = row % 2 ? ["happy_a", "happy_b", "sleep_a", "sleep_b"][col] : ["idle_a", "idle_b", "walk_a", "walk_b"][col];
        frames[type + "_" + pose] = { x: col * 48, y: row * 48, w: 48, h: 48, anchor: [.5, .85] };
        bounds.push({ type, pose, source: [x + left, y + top, bw, bh] });
      }
      // Binary transparency and a small, consistent RGB grid at native pixel size.
      const pixels = ctx.getImageData(0, 0, 192, 192);
      for (let i = 0; i < pixels.data.length; i += 4) {
        if (pixels.data[i + 3] < 128) pixels.data.fill(0, i, i + 4);
        else { pixels.data[i + 3] = 255; for (let c = 0; c < 3; c++) pixels.data[i + c] = Math.round(pixels.data[i + c] / 8) * 8; }
      }
      ctx.putImageData(pixels, 0, 0);
      for (const type of ["hedgehog", "pig"]) {
        frames[type + "_eating_a"] = frames[type + "_idle_b"];
        frames[type + "_eating_b"] = frames[type + "_idle_a"];
      }
      return { png: canvas.toDataURL("image/png").split(",")[1], frames, bounds };
    }, data);
    fs.writeFileSync(path.join(OUT, "animals-48.png"), Buffer.from(result.png, "base64"));
    fs.writeFileSync(path.join(OUT, "animals-48.json"), JSON.stringify({ image: "assets/generated/qiuqiu/animals-48.png", meta: { w: 192, h: 192, frameW: 48, frameH: 48, cols: 4, rows: 4 }, frames: result.frames }, null, 2) + "\n");
    const provenance = JSON.parse(fs.readFileSync(path.join(OUT, "source/provenance.json"), "utf8"));
    provenance.masterSHA256 = hash(path.join(OUT, "source/animals-master.png"));
    provenance.atlasSHA256 = hash(path.join(OUT, "animals-48.png"));
    provenance.frameMapSHA256 = hash(path.join(OUT, "animals-48.json"));
    provenance.sourceBounds = result.bounds;
    const truffles = await page.evaluate(async (data) => {
      const image = new Image(); image.src = "data:image/png;base64," + data; await image.decode();
      const src = document.createElement("canvas"); src.width = image.width; src.height = image.height;
      const sc = src.getContext("2d", { willReadFrequently: true }); sc.drawImage(image, 0, 0);
      const canvas = document.createElement("canvas"); canvas.width = 96; canvas.height = 32;
      const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
      const bands = [0, .38, .61, 1], frames = {};
      ["normal", "good", "premium"].forEach((tier, col) => {
        const x = Math.round(bands[col] * image.width), w = Math.round(bands[col + 1] * image.width) - x;
        const pixels = sc.getImageData(x, 0, w, image.height).data;
        let l = w, r = -1, t = image.height, b = -1;
        for (let yy = 0; yy < image.height; yy++) for (let xx = 0; xx < w; xx++) if (pixels[(yy * w + xx) * 4 + 3] >= 128) {
          l = Math.min(l, xx); r = Math.max(r, xx); t = Math.min(t, yy); b = Math.max(b, yy);
        }
        const bw = r - l + 1, bh = b - t + 1, scale = Math.min(28 / bw, 28 / bh);
        const dw = Math.round(bw * scale), dh = Math.round(bh * scale);
        ctx.drawImage(src, x + l, t, bw, bh, col * 32 + Math.floor((32 - dw) / 2), Math.floor((32 - dh) / 2), dw, dh);
        frames["truffle_" + tier] = { x: col * 32, y: 0, w: 32, h: 32, anchor: [.5, .5] };
      });
      return { png: canvas.toDataURL("image/png").split(",")[1], frames };
    }, fs.readFileSync(path.join(OUT, "source/truffles-master.png")).toString("base64"));
    fs.writeFileSync(path.join(OUT, "truffles-32.png"), Buffer.from(truffles.png, "base64"));
    fs.writeFileSync(path.join(OUT, "truffles-32.json"), JSON.stringify({ image: "assets/generated/qiuqiu/truffles-32.png", meta: { w: 96, h: 32, frameW: 32, frameH: 32, cols: 3, rows: 1 }, frames: truffles.frames }, null, 2) + "\n");
    provenance.truffleMasterSHA256 = hash(path.join(OUT, "source/truffles-master.png"));
    provenance.truffleAtlasSHA256 = hash(path.join(OUT, "truffles-32.png"));
    fs.writeFileSync(path.join(OUT, "source/provenance.json"), JSON.stringify(provenance, null, 2) + "\n");
    console.log("Packed 16 new animal frames; original sheets preserved.");
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
