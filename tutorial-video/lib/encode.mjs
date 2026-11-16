// Turns a recorded take (frames + timeline) into the final mp4: constant frame rate,
// burned-in captions and the narration clips at their start times.
import fs from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { spawn, spawnSync } from "node:child_process";

const BACKGROUND = "#0f172a";

// One image per caption: the dark frame around the (transparent) screen area plus the
// caption text in the strip below it.
const framePage = (frame, screen) => `<!doctype html><meta charset="utf-8"><style>
  html, body { margin: 0; width: ${frame.width}px; height: ${frame.height}px; background: transparent; overflow: hidden; }
  #screen { position: absolute; left: ${screen.x}px; top: ${screen.y}px; width: ${screen.width}px; height: ${screen.height}px;
            border-radius: 14px; box-shadow: 0 0 0 3000px ${BACKGROUND}; outline: 1px solid rgba(255, 255, 255, 0.16); }
  #strip { position: absolute; left: ${screen.x}px; width: ${screen.width}px; top: ${screen.y + screen.height}px; bottom: 0;
           display: flex; align-items: center; justify-content: center; }
  #c { color: #fff; text-align: center; text-wrap: balance; font: 600 34px/1.3 Inter, ui-sans-serif, system-ui, sans-serif; }
</style><div id="screen"></div><div id="strip"><div id="c"></div></div>`;

async function renderCaptions({ chromium, captions, dir, frame, screen }) {
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: frame });
  await page.setContent(framePage(frame, screen));
  const shoot = async (text, file) => {
    const fits = await page.evaluate((t) => {
      const c = document.getElementById("c");
      c.textContent = t;
      return c.offsetHeight <= c.parentElement.clientHeight - 16;
    }, text);
    if (!fits) console.warn(`Caption does not fit below the screen, shorten it: "${text}"`);
    await page.screenshot({ path: path.join(dir, file), omitBackground: true });
  };
  await shoot("", "blank.png");
  for (const [i, c] of captions.entries()) await shoot(c.text, `${i}.png`);
  await browser.close();
}

// The concat demuxer shows each caption image for its `duration`; blank.png fills the gaps.
function captionPlaylist(captions, duration) {
  const out = ["ffconcat version 1.0"];
  const add = (file, seconds) => { if (seconds > 0.001) out.push(`file '${file}'`, `duration ${seconds.toFixed(3)}`); };
  let at = 0;
  captions.forEach((c, i) => {
    const next = captions[i + 1]?.start ?? duration;
    const end = Math.min(c.end + 0.15, next - 0.08);
    add("blank.png", c.start - at);
    add(`${i}.png`, end - c.start);
    at = end;
  });
  add("blank.png", duration - at + 1);
  out.push("file 'blank.png'"); // the demuxer ignores the last duration unless a file follows
  return out.join("\n") + "\n";
}

export async function encode({ chromium, timeline, takeDir, outFile, frame, screen, fps, crf = 26 }) {
  const { frames, captions, duration } = timeline;
  const capDir = path.join(takeDir, "captions");
  await renderCaptions({ chromium, captions, dir: capDir, frame, screen });
  fs.writeFileSync(path.join(capDir, "captions.ffconcat"), captionPlaylist(captions, duration));

  const clips = captions.filter((c) => c.audio);
  const filters = [
    `[0:v]scale=${screen.width}:${screen.height}:flags=lanczos,setsar=1,pad=${frame.width}:${frame.height}:${screen.x}:${screen.y}:color=${BACKGROUND}[screen]`,
    `[1:v]fps=${fps},format=rgba[cap]`,
    `[screen][cap]overlay=eof_action=pass:format=auto,format=yuv420p[v]`,
    ...clips.map((c, i) => `[${i + 2}:a]adelay=${Math.round(c.start * 1000)}:all=1[a${i}]`),
  ];
  if (clips.length) {
    filters.push(`${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0:dropout_transition=0,volume=-3dB,aresample=48000[a]`);
  }
  const args = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "pipe:0",
    "-f", "concat", "-safe", "0", "-i", path.join(capDir, "captions.ffconcat"),
    ...clips.flatMap((c) => ["-i", c.audio]),
    "-filter_complex", filters.join(";"),
    "-map", "[v]", ...(clips.length ? ["-map", "[a]", "-c:a", "aac", "-b:a", "80k", "-ac", "1"] : []),
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-r", String(fps),
    "-t", duration.toFixed(3), "-movflags", "+faststart", outFile,
  ];
  const ffmpeg = spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
  const done = once(ffmpeg, "close");

  // Constant frame rate: every tick shows the newest captured frame at that time.
  let current = -1, png = null;
  for (let tick = 0; tick < Math.ceil(duration * fps); tick++) {
    let i = Math.max(current, 0);
    while (i + 1 < frames.length && frames[i + 1].t <= tick / fps) i++;
    if (i !== current) { png = fs.readFileSync(path.join(takeDir, frames[i].file)); current = i; }
    if (!ffmpeg.stdin.write(png)) await once(ffmpeg.stdin, "drain");
  }
  ffmpeg.stdin.end();
  const [code] = await done;
  if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
}

export function poster(video, at, outFile) {
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(at), "-i", video, "-frames:v", "1", "-q:v", "3", outFile]);
  if (r.status !== 0) throw new Error(`ffmpeg could not write ${outFile}`);
}
