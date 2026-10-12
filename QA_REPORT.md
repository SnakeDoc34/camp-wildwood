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

These changes are prepared locally. Browser-rendered layout and physical iPad
verification remain pending; static source checks are not visual certification.

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

The mission tests use a lightweight DOM adapter. Live browser checks are recorded
separately after deployment; they are not a substitute for physical iPad trials.

## Remaining work

- Publication checkpoint, October 12: the corrected files are recovered and all
  23 automated regression tests pass. GitHub rejected both Git Trees and Contents
  writes with HTTP 403, `Resource not accessible by integration`; the connection
  returned no app installations. The public site is still the pre-audit version at
  commit `5cf15a114a2676d1049690b29802b3f3086e699a`. This is an access blocker,
  not a failed mathematical test. No live verification of the patch is claimed.
- This is a correction of the existing two-chapter milestone. It does not cover
  the remaining 2B chapters or every assessment structure, such as cumulative
  multi-step problems, number-pattern review, or contextual leftovers.
- Revised demonstrations currently use on-device narration. Fresh matching
  Melody recordings can replace it without changing the mathematics.
- Physical iPad Safari, Home Screen offline behavior, and cross-browser layout
  still need device trials. There is no service worker in this milestone.
- Further visual design should preserve mathematically precise diagrams and
  readable working areas. The broader camp artwork refresh is a later phase.

## Resume in three checkpoints

1. **Audit and correct instruction — complete locally.** Recovered the prior
   staged edits, reviewed all 12 targets against the publisher's Chapter 8 letter
   and Chapter 9 instructor samples, and checked the supplied assessments.
2. **Release and verify — pending GitHub write access.** Publish the tested files
   together, retaining existing audio assets and profile identifiers. Then test
   both division activities in the live browser, hint/retry scoring, pause/refresh
   recovery, and an actual iPad. Record the release commit and browser results.
3. **Visual improvement — implemented locally, verification pending.** Original
   camp artwork, clearer activity layouts, native navigation controls, and
   responsive styles are included in qa2. Finish browser and iPad review after
   publication. Chapters 10–15 remain outside this existing milestone.

The recovery patch includes only source changes, the QA report, and regression
tests; it does not publish the supplied textbook scan or any camper's saved data.
