# Rioja Tycoon — Gameplay Patch

Este paquete agrega la capa jugable encima de la escena R3F actual.

## Qué incluye
- Estado global con Context API
- Menú principal
- HUD
- Build menu
- Pause menu
- Selección de tiles por click
- Construcción y mejora de edificios
- Economía, producción y workers
- Auto-save en localStorage
- Exportación de guardado a JSON

## Archivos a copiar
- `src/App.tsx`
- `src/components/PostFX.tsx`
- `src/game/*`
- `src/components/ui/*`

## Nota
El patch asume que siguen existiendo estos archivos del pack visual:
- `src/components/Sky.tsx`
- `src/components/World.tsx`
- `src/components/Tile.tsx`
- `src/components/Buildings.tsx`
- `src/components/Vehicles.tsx`
- `src/components/Workers.tsx`
- `src/lib/noise.ts`
- `src/data/names.ts`
