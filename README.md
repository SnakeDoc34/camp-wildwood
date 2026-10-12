# Camp Wildwood

A 2nd-grade math learning game (Dimensions Math 2B) set at an outdoor camp that players restore.
Built for classroom use — share the site URL; each player keeps their own camp on their own device.

## How it works

- **Players** pick a nickname (nicknames only) and get their own camp, tokens, and progress.
  All saves live in the browser's localStorage — per device, per browser.
- **Milestone 1** includes the camp shell plus Chapter 8 (Mental Calculation) and
  Chapter 9 (Equal Groups: multiplication and division of 3 and 4).
- Every skill follows **teach → guided → independent → adventure**:
  an animated demonstration with narration, a controls demo, scaffolded practice,
  independent missions, and an optional challenge.
- **Problems never repeat**: every problem family is a parameterized generator, and
  each profile tracks which variants it has seen.
- **Session Report** (📋) gives teachers a printable summary of work done.

## Files

- `index.html`, `css/`, `js/` — the game (no build step, no external dependencies)
- `audio/` — narration clips (Melody voice) for the teaching demonstrations;
  the game falls back to on-device speech synthesis if a clip is missing

## Hosting

Designed for any static host (GitHub Pages, Netlify, Cloudflare Pages).
Deploy the whole folder; keep `index.html` at the root.

## Roadmap

- Milestone 2: Chapters 10–11 (Money, Fractions)
- Milestone 3: Chapters 12–15 (Time, Capacity, Graphs, Shapes) + Camp Festival finale
