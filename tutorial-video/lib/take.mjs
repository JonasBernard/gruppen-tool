// One recording session. The storyboard drives the app through this object; it moves the
// pointer, steers the camera, shows cards, queues narration and keeps the timeline that
// encode.mjs later turns into the video.
import fs from "node:fs";
import path from "node:path";

const realSleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
// Gentler than `ease`: its top speed is only 1.57x the average, which bounds a scroll step.
const easeSine = (k) => 0.5 - Math.cos(Math.PI * k) / 2;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, k) => a + (b - a) * k;

const STEP_MS = 1000 / 60;
const PAUSE_AFTER_LINE_MS = 280;
// From this zoom on the camera follows the pointer when it leaves the visible area.
const FOLLOW_FROM_SCALE = 1.15;
// Scrolling needs the camera to see a little less than the layout viewport (see scrollTo).
const SCROLL_SCALE = 1.06;

export class Take {
  constructor({ page, cdp, voice, outDir, layout, outputWidth, only }) {
    Object.assign(this, { page, cdp, voice, outDir, only });
    this.W = layout.width;
    this.H = layout.height;
    this.K = outputWidth / layout.width;
    this.cam = { x: 0, y: 0, s: 1 };
    this.scrollY = 0;
    this.mouse = { x: this.W / 2, y: this.H / 2 };
    this.fast = false;
    this.recording = false;
    this.frames = [];
    this.captions = [];
    this.scenes = [];
    this.pendingWrites = [];
    this.voiceTail = Promise.resolve();
    this.arcSide = 1;
    this.cursorShown = false;
    this.rand = 7;
  }

  // ---------- time ----------

  now() { return Date.now() / 1000 - this.t0; }
  /** Pause for the viewer. Skipped while fast-forwarding to the scene being worked on. */
  async wait(ms) { if (!this.fast) await realSleep(ms); }
  /** Pause the app needs (animations, rendering); shortened but never skipped. */
  async settle(ms) { await realSleep(this.fast ? Math.min(ms, 250) : ms); }

  async scene(name, fn) {
    const active = !this.only || this.only.includes(name);
    if (!active && this.scenes.length) return; // everything asked for is recorded
    this.fast = !active;
    if (active && !this.recording) await this.startRecording();
    const start = this.recording ? this.now() : 0;
    await fn();
    await this.voiceDone();
    if (active) this.scenes.push({ name, start, end: this.now() });
  }

  // ---------- capture ----------

  async startRecording() {
    fs.mkdirSync(path.join(this.outDir, "frames"), { recursive: true });
    this.cdp.on("Page.screencastFrame", (f) => {
      this.cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
      if (!this.recording) return;
      const file = `frames/${String(this.frames.length).padStart(6, "0")}.png`;
      this.frames.push({ file, t: f.metadata.timestamp - this.t0 });
      this.pendingWrites.push(fs.promises.writeFile(path.join(this.outDir, file), Buffer.from(f.data, "base64")));
    });
    this.applyCam();
    await realSleep(300);
    this.t0 = Date.now() / 1000;
    this.recording = true;
    await this.cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
  }

  async finish() {
    const duration = this.now();
    this.recording = false;
    await this.cdp.send("Page.stopScreencast");
    await Promise.all(this.pendingWrites);
    const timeline = { duration, frames: this.frames, captions: this.captions, scenes: this.scenes };
    fs.writeFileSync(path.join(this.outDir, "timeline.json"), JSON.stringify(timeline));
    return timeline;
  }

  // ---------- narration ----------

  /**
   * Queues a narration line (a key of `lines` in the storyboard). Lines never overlap.
   * `await t.say(k)` waits until it has been spoken; without await the following actions
   * run while it plays.
   */
  say(key) {
    const line = this.voice[key];
    if (!line) throw new Error(`Unknown narration line "${key}"`);
    this.voiceTail = this.voiceTail.then(async () => {
      if (this.fast) return;
      const start = this.now();
      this.captions.push({ key, text: line.text, audio: line.file, start, end: start + line.duration });
      await realSleep(line.duration * 1000 + PAUSE_AFTER_LINE_MS);
    });
    return this.voiceTail;
  }
  voiceDone() { return this.voiceTail; }

  // ---------- geometry ----------

