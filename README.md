# Camp Wildwood

A shareable Dimensions Math 2B learning game with a customizable 3D woodland camp.
Open the GitHub Pages link without an account. Each nickname has its own camp,
math progress, purchases, and sports scores in that device's browser storage.

## Learn, practice, build, play

- All Chapters 8–15 are present (37 core missions), plus four optional Trailhead
  foundations missions. Lesson order and chapter locks remain in place, with a
  teacher override in My Report.
- Each mission teaches the strategy with recorded narration and worked models,
  then introduces the controls, guided practice, independent work, and an
  optional Adventure. Harder skills include another worked demonstration.
- Hints and the optional mathematical work mats count as supported practice;
  students still complete the mission and receive the same token rewards.
  Unfinished math missions resume with the same questions and entered work.
- A completed mission or full practice replay earns one token; each skill's
  first Adventure earns one extra token. Sports never spend or award math tokens.

## 3D camp and rewards (wildwood-3d1)

- A real perspective scene with an orbiting 360° camera, zoom buttons, and pinch
  zoom. Local 3D geometry builds the lodge, creek, bridge, trees, field, goals,
  tents, canoe, campfire, lanterns, and other owned objects.
- Ten camp plots; choose an item and a plot, tap a plot in the 3D scene, move or
  swap items, put them away, rotate in 45° steps, and choose three sizes.
- Choose lodge roofing and tent fabric. The soccer club has a saved nickname,
  two free team colors and two reward colors, plus optional striped turf, mint
  goal frames, stadium lights, and grandstands from the shop.
- Existing camps, tokens, six-plot layouts, purchases, badges, and mathematical
  mission save IDs are retained. Older three-shot soccer bests are preserved;
  the new five-shot shootout has its own personal-best records.

## Camp activities

The opening screen has a live 3D camp tour: a slow camera sweep, distant ridges,
birds, chimney smoke, moving water, and drifting clouds. Start adventure opens
the camper chooser immediately. Pause scenery freezes the entire title scene;
Calm visuals and system Reduce Motion start it still. The title demonstration
does not change a camper's camp, purchases, tokens, or learning record.

**Wildwood Shootout:** five shots against a moving goalkeeper. Tap the goal or
use six aiming buttons, watch the power meter, and kick. The ball follows a 3D
arc and the keeper dives. The ring awards an accuracy bonus. Cozy and Ranger
speeds are available, with optional steady power. Play uses an immersive overlay
with an exit button so the arena stays visible beside its controls.

**Creek Gate Rally:** owning the creek canoe opens an eight-gate run. Steer left,
middle, or right through approaching gold gates. The first gates are slower;
pause and resume at any time. Scores remain separate from math evidence.

The chapter-completion Trading Post and fraction sharing activities retain their
exact mathematical models.

## Rendering and device support

Three.js 0.180.0 and its SVGRenderer/Projector are bundled locally in `vendor/`
under the included MIT license. No graphics CDN, models, or account is required
at runtime. WebGL 2 enables hardware rendering, soft shadows, and materials.
A software renderer projects the same 3D geometry into SVG when WebGL is absent.
This path preserves camera movement and game animation with simpler lighting.

Calm visuals and the system Reduce Motion preference suppress decorative motion.
Essential sports motion remains, with steady power available. Scene resources
are released when leaving a screen; hidden or offscreen scenes stop updating.
The scene pixel ratio and animation rate are capped for tablet performance.

Hardware-accelerated rendering and physical iPad Safari still need a device pass.
Browser saves stay on that device/browser; clearing site data removes them.

## Verify and run

```sh
node --test tests/*.test.cjs
python3 -m http.server 8000
```

The dependency-free Node suite includes 335,000 generated math checks, mission
sequencing, supported evidence, rewards, profile isolation, save migration,
place-value conservation, sports rules and transactions, customization, and
construction checks against the actual Three.js scene geometry.

Deploy the complete folder to GitHub Pages or another static host. Keep
`index.html` at the root and include `audio/`, `assets/`, `css/`, `js/`, and
`vendor/`. See `QA_REPORT.md` for findings, curriculum sources, and test limits.
