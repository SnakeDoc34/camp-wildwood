# Camp Wildwood

A 2nd-grade math learning game (Dimensions Math 2B) set at an outdoor camp that players restore.
Built for classroom use — share the site URL; each player keeps their own camp on their own device.

## Living campsite update (living-camp1)

- Local SVG scenery adds mountains, swaying pines, a rippling creek, drifting clouds, and night fireflies. Tap the lighting button to choose morning, golden hour, or night; each camper keeps their own choice.
- A fox helper responds to correct work and encourages retries. A mission day advances with completed practice, not a timer; mathematical diagrams remain still.
- Three additional shop rewards: cozy campfire (4 tokens), woodland fairy lights (6), and creek canoe (7). Existing purchases and camp layouts remain compatible.
- The optional Camp Backpack supports whole-number place-value exchanges and equal-group multiplication/division. Opening it marks the question as supported practice without reducing rewards. Work mats resume with the mission.
- Calm visuals in My Report pauses decorations and celebrations. The device Reduce Motion setting also applies. No graphics libraries or external assets are added.
- All chapters 8–15 and the optional Trailhead are present in the current source; the older milestone notes below document earlier releases.

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
- `audio/` — recorded Melody narration clips for every demonstration,
  including the second demonstrations added in `dm2b-qa3`. Clips are embedded
  as data URIs in chunked `.js` files; the player resolves each clip by file
  name and falls back to on-device speech if a clip cannot load.
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

The camp-building live pass also covers four mission completions (28 questions),
the one-token replay, savings goals, two purchases, keyboard placement, swapping,
putting items away, soccer scoring, refresh, and separate camper camps.

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
