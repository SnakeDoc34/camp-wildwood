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
