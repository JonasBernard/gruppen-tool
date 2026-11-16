// Turns the narration lines into audio clips and durations. Per line, in this order:
// a human recording in recordings/<key>.(wav|mp3|m4a), a Piper TTS clip, or no audio at all
// (then the line is only a caption and its duration is estimated from its length).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const SECONDS_PER_CHAR = 0.062;

function audioDuration(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffprobe failed for ${file}: ${r.stderr}`);
  return parseFloat(r.stdout);
}

export function prepareVoice({ lines, pronunciation, recordingsDir, cacheDir, piper, model }) {
  const voice = {};
  for (const [key, text] of Object.entries(lines)) {
    let file = ["wav", "mp3", "m4a"].map((ext) => path.join(recordingsDir, `${key}.${ext}`)).find((f) => fs.existsSync(f)) ?? null;
    if (!file && model) {
      const spoken = Object.entries(pronunciation).reduce((s, [written, said]) => s.replaceAll(written, said), text);
      const hash = crypto.createHash("sha1").update(path.basename(model) + spoken).digest("hex").slice(0, 10);
      file = path.join(cacheDir, `${key}-${hash}.wav`);
      if (!fs.existsSync(file)) {
        fs.mkdirSync(cacheDir, { recursive: true });
        const r = spawnSync(piper, ["-m", model, "-f", file], { input: spoken, encoding: "utf8" });
        if (r.status !== 0) throw new Error(`piper failed for "${key}": ${r.error ?? r.stderr}`);
      }
    }
    voice[key] = { text, file, duration: file ? audioDuration(file) : Math.max(1.6, text.length * SECONDS_PER_CHAR) };
  }
  return voice;
}
