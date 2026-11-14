# 🏯 Kumamoto Castle in AR: a scan-to-view WebAR model

Point your phone at the printed **Kumamoto Castle** picture ([`target.png`](target.png)). When it is
recognised, a short how-to panel appears, and on **OK** a full 3D model of the castle floats in front
of you over your live camera view. It is **not anchored** to the picture: turn it with one finger,
pinch to zoom, double-tap to reset. A panel at the top tells the story (when it was built, the
main keep, the curved walls, the rebuilding) and slides by itself every 10 seconds.

**Play locally:** `http://localhost:8133/` · **Without the picture:** `?demo=1` · **Without any camera:** `?preview=1`

| File | What it is |
|---|---|
| `index.html`, `js/app.js`, `js/scan.js` | The flow (camera → scan → how-to → viewer) and the MindAR image scanner |
| `js/castle.js` | The castle, built procedurally in metres: curved *musha-gaeshi* stone bases, black-board tiers, tiled roofs, chidori and kara gables, hip-and-gable crown with shachihoko, the small keep, connecting hall, entrance stair, bridge and fence |
| `js/stage.js` | Lights, shadows, camera and the turn / pinch / wheel controls |
| `js/data.js` | The sliding notes |
| `assets/kumamoto-castle.jpg` | The illustration used as the tracking picture |
| `target.png` / `targets.mind` | The picture to scan and its compiled MindAR target |
| `tools/make-target.html`, `tools/serve.ps1` | Rebuild the target (`?build=1`); local server (port 8133) |

Look: [Anatomy](https://github.com/wheresryan22/anatomy) sepia theme in `vendor/anatomy/`.
Version pins: `mind-ar@1.2.5` with `three@0.160.0`. Phones need HTTPS (e.g. GitHub Pages) for the camera.