  /** Rect in layout-viewport px for a locator, a list of locators (union) or a plain rect. */
  async rect(target) {
    if (Array.isArray(target)) {
      const rs = await Promise.all(target.map((t) => this.rect(t)));
      const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
      const right = Math.max(...rs.map((r) => r.x + r.width)), bottom = Math.max(...rs.map((r) => r.y + r.height));
      return { x, y, width: right - x, height: bottom - y };
    }
    if (typeof target.evaluate !== "function") return target;
    await target.first().waitFor({ state: "visible", timeout: 8000 });
    return target.first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
  }

  // ---------- camera ----------

  applyCam() {
    const { x, y, s } = this.cam;
    this.cdp.send("Emulation.setDeviceMetricsOverride", {
      width: this.W, height: this.H, deviceScaleFactor: 1, mobile: false,
      // In document coordinates, hence the scroll offset.
      viewport: { x, y: this.scrollY + y, width: this.W / s, height: this.H / s, scale: this.K * s },
    }).catch(() => {});
    this.page.evaluate((s) => window.__stage.setCam(s), s).catch(() => {});
  }

  async moveCam(to, ms = 900) {
    const from = { ...this.cam };
    const steps = this.fast ? 1 : Math.max(1, Math.round(ms / STEP_MS));
    const start = Date.now();
    for (let i = 1; i <= steps; i++) {
      const k = ease(i / steps);
      // Interpolating 1/s keeps the visible rect's edges moving linearly.
      this.cam = { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), s: 1 / lerp(1 / from.s, 1 / to.s, k) };
      this.applyCam();
      const due = start + i * STEP_MS - Date.now();
      if (due > 0 && !this.fast) await realSleep(due);
    }
  }

  /**
   * Zooms so that `target` fills the frame. `scale` fixes the zoom instead of fitting;
   * `pad` is the margin around the target in px.
   */
  async zoomTo(target, { scale, pad = 30, max = 2, ms = 900 } = {}) {
    const r = await this.rect(target);
    const s = scale ?? clamp(Math.min(this.W / (r.width + 2 * pad), this.H / (r.height + 2 * pad)), 1, max);
    const w = this.W / s, h = this.H / s;
    const x = clamp(r.x + r.width / 2 - w / 2, 0, this.W - w);
    const y = clamp(r.y + r.height / 2 - h / 2, 0, this.H - h);
    await this.moveCam({ x, y, s }, ms);
  }

  /** Where the camera has to go so that a point is comfortably inside the frame, or null. */
  panFor(p) {
    const { x, y, s } = this.cam;
    if (s < FOLLOW_FROM_SCALE) return null;
    const w = this.W / s, h = this.H / s, mx = w * 0.14, my = h * 0.18;
    const nx = clamp(clamp(x, p.x - w + mx, p.x - mx), 0, this.W - w);
    const ny = clamp(clamp(y, p.y - h + my, p.y - my), 0, this.H - h);
    return Math.abs(nx - x) + Math.abs(ny - y) < 1 ? null : { x: nx, y: ny, s };
  }

  zoomOut(ms = 900) { return this.moveCam({ x: 0, y: 0, s: 1 }, ms); }

  /**
   * Smoothly scrolls the page. The camera works in document coordinates, so a scroll and
   * the matching camera move cannot be applied in the same frame. To keep that invisible
   * the camera first closes in a little: then either order stays inside the rendered area
   * as long as one step is smaller than the margin.
   */
  async scrollTo(y, ms = 1100) {
    if (this.cam.s < SCROLL_SCALE) {
      const w = this.W / SCROLL_SCALE, h = this.H / SCROLL_SCALE;
      await this.moveCam({ x: (this.W - w) / 2, y: (this.H - h) / 2, s: SCROLL_SCALE }, 350);
    }
    const max = await this.page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const from = this.scrollY, to = clamp(y, 0, max);
    const margin = Math.max(8, Math.min(this.cam.y, this.H - this.H / this.cam.s - this.cam.y));
    const minSteps = Math.ceil((Math.abs(to - from) * 1.6) / margin);
    const steps = this.fast ? minSteps : Math.max(minSteps, Math.round(ms / STEP_MS));
    const start = Date.now();
    for (let i = 1; i <= steps; i++) {
      this.scrollY = Math.round(lerp(from, to, easeSine(i / steps)));
      this.page.evaluate((v) => window.scrollTo(0, v), this.scrollY).catch(() => {});
      this.applyCam();
      const due = start + i * STEP_MS - Date.now();
      await realSleep(this.fast ? 2 : Math.max(due, 0));
    }
    await this.page.mouse.move(this.mouse.x, this.mouse.y);
  }

  /** Scrolls so that `target`'s top edge sits `offset` px below the top of the viewport. */
  async scrollToElement(target, offset = 90, ms) {
    const r = await this.rect(target);
    await this.scrollTo(this.scrollY + r.y - offset, ms);
  }

  /** Picks up scrolling the app did on its own (focus changes, modals). */
  async syncScroll() {
    const y = await this.page.evaluate(() => window.scrollY);
    if (y !== this.scrollY) { this.scrollY = y; this.applyCam(); }
  }

  // ---------- pointer ----------

  jitter() { this.rand = (this.rand * 16807) % 2147483647; return this.rand / 2147483647; }

  async showCursor(x, y) {
    this.mouse = { x, y };
    this.cursorShown = true;
    await this.page.mouse.move(x, y);
    await this.page.evaluate(() => window.__stage.showCursor(true));
  }

  /** Moves the pointer to the centre of `target` (plus dx/dy) along a slightly curved path. */
  async moveTo(target, { dx = 0, dy = 0, ms } = {}) {
    const r = await this.rect(target);
    const to = { x: r.x + (r.width ?? 0) / 2 + dx, y: r.y + (r.height ?? 0) / 2 + dy };
    const from = { ...this.mouse };
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const duration = ms ?? clamp(260 + dist * 0.75, 320, 1100);
    const pan = this.panFor(to);
    const camera = pan && this.moveCam(pan, duration);
    const steps = this.fast ? 1 : Math.max(1, Math.round(duration / STEP_MS));
    const bend = Math.min(36, dist * 0.09) * (this.arcSide = -this.arcSide);
    const nx = dist ? -(to.y - from.y) / dist : 0, ny = dist ? (to.x - from.x) / dist : 0;
    const start = Date.now();
    for (let i = 1; i <= steps; i++) {
      const k = ease(i / steps), arc = Math.sin(Math.PI * k) * bend;
      this.mouse = { x: lerp(from.x, to.x, k) + nx * arc, y: lerp(from.y, to.y, k) + ny * arc };
      await this.page.mouse.move(this.mouse.x, this.mouse.y);
      const due = start + i * STEP_MS - Date.now();
      if (due > 0 && !this.fast) await realSleep(due);
    }
    await camera;
  }

  async click(target, { after = 350, ...move } = {}) {
    await this.moveTo(target, move);
    await this.wait(160);
    await this.page.mouse.down();
    await this.wait(90);
    await this.page.mouse.up();
    await this.settle(after);
    await this.syncScroll();
  }

  async type(text, { delay = 70 } = {}) {
    for (const ch of text) {
      await this.page.keyboard.type(ch);
      await this.wait(delay * (0.6 + this.jitter() * 0.8));
    }
  }
  async press(key, after = 120) { await this.page.keyboard.press(key); await this.settle(after); }

  // ---------- overlay ----------

  /** Cross-fades to a full-screen card. Cards need the whole frame, so the camera zooms out first. */
  async card(name, data) {
    if (this.cam.s !== 1) await this.zoomOut(500);
    await this.page.evaluate(([n, d, cursor]) => {
      window.__stage.card(n, d);
      window.__stage.showCursor(cursor);
    }, [name, data, !name && this.cursorShown]);
    await this.settle(450);
  }
  hideCard() { return this.card(null); }
  phase(n) { return this.page.evaluate((v) => window.__stage.phase(v), n); }

  async highlight(target, pad = 6) {
    const r = await this.rect(target);
    await this.page.evaluate((v) => window.__stage.highlight(v), { x: r.x - pad, y: r.y - pad, width: r.width + 2 * pad, height: r.height + 2 * pad });
  }
  clearHighlight() { return this.page.evaluate(() => window.__stage.highlight(null)); }

  /** Drags a file in from `from` (a point at the edge of the screen) and drops it on `dropSelector` for real. */
  async dragFile(filePath, dropSelector, from) {
    const name = path.basename(filePath);
    await this.moveTo(from);
    // No real mouse button here: a press outside the import dialog would close it.
    await this.page.evaluate((n) => window.__stage.dragFile(n), name);
    await this.wait(600);
    await this.moveTo(this.page.locator(dropSelector), { ms: 1400 });
    await this.wait(350);
    const type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    await this.page.evaluate((a) => window.__stage.dropFile(...a), [dropSelector, name, fs.readFileSync(filePath).toString("base64"), type]);
    await this.settle(600);
  }
}
