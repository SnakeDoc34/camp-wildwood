# Camp Wildwood

A 2nd-grade math learning game (Dimensions Math 2B) set at an outdoor camp that players restore.
Built for classroom use — share the site URL; each player keeps their own camp on their own device.

## How it works

- **Players** pick a nickname (nicknames only) and get their own camp, tokens, and progress.
  All saves live in the browser's localStorage — per device, per browser.
- **Milestone 1** includes the camp shell plus Chapter 8 (Mental Calculation) and
  Chapter 9 (Equal Groups: multiplication and division of 3 and 4).
- Every skill follows **teach → controls → guided → independent → adventure**:
  mathematical diagrams and narration, controls instructions, scaffolded practice,
  independent missions, and an optional challenge. Correct answers include a worked
  explanation that stays visible until the player chooses Continue.
- **Varied practice**: generators avoid recent variants where possible. Finite fact
  pools eventually repeat for review. Challenges introduce only the current skill
  or a different skill already completed by that camper.
- **Learning evidence**: hints and retries preserve mission rewards. New skill
  badges require four of the last five unassisted first attempts across two visits.
- Unfinished missions resume with the same numbers and entered work. The existing
  save key and target IDs are retained, with a local backup for recovery.
- **Session Report** (📋) gives teachers a printable summary of work done.
- The illustrated camp shows two playable trails with progress. Planned chapters
  are grouped under Future trails. Select the camper name to switch profiles;
  unfinished missions remain with the original camper.
- Lessons separate the question from answer controls, show the current phase,
  and include optional strategy notes where the curriculum offers another method.
- **Build my camp** opens a saved, six-place camp designer. Two welcome gifts
  provide something to arrange immediately. Owned shop items can be placed,
  moved, swapped, or put away without another charge. Old purchases are placed
  automatically when their save first opens in the builder.
- The **soccer field kit** costs four earned tokens, adds field markings and two
  goals, and opens a three-kick aiming activity. Players can switch between the
  soccer field and open meadow. Soccer best scores and total goals are saved;
  camp play neither spends nor awards tokens.
- Choose a **savings goal** in the shop. Mission completion shows the actual camp,
  earned tokens, and progress toward that item. Each fully completed practice
  replay earns one token; the Adventure bonus remains once per skill. Hints never
  reduce these rewards. Returning to a completion screen cannot pay twice.

## Files

- `index.html`, `css/`, `js/` — the game (no build step, no external dependencies)
- `assets/` — original camp scenery; decorative art never replaces math diagrams
- `audio/` — existing Melody narration clips. Corrected lessons use their updated
  captions through on-device speech rather than playing an outdated recording.
  Unchanged lessons retain recorded clips; all lessons remain readable with sound off.
- `tests/` — deterministic mathematical and mission-flow regression checks
- `QA_REPORT.md` — findings, curriculum sources, changes, and verification limits
- `ROADMAP.md` — staged chapter and camp-activity plan, with acceptance checks

## Verification

Run with Node.js (no dependencies):

```sh
node --test tests/*.test.cjs
```

The suite checks 120,000 generated cases, explanation equations, exact diagram
counts, both meanings of division, entry controls, hint-aware learning evidence,
profile isolation, resumed work, rewards, legacy saves, narration cancellation,
missing-factor division coaching, paused hints, playable trails, and camper switching.

All 32 automated tests pass in camp-build1 (the original 23 math checks plus nine
camp-building and reward checks). Desktop Chrome checks in qa2 cover all 12
demonstrations and four complete missions, both division keypads, hint/retry
scoring, refresh recovery, camper switching, and rewards. Physical iPad Safari
and narrow-screen device checks remain pending; see QA_REPORT.md for evidence.

This release implements Chapters 8 and 9 only. It supplements the textbook and
does not certify mastery of the entire Dimensions Math 2B curriculum.

## Hosting

Designed for any static host (GitHub Pages, Netlify, Cloudflare Pages).
Deploy the whole folder; keep `index.html` at the root.

## Roadmap

See [ROADMAP.md](ROADMAP.md). Chapters 8–9 are playable. The camp-building release
adds useful rewards; the next curriculum stage is Chapters 10–11 (Money and
Fractions), followed by Chapters 12–15 and a Camp Festival finale. Planned
chapters remain clearly marked and cannot be launched.
