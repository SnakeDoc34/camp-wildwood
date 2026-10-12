# Dimensions Math 2B math and teaching audit

Release `dm2b-qa2`, October 12, 2026. Scope: all 12 implemented skill targets in
Chapters 8 and 9. Chapters 10 through 15 are still placeholders.

## Findings and corrections

| Finding | Correction |
| --- | --- |
| Adding-tens examples split the addend in half and often called the resulting number a whole hundred. Some splits also introduced ones into a tens lesson. | Generate a genuine next-hundred bridge and a remaining amount in whole tens. Other tens questions explicitly preserve the ones and use tens facts. |
| Adding-ones practice always needed exactly one to reach the next ten. | Vary the needed part and teach splitting the addend. Include additions that do not require bridging. |
| Some addition results extended beyond 1,000. | Keep this chapter's generated totals within 1,000 and all answers nonnegative whole numbers. |
| Multiplication fact hints mainly relied on skip-counting; factor descriptions were inconsistent. | Use known facts for 2, 5, and 10, doubling, and adding or removing groups. Explain reordered factors as equivalent totals, with rows and columns in the demonstration. Counting remains a valid concrete introduction to equal groups. |
| Division captions described grouping, but diagrams represented sharing. | Show separately labeled models for both meanings, each with the same total and the correct number or size of groups. Answers name counters per group or groups. |
| Guided division created an answer box without usable entry controls. | Both sharing and grouping activities now finish with a keypad and keyboard entry. |
| Correct answers advanced automatically before the explanation could be read. | Keep the worked explanation visible and require Continue. Disable completed answer controls and prevent duplicate recording. |
| Using a hint still counted as independent success; badges could be earned in one visit. | Assisted answers still complete missions and earn rewards. New badges use varied first attempts without help across two visits. Existing earned badges remain intact. |
| Challenges could introduce untaught operations or the fours table while learning threes. | Limit challenges to the current target and completed targets. |
| The advertised Adventure bonus was not paid. | Award a one-time bonus per target, with repeat-completion protection. |
| Recorded clip keys had an extra prefix, and delayed audio fallbacks could restart after navigation. | Resolve legacy audio names, cancel outdated playback callbacks, and use current spoken captions for revised demonstrations. |
| Refreshing lost unfinished work. | Save each profile's active missions, questions, hint state, entered digits, and counter arrangements. Retain the existing save key and stable target IDs. |
| Division's early hints did not explicitly connect the unknown quantity to multiplication. | The second hint uses `divisor × ? = total` for sharing and `? × group size = total` for grouping; final checks preserve that meaning. |
| The displayed hint disappeared when returning to an unfinished question. | Restore the most recently requested hint and retain its assisted status. |
| A correct method could look like the only permissible strategy. | Add optional notes on direct ones addition, unequal parts for a hundred bridge, why 100 fits compensation, and subtracting from the 100 part of the whole. |

## Visual and interaction pass

- New original woodland illustration for the title screen and camp header;
  optimized as a 657 KB WebP. Scenery does not encode mathematical quantities.
- Two active trail cards with mission progress; six planned chapters are placed
  in a separate Future trails disclosure. No new chapters are claimed complete.
- Dedicated question and answer areas, a visible lesson phase, quieter colors,
  larger tap controls, and narrower-screen layouts at 900 and 600 pixels.
- Native buttons for trails, skills, and selecting campers. The camper button
  opens profile selection while saving the current mission to the original camper.
- Directional number-line jumps, connected number-bond parts, and a key showing
  the known rows and additional row in multiplication arrays.
- Visible keyboard focus and reduced-motion rules. Artwork has alternative text;
  mathematical counter quantities remain generated from the actual numbers.

These changes are published. Desktop Chrome rendering and representative live
mission flows have been checked. Physical iPad Safari and narrow-screen device
verification remain pending; desktop checks do not certify other devices.

## Curriculum alignment

The Chapter 8 activities use number bonds, making the next ten or hundred,
known place-value facts, and compensation. A correction after adding too much
subtracts the excess; a correction after subtracting too much adds it back.
These are available strategies rather than a claim that every problem requires
one prescribed procedure.

