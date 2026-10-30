# Multiply Meadow

A responsive, static multiplication game for ages 8–9. Hosted as a self-contained game at `multiply-meadow/` in the Camp Wildwood GitHub Pages repository. All game code and assets are local; no accounts, analytics, ads, purchases, server or external runtime dependencies.

## Play

Select tables 0–12. Each 18-card round practices eight canonical fact families with delayed revisits, helpful feedback, and array/strategy hints. Familiar facts and their reversals share a schedule. Choose one of three browser-local explorer profiles. Effort earns sunstones, independent correct answers earn more, and an 18-attempt daily goal earns one 15-sunstone bonus per local calendar day. Eight finite decorations can be bought once each and placed/stored in the meadow.

Parents can view a 13×13 fact garden, change tables, export/import a profile, and read teaching guidance. Progress stays in localStorage, with no automatic device sync. Exported JSON is validated on import. Reset affects only the selected profile and requires confirmation.

## Learning rules

- Typed recall rather than multiple-choice recognition; no speed timer or speed-based scoring.
- Minimum three intervening fact-family attempts, including reversed-factor equivalents.
- Incorrect/hinted cards are eligible at turn +4. Correct cards are scheduled for turn +6 and, after further successes, +9. Familiar filler cards may appear sooner when needed, always respecting the minimum gap.
- At most three new families are selected per session when enough learned families exist. A cold start fills eight slots with new families to make spacing possible. Due reviews are prioritized, with five slots normally reserved for them.
- An independent correct answer can advance a fact once per local calendar date, only when due. Review intervals are 1, 3, 7, 14, and 30 days. Lapses lower the stage and make the fact due today. Hints never count as independent mastery.
- A fact is marked blooming at stage 3, requiring scheduled successful recall across at least three different dates. Blooming is a progress label, not a guarantee of permanent retention. There is no penalty for missing a day.
- A fixed session can end with a missed fact awaiting another attempt. It remains due for the next session. Larger backlogs may require multiple sessions.

The gaps and goal length are practical defaults, not experimentally established optimal parameters. This game has not been evaluated as an intervention.

## Teaching

Use real equal groups and arrays first. Begin with 0/1/2/5/10 and add tables as confidence grows. Use doubles, five-groups-plus-more and ten-groups-minus-one strategies. Practice four to six relaxed minutes most days. Rotate arrays to demonstrate commutativity. Let children explain their thinking, then gradually encourage direct recall without removing access to hints.

Alternative themes could reuse the same learning engine: building a spacecraft one part at a time, or furnishing a pet habitat. The meadow version uses visual growth and finite collectibles so rewards remain connected to learning.

## Evidence

- IES, *Organizing Instruction and Study to Improve Student Learning*: https://ies.ed.gov/ncee/wwc/PracticeGuide/1 — spacing, retrieval, and connecting concrete/abstract representations.
- Ophuis-Cox, Catrysse & Camp (2023), *The effect of retrieval practice on fluently retrieving multiplication facts in an authentic elementary school setting*: https://doi.org/10.1002/acp.4141 — flashcard retrieval outperformed restudy in 48 second-grade pupils, including the one-week test.

## Development and checks

`dist/` is the deployable static content; the Pages copy places its contents under `multiply-meadow/`. No build is required. Open through a static HTTP server. Run `node test-engine.cjs` to check scheduling, scoring, daily behavior and persistence serialization.

Browser QA completed: an entire 18-card round with one incorrect and one hinted answer, spacing inspection, daily bonus/results, purchase, persistence after reload, 169-cell fact map, nickname, independent second profile, and 390px embedded viewport checks. Engine suite: 11 checks including 300 randomized rounds with mixed outcomes. App supports keyboard use, accessible labels, and reduced-motion preferences. Real iOS/Android device testing was not performed.
