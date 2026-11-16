#!/usr/bin/env node
// Records the tutorial video from storyboard.mjs. See aidoc/tutorial-video.md.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { Take } from "./lib/take.mjs";
import { prepareVoice } from "./lib/voice.mjs";
import { encode, poster } from "./lib/encode.mjs";
import { lines, pronunciation, run } from "./storyboard.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));

const { values: opt } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3000" },
    out: { type: "string", default: path.join(here, "out") },
    "voice-model": { type: "string" },
    piper: { type: "string", default: "piper" },
    fps: { type: "string", default: "30" },
    only: { type: "string" },
  },
});

const LAYOUT = { width: 1280, height: 720 }; // the viewport the app sees
const FRAME = { width: 1920, height: 1080 }; // the video
const SCREEN = { x: 144, y: 22, width: 1632, height: 918 }; // the recording inside the video; captions go below
const MAX_SECONDS = 180;

const takeDir = path.join(opt.out, "take");
fs.rmSync(takeDir, { recursive: true, force: true });
fs.mkdirSync(takeDir, { recursive: true });

const voice = prepareVoice({
  lines,
  pronunciation,
  recordingsDir: path.join(here, "recordings"),
  cacheDir: path.join(opt.out, "voice"),
  piper: opt.piper,
  model: opt["voice-model"],
});
const spoken = Object.values(voice).reduce((sum, l) => sum + l.duration, 0);
console.log(`narration: ${Object.keys(voice).length} lines, ${spoken.toFixed(1)} s`);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: LAYOUT, locale: "de-DE", colorScheme: "light", timezoneId: "Europe/Berlin" });
// Only the local app and its backends are reachable, so a recording never shows up in the analytics.
await context.route((url) => !["localhost", "127.0.0.1"].includes(url.hostname), (route) => route.abort());
await context.addInitScript(() => {
  localStorage.setItem("theme", "light");
  localStorage.setItem("hasSeenAboutModal", "v1");
  // The frames are rendered larger than the layout; this keeps the chart canvases sharp.
  Object.defineProperty(window, "devicePixelRatio", { get: () => 2 });
});
const page = await context.newPage();
await page.goto(opt.url);
await page.locator("button.border-b-2").first().waitFor();
await page.evaluate((css) => { window.__stageCss = css; }, fs.readFileSync(path.join(here, "lib/stage.css"), "utf8"));
await page.addScriptTag({ path: path.join(here, "lib/stage.js") });

const take = new Take({
  page,
  cdp: await context.newCDPSession(page),
  voice,
  outDir: takeDir,
  layout: LAYOUT,
  outputWidth: SCREEN.width,
  only: opt.only?.split(","),
});
await run(take);
const timeline = await take.finish();
await browser.close();

for (const s of timeline.scenes) console.log(`${s.name.padEnd(14)} ${s.start.toFixed(1).padStart(6)} – ${s.end.toFixed(1).padStart(6)} s`);
console.log(`recorded ${timeline.frames.length} frames, ${timeline.duration.toFixed(1)} s`);

const video = path.join(opt.out, "tutorial.mp4");
await encode({ chromium, timeline, takeDir, outFile: video, frame: FRAME, screen: SCREEN, fps: Number(opt.fps) });
poster(video, 0.5, path.join(opt.out, "tutorial-poster.jpg"));
console.log(`wrote ${video} (${(fs.statSync(video).size / 1e6).toFixed(1)} MB)`);

if (timeline.duration >= MAX_SECONDS && !opt.only) {
  console.error(`The video is ${timeline.duration.toFixed(1)} s long, but it has to stay under ${MAX_SECONDS} s.`);
  process.exit(1);
}