Chapter 9 distinguishes the number of groups from the quantity in each group.
Multiplication fact practice derives unfamiliar facts from known facts.
Division uses related multiplication facts and separately models sharing and
grouping. Exact counters replace truncated emoji quantities. A bar model is not
required for every simple one-step equal-group problem.

Authoritative sources reviewed:

- [Singapore Math Grade 2 Letter Home 8](https://singapore-math.s3.us-west-2.amazonaws.com/BLMs/DM_2_LETTERHOME_8.pdf), mental calculation strategies.
- [Dimensions Math Home Instructor's Guide 2B sample](https://singapore-math.s3.us-west-2.amazonaws.com/Samples/SP_DM_2HIG_B.pdf), Chapter 9, printed pages 31–32 and 35–38: factor order, known-fact strategies, counters, and division meanings.
- [Dimensions Math Teacher's Guide 2B sample](https://singapore-math.s3.us-west-2.amazonaws.com/Samples/sp_dmTG2B.pdf), printed pages 38–44: arrays, related facts, and the two division situations.
- Parent-supplied 2B assessment pages for the range and structures of practice problems. No textbook scans are included in this repository.

## Verification

Before changes, 20,000 generated samples had numerically correct answer keys.
However, in 1,000 adding-tens equivalence samples, 957 hints named a number that
was not a whole hundred, and 488 splits were not whole tens. Across the full
baseline sample, 195 generated answers exceeded 1,000. These results distinguish
arithmetic correctness from teaching correctness.

The dependency-free Node suite checks 120,000 new generated cases across 24
families, with independent answer calculations from displayed questions. It also
checks arithmetic equalities in explanations, boundary values, exact diagram
counts, entry controls for both division meanings, assisted versus independent
evidence, completion rewards, profile isolation, saved work, legacy progress,
backup recovery, and cancellation of old narration. Run:

```sh
node --test tests/math-qa.test.cjs
```

All 23 tests passed after the second teaching and visual pass. Added checks cover
missing-factor hints by division meaning, exact calculations in strategy notes,
restored hints, playable versus planned trails, switching campers with paused work,
and the question/control layout structure. JavaScript syntax, unique HTML IDs,
local asset existence, illustration dimensions, and patch whitespace also pass.

The mission tests use a lightweight DOM adapter. They are supplemented by the
live browser checks below; neither substitutes for physical iPad trials.

## Live release verification, October 12

- GitHub reauthorization restored file writes. Released commit
  `3c204a2417a8e7ab888a1cfaa9f90a3f1f2ba5bc`; its tree exactly matches the tested
  checkout, including the binary illustration. The update used the previous
  branch head as a guard and did not force-push.
- GitHub Pages run `38269279042` completed successfully. The public site displays
  `dm2b-qa2` at https://snakedoc34.github.io/camp-wildwood/.
- All 12 demonstration screens were inspected in desktop Chrome. Number lines,
  number bonds, compensation, arrays, and both division models rendered. Sampled
  page widths of 1,348–1,363 CSS pixels had no horizontal document overflow.
- Completed Adding Tens, Division by 3, Division by 4, and Subtracting 97–99,
  including the challenges: 28 live questions answered using independent
  arithmetic, both a tapped keypad and keyboard entry, and the expected eight
  tokens awarded across four first completions and their challenges.
- Division demonstrations each contain exactly 24 counters. Threes show 3 groups
  of 8 for sharing and 8 groups of 3 for grouping; fours show 4 groups of 6 and
  6 groups of 4. Answer units match the question.
- A wrong division answer could be retried. The next hints displayed the correct
  missing-factor multiplication fact. Correct explanations remained visible
  until Continue, with completed answer controls disabled.
- A refreshed mission resumed the same adding-tens question and requested hint.
  Switching to a second test camper preserved the original camper's two entered
  digits and question while the second camper retained zero progress and tokens.
- The live report counted the hint-assisted first trial as 0/1; the first
  completed mission recorded 4 independent attempts out of 5. Successful assisted
  work still received mission rewards.
- A three-token decoration changed the displayed balance from eight to five,
  became Owned, and appeared in the camp. Sound off did not block completing work.
- No game errors were observed during these flows. Physical iPad, touch keyboard,
  Safari narration, and narrow portrait/landscape layout trials are still needed.

## Remaining work

- Publication and the desktop live-browser pass are complete. The earlier 403
  connection issue was resolved by reauthorization; all 23 automated tests pass.
- This is a correction of the existing two-chapter milestone. It does not cover
  the remaining 2B chapters or every assessment structure, such as cumulative
  multi-step problems, number-pattern review, or contextual leftovers.
- Revised demonstrations currently use on-device narration. Fresh matching
  Melody recordings can replace it without changing the mathematics.
- Physical iPad Safari, Home Screen offline behavior, and cross-browser layout
  still need device trials. There is no service worker in this milestone.
- Further visual polish should preserve mathematically precise diagrams and
  readable working areas. The illustrated camp refresh is included in this release.

## Resume in three checkpoints

1. **Audit and correct instruction — complete locally.** Recovered the prior
   staged edits, reviewed all 12 targets against the publisher's Chapter 8 letter
   and Chapter 9 instructor samples, and checked the supplied assessments.
2. **Release and verify — published; desktop pass complete.** The source and
   illustration were released together. Division entry, scoring, rewards,
   pause/refresh, and camper switching passed live checks. Finish actual iPad tests.
3. **Visual improvement — published; desktop pass complete.** Original
   camp artwork, clearer activity layouts, native navigation controls, and
   responsive styles are included in qa2. Finish narrow-screen and physical iPad
   review. Chapters 10–15 remain outside this existing milestone.

The recovery patch includes only source changes, the QA report, and regression
tests; it does not publish the supplied textbook scan or any camper's saved data.

## Interactive camp release: camp-build1

The math release and active mission version remain `dm2b-qa2`; this update changes
the camp/reward interface and keeps paused mission data compatible.

- Replaced the owned-icon strip with a live camp scene and six-place designer.
  Native buttons support selecting, placing, moving, swapping, and putting items
  away. Two starter gifts are free. Existing purchased decorations are migrated
  into open places without changing the balance or earned learning records.
- Added a four-token soccer kit, bench, and tent. The kit creates the field and
  opens a three-kick aiming activity. Best score and total goals are saved. Play
  has no effect on the token balance; choosing an open meadow retains the kit.
- Shop cards explain each item's use, show affordability, let the camper choose
  a savings goal, and offer Arrange/Play actions for owned items. Each purchase
  checks ownership again before charging. Purchased items are never destroyed
  when a place is reused; unplaced objects remain available in the backpack.
- Completion shows the current camp and goal progress. A fully solved six-question
  replay earns one practice token; a completion-step flag prevents another payout
  from the same mission. The first Adventure reward stays once per skill. Hint
  and independent-evidence rules are unchanged. No streak or timed incentive.
- Recorded the three-stage future plan in ROADMAP.md. Chapters 10–15 remain
  planned, with curriculum review required before they become playable.

All 32 automated tests pass: the original 23 checks, including 120,000 generated
math cases, and nine new tests for legacy item migration, placement/swapping,
invalid/unowned items, purchase balance and duplicate protection, goal persistence,
full versus incomplete replays, soccer limits/scoring, profile isolation, and
the designer's native controls. Syntax and patch whitespace checks also pass.

Live desktop Chrome validation passed for this release:

- Pages run `38280199385` successfully published commit
  `e575dd075668f2e75e8c18db3481263a7c90b91e`. The public game shows the new camp UI.
- A mission begun in qa2 retained its original question and entered digit after
  the new code loaded. Completed three first missions with their challenges
  and one full replay with its challenge: 28 visible questions answered using
  independent arithmetic. Rewards totaled seven tokens, with no repeated bonus.
- The soccer goal progressed from four needed tokens to two, then Ready to build.
  Buying the kit charged four tokens, built the pitch, and exposed Play in my camp.
  A later three-token flag purchase appeared in the scene and could be moved.
- Placed a starter tree using Enter, swapped tree/stones, put an item away, and
  restored it from the backpack. The purchased flag moved to the Right sideline.
- Played one soccer round with two correct aims and one missed cone. The round
  ended at 2/3, best score and lifetime goals were 2, and no tokens changed.
- Selected an Adventure tent savings goal, refreshed, and retained the goal,
  field, and placed items. Reopened the designer and retained soccer scores.
- A second camper had their own meadow, starter items, zero progress, and soccer
  savings goal. The original camper retained the field, flag, and chosen goal.
- Switched between Soccer field and Open meadow without losing the purchased kit.
  The whole soccer activity is optional and immediately available once purchased.
- A small follow-up clears purchase messages when entering the shop and makes
  the shop's goal button find and focus its item. Profile-isolation tests include
  the stale-message case. Item-count wording also handles one placed item.

Physical iPad Safari, touch behavior, narrow device layouts, on-device narration,
and offline use remain unverified.

## Follow-up release: dm2b-qa3 (October 12, 2026)

Requested by the parent after the qa2/build1 releases: confirm the math
progression against the publisher's sequence, teach each principle before its
section, add a second demonstration for the harder skills, lock later areas
until earlier ones are completed, and restore recorded narration where the
qa2 caption revisions had replaced it with on-device speech.

### Progression audit (verified, no reordering needed)

- Chapter 8 target order matches the publisher's Chapter 8 overview lesson
  list exactly: Adding Ones, Adding Tens, Making 100, Adding 97/98/99,
  Subtracting Ones, Subtracting Tens, Subtracting 97/98/99 (the game merges
  the two subtraction lessons into one mission, in the same position).
- Chapter 9 target order matches the Teacher's Guide 2B lesson list:
  Multiplication Table of 3, Multiplication Facts of 3, Dividing by 3,
  Multiplication Table of 4, Multiplication Facts of 4, Dividing by 4
  (the game's "Groups of" missions are the table-building lessons).
- Every mission still runs demonstration → controls → guided → independent →
  optional Adventure, and Adventure pools remain limited to the current and
  completed skills. A regression test now pins the target order.

### Trail-order locks with a teacher override

- A mission unlocks when the previous mission in its chapter is complete;
  Chapter 9 opens when all six Chapter 8 missions are complete. Completed
  and in-progress missions are always available (resume is never blocked).
- Locked skills show a lock and the reason ("Finish … first"); the locked
  chapter card explains the requirement. Engine.start refuses locked
  missions as a backstop.
- The Report screen gains a Teacher tools card: "Unlock all missions"
  restores free navigation for the whole device. The setting is stored
  separately (`campWildwood.settings`) and applies to every camper profile.
- Default for new devices is locked (the lesson order). Existing progress,
  purchases, and camp layouts are untouched; no save data migrates.

### Second demonstrations

Adding Tens, Adding 97/98/99, Subtracting 97/98/99, Division by 3, and
Division by 4 each gained a second worked demonstration (new numbers, same
strategy, rendered with the same exact diagrams) between the first
demonstration and the controls screen. Subtracting Ones & Tens already
demonstrates two worked examples (ones, then tens) and keeps its alternate
"subtract from 100" strategy note. Mission step validation, resume, and
progress dots handle the extra step; the engine version bump restarts any
mission that was mid-flight under qa2 (progress and rewards are kept).

### Narration restored in the recorded voice

- Eleven new Melody clips were recorded: the six revised qa2 demonstration
  captions (Adding Tens; Subtracting Ones & Tens; Multiplication Facts of 3
  and 4; Division by 3 and 4) and the five new second demonstrations.
- All twelve demonstrations and all five second demonstrations now play the
  recorded voice; on-device speech remains the fallback. New clips live in
  `audio/b1–b11.js` with exact file-name keys (no prefix aliasing needed).
  The six superseded qa1 recordings remain in the `a` chunks, unreferenced.
- A regression test resolves every referenced clip through the player's own
  lookup rule, so a future caption or file change cannot silently drop the
  recorded voice again.

### Verification

- 41 automated tests pass: the 32 qa2/build1 tests (updated only where the
  intended step layout or narration design changed) plus 9 new tests for
  lesson order, lock rules, chapter gating, resume-under-lock, the teacher
  override and its persistence, second-demonstration presence and math,
  and recorded-clip coverage for all 17 demonstrations.
- Physical iPad Safari verification remains outstanding, as before.

# Milestone 2 (dm2b-m2) — Money, Fractions, and camp rewards

## Curriculum mapping (verified before building)
Chapter 10 and Chapter 11 targets follow the publisher's 2B lesson order exactly. Money: Making $1 -> Counting Money -> Making Change (with conversions) -> Comparing Money -> Adding Money -> Subtracting Money (the book's two Practice lessons fold into Adventure pools). Fractions: Halves and Fourths -> Unit Fractions -> Writing Fractions -> Making 1 Whole -> Comparing Fractions. Problem structures were cross-checked against the parent-supplied assessment's printed item types (notation traps like $0.03 = 3 cents, ordering/comparing amounts, make-1-whole partners, unit-fraction comparison, shade-a-fraction) using parallel original problems — no assessment items were copied, and handwritten responses in the scan belong to another student and were not used.

## What shipped
- 11 new missions (23 total), 20 new parameterized families, sequential locks extended across chapters (Chapter 10 opens after Chapter 9; Chapter 11 after Chapter 10), teacher override unchanged.
- Exact money and fraction models: pictured bills/coins counted on from the largest value; equal-part circle and bar diagrams; an interactive "shade it yourself" bar for writing fractions.
- Amounts are computed in cents; entry answers type cents and display as dollars and cents ($4.60), matching the book's notation teaching.
- Four more second demonstrations (Making Change with $5, Subtracting Money by counting up, Writing Fractions on a circle, Comparing unit fractions) — nine total across the game.
- 15 new Melody narration clips (audio/c1-c15.js); all 32 demonstrations in the game now use the recorded voice. Audio scripts speak fractions as words ("three tenths") while captions keep numeric notation.
- Rewards and theme: a Woodland Field Guide — one critter friend per mission (23), shown in the guide, on the camp map, and in the session report; a Camp Festival readiness meter on the map; the Trading Post and Picnic Grove grow through restoration stages; finishing Chapter 10 unlocks a working checkout activity (make change for customers) and finishing Chapter 11 unlocks a picnic sharing board (cut and shade equal parts, with challenges) in Build My Camp.

## QA evidence
- 48/48 tests pass, including new independent oracles: 30,000 generated money problems and 30,000 generated fraction problems re-derived from the displayed question/picture (coin sums, price differences, shaded/total counts, cross-multiplied comparisons), plus the existing 120,000-problem Chapter 8-9 oracle.
- Money scope guards: counting to $20, adding/subtracting within $10, change answers never negative.
- Mission-completion test now covers all 23 missions; lock tests cover the Chapter 9->10 and 10->11 boundaries; the shade interaction test taps real segments and checks the exact-count rule.

## Addendum (dm2b-m2b): Melody reads the instructions too
The "How to play" step previously read the mission instructions with the device voice. All 23 missions now carry a recorded Melody instruction clip (audio/d1-d8.js, three clips per file), played automatically on the instructions step with a "Hear it" replay button — the same pattern as the demonstrations. Problem read-aloud remains device speech by necessity: problems are generated fresh for every camper (the no-repeat design), so there is no fixed text to record, and a static site cannot call a voice service without exposing a key in a public repository.

## Milestone 3 addendum (dm2b-m3): Chapters 12-15 + Camp Festival
Chapter order and targets follow the publisher's 2B lesson list exactly: Time (Telling Time, Time Intervals, A.M. and P.M.); Capacity (Comparing Capacity, Units of Capacity, Measuring); Graphs (Picture Graphs — scaled, Bar Graphs — scale of 1, Graph Questions); Shapes (Straight and Curved Sides, Polygons, Semicircles and Quarter-circles, Patterns, Solid Shapes). New engine machinery: exact analog-clock, bar-graph, picture-graph, shape, pattern, and container renderers, each verified for honesty in tests (the picture matches the data: hand angles, bar proportions, symbol counts). New answer types: free text, clock strings, elapsed minutes, computed values. Oracles re-derive answers from the rendered visuals: 28,000 time, 24,000 capacity, 24,000 graph, and 40,000 shape problems, all passing; total suite 54 tests. Completing all 37 missions opens the Camp Festival (celebration scene, closing Melody narration, printable Ranger certificate, report banner). All 14 new missions carry recorded Melody demonstrations and instructions, plus a second demonstration for Time Intervals. Missions lock sequentially across all eight chapters; the teacher override remains on the Report screen.
