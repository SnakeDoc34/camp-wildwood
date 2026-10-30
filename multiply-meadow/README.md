# Rivendell Trailblazers · version 2

A complete revamp of Multiply Meadow, hosted in the existing `multiply-meadow/` GitHub Pages directory. Blue-and-gold Rivendell Academy branding uses the user-supplied crest. This is a static browser game with no external runtime dependencies, accounts, analytics, backend, or real-money purchases.

## Experience

- Original 3D renderer with perspective projection, directional lighting, fog, animated jointed runner, dog, ATV, dirt bike, jetpack and mini jet. Uses WebGL when available and a reduced-detail software 3D renderer when unavailable.
- Three themed courses: Founders Forest, Copper Canyon (6 blooming facts + 180 gold), Summit Skyline (15 blooming facts + 400 gold). Original geometry includes hills, trees or canyon formations, rocks, flowers, creek crossings, wooden bridges, and checkpoint arches.
- Eighteen-card multiplication trail, paced with short playable bursts: keyboard/touch steering and jumping, collectible flags, ground obstacles and flying rewards.
- Gear locker: five kit colors, goggles, cape, golden shoes, two finish effects, skin tones and short/ponytail hair. Equipment appears on the runner.
- Three independent local profiles. Original Multiply Meadow fact history, daily counts and coins carry over. New progress uses the existing `multiply-meadow-v1` localStorage key. Export/import is available; no automatic device sync.

## Incentive rules

| Correct-answer streak | Ride | Gate |
| --- | --- | --- |
| 3 | Dog, 5 seconds | 3 distinct fact families |
| 6 | ATV, 6 seconds | 5 distinct families |
| 9 | Dirt bike, 7 seconds | 7 distinct families |
| 12 | Jetpack, 8 seconds | 8 distinct families and 8 growing families |
| 15 | Mini jet, 10 seconds | Summit mode, 12 blooming families, 8 established challenge families recalled, at least 90% session accuracy |

Hints and errors reset the current streak without removing earned possessions. Each streak threshold triggers once in that streak. Standard seven-second trail segments occur at six-card checkpoints if no special ride was earned at that checkpoint. Children can skip a burst.

Optional speed bonuses unlock with 6 established (stage 2+) facts: +25 points for an independent correct recall within five seconds, only on an established fact, once per family per run. The timer counts upward, with no deadline. Hidden-tab time is excluded. Speed never advances memory stages or bypasses top-ride gates.

An independent recall earns 100 points plus a capped streak bonus; other attempts earn 15 effort points. Correct streaks also earn more gold through the original engine. Vehicles add score/distance and flag collections add game points, without adding mastery credit. Personal bests require a full 18-card run and are separated by course, mode, table selection and speed setting. A new best receives a results celebration.

Daily: 18 attempts grant 15 gold once per local calendar date. Attendance requires a full run. Three different practice dates within a rolling seven days grant 40 gold at most once in seven days. Daily streaks are displayed; missing a date never removes possessions.

Mastery bonus: finish 16/18 independently correct with at least 8 established families, plus either a 12-answer streak or 5 fluent recalls. Earn at most one ticket per date. A ticket grants a 20-second jetpack flag run, with at most 15 bonus gold and no mastery changes.

## Learning and evidence

The original spaced deck is retained: canonical reversed-factor families; at least three intervening families; errors/hints return sooner; independent due recalls advance at most once per date toward intervals of 1/3/7/14/30 days. New working sets usually contain at most three fresh families; cold starts fill eight to permit delays. Blooming requires three scheduled successful review dates. Summit removes 0/1/2 factor shortcuts and uses factors 3–12 anchored in tables 6/7/8/9/11/12.

- IES elementary mathematics intervention guide summary: https://ies.ed.gov/ncee/WWC/Docs/PracticeGuide/WWC-PraxGuide-Elementary-Math-Summary-508c.pdf
- Li, Hew & Du (2024), gamification motivation meta-analysis: https://link.springer.com/article/10.1007/s11423-023-10337-7
- IES spacing/retrieval guide: https://ies.ed.gov/ncee/wwc/PracticeGuide/1

Evidence informs brief fluency practice after strategy knowledge, systematic review, personal improvement and learner choice. Exact thresholds, values and timing are design defaults, not an empirically optimized formula. This game has not undergone a learning-outcome study.

## Verification

`node test-engine.cjs` covers the original memory engine (11 checks, including 300 randomized mixed-answer rounds). `node test-trails.cjs` covers rides and mastery gates, Summit facts, speed eligibility, partial/full records, idempotent completion, ticket caps, weekly attendance and migration (11 checks).

Browser QA: complete 18-card run (16 independent answers, 1 incorrect, 1 hinted), dog/ATV/bike reward triggers, burst entry/exit, results and personal-best record, gear purchase/equip and persistence after reload, phone-width home/practice layout. All five ride models were inspected through a preview-only QA route; that route is excluded from deployment. This test browser had no WebGL, so the software renderer was exercised; GPU WebGL performance and physical iOS/Android device behavior require real-device testing.

Deployment contains index.html, engine.js, trails-engine.js, trail-scene.js, trail-app.js, trail-style.css, trail-icon.svg and assets/crest.png. No build required. `dist/` is the local source of deployable files. Old unreferenced files are retained in the existing repository.
