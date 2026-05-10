<<<<<<< HEAD
# La Rioja Agro-Tycoon — Visual Pack

Este paquete está preparado para desplegarse en Cloudflare Pages con Vite + React + Three.js + React Three Fiber.

## Qué incluye

- Escena isométrica con `Canvas`, `Suspense`, `AdaptiveDpr` y `AdaptiveEvents`
- Cielo dinámico tipo HDR con gradiente de atardecer
- Terreno procedural con cerros, planicies y lecho de río
- Parcelas con viñedos y olivares instanciados
- Bodegas, fábricas, silos y depósitos
- Tractores, cosechadoras y trabajadores
- Postprocesado con Bloom, SSAO, Vignette y Color Correction
- Texturas generadas localmente para mantener el peso bajo control

## Deploy en Cloudflare Pages

1. `npm install`
2. `npm run assets`
3. `npm run build`
4. Subí `dist/` a Cloudflare Pages o usá `wrangler pages deploy dist`

## Observaciones de arquitectura

- Los archivos estáticos de un sitio en Cloudflare Pages tienen un límite de 25 MiB por archivo.
- Para archivos más grandes, Cloudflare recomienda usar R2 y servirlos desde un bucket público.
- `public/_redirects` ya incluye el fallback para SPA.

## Siguientes mejoras visuales sugeridas

- Sustituir las texturas procedurales por un set PBR comprimido (KTX2) de bajo peso
- Agregar modelos GLB optimizados para bodegas, silos, tractores y cosechadoras
- Hacer bake de algunos elementos estáticos para reducir draw calls
- Añadir LOD por distrito y niebla volumétrica suave sobre los valles
=======
Link al juego: https://rioja-agro-tycoon.lovable.app/


---

## Combined visual + gameplay build

This repo package includes the visual scene pack plus the gameplay layer and can be deployed on Cloudflare Pages.
>>>>>>> ebecbc2 (feat: full game (visual + gameplay integrated))
