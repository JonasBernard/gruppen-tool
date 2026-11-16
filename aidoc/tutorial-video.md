# Tutorial video

The welcome page ("So funktioniert's") shows a short German tutorial video:
`workshops-frontend/public/tutorial.mp4` with the poster `tutorial-poster.jpg`.
The video is not edited by hand. `tutorial-video/` records it from the real app, so it
can be re-made whenever the UI or the wording changes.

**Status: draft.** All German text in the video was drafted by an agent and needs a human
to approve or rewrite it. The voice is synthetic and meant as a placeholder.

## What is in the video

About 2:30 min, 1920x1080, light mode, pointer and zoom, narration plus the same text as
captions (so it also works muted).

| Scene | Content |
|---|---|
| `intro` | Title; wishes, limited seats and the resulting assignment; and the point the video has to get across: wishes are for **workshops, not for people** ("not with Alice" cannot be expressed). |
| `workshops` | Adding workshops with name and capacity. |
| `participants` | Number of wishes per participant; adding one participant by hand. |
| `import` | Excel format (name in column A, wishes from B on, no header row, first sheet only), drag and drop, the preview with a wish marked yellow, fixing that typo with the edit button. |
| `assign` | The two general settings, running the assignment, charts, result list, Excel download, another equally good result on a second click. |
| `outro` | Example data and the Excel template in the sidebar. |

## Changing the text

Everything that is said or written in the video is in `tutorial-video/storyboard.mjs`:

- `lines`: the narration, one entry per caption. An entry is spoken as one clip and shown
  as one caption, so keep entries to one or two sentences.
- `cards`: the text on the explainer cards (title, wishes, "Das geht / Das geht nicht",
  the spreadsheet, outro).
- `pronunciation`: respellings for the TTS voice only ("Excel" is spoken as "Ex-Zell").
  Captions keep the normal spelling.

The scenes wait for the narration, so longer or shorter lines need no retiming. The build
fails if the video reaches 3 minutes and warns if a caption does not fit below the screen.

## Re-making the video

Requirements: Node, `ffmpeg`, Playwright with Chromium (`npm i` in `tutorial-video/`, then
`npx playwright install chromium`), and optionally Piper (`pip install piper-tts`) with a
German voice for the narration.

1. Start the v1 backend: `cd workshops-backend && go run src/main.go`.
2. Build and serve the frontend the way production looks, but without analytics keys:
   ```bash
   cd workshops-frontend
   REACT_APP_API_BASEURL=http://localhost:5000 REACT_APP_VERSION=v0.1 npm run build
   npx serve -s build -l 3000
   ```
   Do not record `npm start`: development mode shows the debug import and the admin tab.
3. Record:
   ```bash
   cd tutorial-video
   node make.mjs --voice-model /path/to/de_DE-thorsten-high.onnx
   ```
   This writes `out/tutorial.mp4` and `out/tutorial-poster.jpg`. Copy both to
   `workshops-frontend/public/`.

Options of `make.mjs`:

| Option | Meaning |
|---|---|
| `--url` | Where the app runs (default `http://localhost:3000`). |
| `--voice-model` | Piper voice. Without it the video has captions but no sound. |
| `--piper` | Path of the `piper` executable if it is not on the `PATH`. |
| `--only intro,import` | Record only these scenes; the ones before are fast-forwarded. For working on a scene. |
| `--fps` | Frame rate (default 30). |
| `--out` | Output directory (default `tutorial-video/out`, ignored by git). |

A full run takes about four minutes, because the app is recorded in real time.

### Using a human voice

Put a recording per line into `tutorial-video/recordings/<key>.wav` (or `.mp3`, `.m4a`),
named after the keys of `lines`, for example `recordings/intro.wav`. A recording wins over
TTS for that line, and the scene timing follows its length.

The placeholder voice is `de_DE-thorsten-high` from the Piper voices
(`rhasspy/piper-voices` on Hugging Face); its model card lists the underlying Thorsten-Voice
dataset as CC0. The model file is not in the repository.

## How it works

- `make.mjs` prepares the narration, opens the app in headless Chromium, runs the storyboard
  and encodes the result.
- `lib/take.mjs` is the object the storyboard drives (`t.click`, `t.type`, `t.zoomTo`,
  `t.say`, ...). It captures the page with the DevTools screencast and keeps a timeline of
  frames and captions.
- `lib/stage.js` and `lib/stage.css` are injected into the page and draw what the app does
  not have: the pointer, click ripples, the highlight box, the dragged file and the cards.
  They live in a shadow root, so app styles and React do not interfere.
- `lib/voice.mjs` produces the audio clip and duration for every line.
- `lib/encode.mjs` pipes the frames to ffmpeg at a constant frame rate, places the recording
  in the dark frame, puts the captions below it and mixes in the clips.

Things that are not obvious:

- **Zoom.** The app is laid out at 1280x720. The camera is the `viewport` argument of
  `Emulation.setDeviceMetricsOverride`: Chromium renders the chosen part of the page at the
  output size, so zoomed shots are sharp, and the page does not notice (layout, `vh` and
  fixed elements are unchanged). The camera works in document coordinates and nothing is
  rendered outside the layout viewport. That is why `t.scrollTo` zooms in slightly before it
  scrolls, and why scrolling must go through `t.scrollTo` instead of happening on its own.
- **Import.** The file is not picked in a system dialog. The stage shows a file hanging on
  the pointer and then dispatches a real `drop` event with the file, so the app's own
  drag-and-drop handler runs.
- **Analytics.** The recorder blocks every request that does not go to `localhost`, and the
  build above has no PostHog key. A recording therefore never appears in the statistics.
- **Results differ per run.** The solver picks randomly among equally good assignments, so
  the charts are not identical between runs. The storyboard does not rely on a specific result.
- **Demo data.** `tutorial-video/assets/Wünsche.xlsx` has 14 participants and one deliberate
  typo ("Schwimbad"). The spreadsheet card in `cards.sheet` repeats its first rows; keep the
  two in sync.

## Open points for the owner

- Approve or rewrite the German text (`lines`, `cards`) and the `aria-label` of the video in
  `Welcomepage.jsx`.
- Decide on the voice: keep the TTS placeholder, record your own, or ship captions only.
- The mp4 is about 8 MB in git and grows the history with every re-make. Hosting it
  elsewhere and only linking it is the alternative.
- The welcome page still links to the older tutorial on Patreon.
