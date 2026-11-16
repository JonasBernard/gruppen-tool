# CLAUDE.md

Gruppen-Tool (https://gruppen-tool.de) assigns participants to groups ("workshops") from ranked wishes and capacity limits. It is a German-language web app. A React frontend calls one of two stateless solver backends.

## Working rules (binding)

The owner's own wording of these rules is in `humandoc/00_agent_rules.md`, and that file wins if the two disagree.

- **Documentation split.** Everything under `/humandoc/` is human-written specification. Never change its content; at most fix links or formatting when a human asks. `/humandoc/` is not the only place humans write: the existing READMEs are human-written too and stay where they are. Documentation written by an agent goes under `/aidoc/`. `CLAUDE.md` stays at the repository root so Claude Code loads it.
- **Human review for all code.** Every change goes through a GitHub pull request that a human reviews. Never push to `main`.
- **Short pull request descriptions.** Keep them short and concise, so a human can read them quickly.
- **Watch your pull requests.** After opening one, keep watching it for reviews and comments and fix what they ask for.
- **UI text is for humans to write.** UI text is German with informal "du", and a human should ideally write it. If you have to draft some, point it out clearly in the pull request so a human can approve or rewrite it.
- **Few comments.** Comment only what isn't obvious from the code, and be conservative about adding them.
- **Removing beats patching.** Before patching or fixing something, consider whether code, features or functions could be removed instead, and present that option to the human.
- **Check fit.** Check each fix against the overall architecture, the existing practice in this repository, and the goal of the project.
- **Step back after big changes.** After a larger change, ask whether it was sensible or just added clutter. Keep solutions simple and verify them. If no simple solution was possible, consider whether a larger refactor is warranted (architecture change, new dependency, new file layout, new module or separation of concerns) and propose it.

## Repository layout

| Path | What it is |
|---|---|
| `workshops-frontend/` | React 18 (Create React App), Tailwind 3, flowbite-react. Its Docker image also runs the Caddy reverse proxy that serves the build and routes `/api/*`. |
| `workshops-backend/` | v1 solver in Go 1.21 (`src/main.go`, single file). It uses min-cost-max-flow from `github.com/JonasBernard/min-cost-max-flow`. Port 5000. |
| `workshops-backend-v2/` | v2 solver in Python 3.11 with Flask, gunicorn and SCIP (`pyscipopt`). `server.py` handles HTTP and validation, `solver.py` builds the MILP. Port 5010. |
| `keycloak-theme/` | Keycloakify + Tailwind/shadcn login theme, taken from a community starter. It is **not wired into the app or CI yet**, so leave it alone unless asked. |
| `humandoc/` | Human-written specification. Agents never change its content. |
| `aidoc/` | Documentation written by agents (create it when needed). |
| `testdata/` | Excel/ODS files for testing the import by hand. |
| `.gitea/workflows/docker-build.yml` | CI. It builds and pushes all three images to `git.jonasbernard.de` when a `v*.*.*[-alpha\|-beta]` tag is pushed. |
| `docker-build-push.sh` | Manual alternative to CI: `./docker-build-push.sh <TAG_PREFIX> <VERSION>`. |

## Running locally

```bash
# frontend (http://localhost:3000)
cd workshops-frontend && npm i && npm start

# v1 backend (:5000)
cd workshops-backend && go run src/main.go

# v2 backend (:5010); needs SCIP via pyscipopt
cd workshops-backend-v2 && pip install -r requirements.txt && python server.py
```

- With no env vars set, the frontend calls `http://localhost:5000` (v1) and `http://localhost:5010` (v2). `REACT_APP_API_BASEURL` and `REACT_APP_API_BASEURL_V2` override these. In Docker they are `/api` and `/api/v2`, and Caddy strips the prefix.
- CORS is only enabled for v2 under `python server.py`, not under gunicorn. That is fine in production because everything is same-origin behind Caddy.
- In `NODE_ENV=development`, extended settings and the Admin tab are always on (`src/profile/useProfile.jsx`).

## Tests and checks

There is no real test suite. `src/App.test.js` is the unchanged CRA boilerplate and fails. Neither backend has tests. To verify a change:
- frontend: run `npm run build` (CRA treats ESLint errors as build failures in CI mode) and click through the app;
- backends: POST a JSON payload, for example built from `src/sidebar/exampleData.jsx`, and check the response.

## API contract (keep all three components in sync)

Request body (the same shape for both backends):
```json
{
  "participants": [{ "id": "uuid", "name": "Alice", "wishes": ["Schach", "Bridge", ""] }],
  "workshops":    [{ "name": "Schach", "capacity": 5 }],
  "settings":     { "numberOfWishesPerParticipant": 3, "allowAssignmentToNonWishedWorkshop": false, "useWeighted": true,
                    "selectedAlgorithm": "min-cost-max-flow" | "scip",
                    "numberOfRequestedAssignments": 3, "numberOfWorkshopsPerParticipant": 1,
                    "allowSameWorkshopTwice": false, "allowSecondWorkshopBeforeFirstFilled": false,
                    "randomSeed": "", "objectiveSlack": 0.0 }
}
```
- v1: `POST /weighted` or `POST /unweighted`. Only the first two settings are used. `wishes` is a fixed `[6]string` in Go, so **at most 6 wishes**. Wish matching is trimmed and case-insensitive.
- v2: `POST /`. All settings are used, and `server.py` enforces the limits (wishes 1–6, requested assignments ≤ 15, workshops per participant ≤ 5, slack 0–1). Wish matching is **exact**.
- Both backends reject more than 150 participants.
- Response: `{ "status": "...", "solutions": [{ "assignment": [["Alice", "Schach"], ["Bob", "none"]], ...}] }`. Each row is the participant name followed by their workshop(s). `"none"` means unassigned, which is why the frontend forbids a workshop called `none`. v2 solutions also carry `objective`, `score` and `num_assigned_participants`, plus a top-level `computation_time`.
- Status strings: v1 sends `ok`, `no-perfect-solution` or `error-unknown`. v2 sends `v2:ok`, `v2:ok-single-unique`, `v2:ok-single-requested`, `v2:no-solution`, `v2:infeasible`, `v2:input-error` or `v2:scip-exception`. If you add a status, add a German message for it in `interpretStatus` in `src/assignment/ResultView.jsx`.
- Participants are matched by **name**, not id. The frontend blocks duplicate participant or workshop names before sending.

## Frontend notes

- `src/App.jsx` holds all app state (`participants`, `workshops`, `settings`, `result`), the pre-send validation in `sendData()`, and the routes: `/workshops`, `/participants`, `/assign`, `/`, `/admin`. Child views get state and setters as props. There is no state library.
- State is saved to `localStorage.dataV3`. `loadData()` migrates the old `dataV1` (which used `kids` and `numberOfWishesPerKid`) and `dataV2` formats. If you change the saved shape, add a `dataV4` with a migration instead of breaking old sessions.
- Feature flags go through `useProfile().getProfileOption("a.b")`. The flags are `extendedSettings.enable` (the SCIP and advanced settings panel) and `adminTab.enable`.
- Build-time config: `REACT_APP_VERSION`, `REACT_APP_CHANNEL_FRIENDLY_NAME`, `REACT_APP_ENABLE_EXTENDED_SETTINGS`, `REACT_APP_ENABLE_ADMIN_PAGE`, `REACT_APP_POSTHOG_*`. The per-channel values live in `docker.{alpha,beta,release}.build.args`, and the CI picks the file from the tag suffix.
- PostHog analytics: `assignment_computed` events record the full input and output, and the Admin tab reads them back via PostHog endpoints.
- Styling: Tailwind with `darkMode: "class"`, toggled through `ThemeContext.jsx`. Always add `dark:` variants when you add UI. Indigo is the accent color. Reusable inputs live in `src/components/`.
- `react-icons` is imported but not listed in `package.json`; it comes in through `flowbite-react`.
- Excel import/export uses `xlsx`. The user template is `public/Gruppen-Tool Importvorlage.xlsx`.
- User-facing release notes are hand-written in `src/ChangelogModal.jsx` (in German).

## Solver notes

- v1 weights (`main.go`): wish index `i` costs `i*i` (weighted) or `1` (unweighted). An unwished workshop costs `(n+1)^2` and is only allowed if `allowAssignmentToNonWishedWorkshop` is set. The response always contains exactly one solution.
- v2 (`solver.py`): maximizes the sum of `weight * x[k,j]`, where weight is `numWishes - wishIndex + 1` (or `1` unweighted, and `1` for unwished workshops when those are allowed). `x[k,m]` is a slack "none" column. After the first optimum it adds `objective >= opt*(1-slack)`, sets the objective to 0, and enumerates further distinct solutions with big-M no-good constraints. Participants and workshops are shuffled with `randomSeed` so the results come out in an unbiased order. Limits per solve: 150 s and 1024 MB. Limit per request: 60 s times `numberOfRequestedAssignments`, shared by all solves. Both time limits are constants at the top of `solver.py`.
- `allowSecondWorkshopBeforeFirstFilled=false` adds O(n²) pairwise constraints, so watch performance with large inputs.

## Conventions

- All UI text is **German** and uses the informal "du", and a human should write or approve it (see Working rules). Code, identifiers and comments are in English.
- Use "workshop" and "participant" in code. The old name "kid" only survives in the migration code (the recent "Consistent workshop renaming" commit removed the rest).
- Keep the backends stateless. The frontend owns all data.
- Commits are short imperative English summaries ("Add charts", "Fix theme issues with dropdown").
