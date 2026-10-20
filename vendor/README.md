# Third-party graphics code

Three.js 0.180.0, Copyright 2010–2025 Three.js Authors, MIT license.
See THREE-LICENSE.txt.

Sources: the npm package `three@0.180.0` distributed through jsDelivr:
- build/three.module.min.js
- build/three.core.min.js
- examples/jsm/renderers/SVGRenderer.js
- examples/jsm/renderers/Projector.js

Build files are unchanged. The two addon modules only change the `three` bare
import to `../three.module.min.js` and Projector's path to `./Projector.js` for
self-hosted relative module loading. No graphics CDN is used at runtime.
