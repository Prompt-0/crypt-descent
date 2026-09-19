# Agent Guidelines for Crypt Descent (Gandharv v2.0)

Crypt Descent is a browser-native tactical roguelike dungeon crawler built with TypeScript, rot-js, Simplex Noise, and TailwindCSS.

---

## 🛠️ Verification & Test Commands
All code changes and optimizations must be verified with the automated test suite before opening a PR:
- **Run All Tests**: `npm run test` (executes `vitest run`)
- **Typecheck & Production Build**: `npm run build` (executes `tsc && vite build`)
- **Dev Server**: `npm run dev`

---

## 🏛️ Codebase Architecture & Key Modules
- `src/core/`: Game loop, turn scheduler, entity registration, state manager.
- `src/combat/`: Damage calculations, hit resolution, status effects, combat logs.
- `src/procgen/`: Simplex noise dungeon generation, cellular automata room carving.
- `src/fov/`: Precise field of view raycasting and lighting calculations.
- `src/render/`: Tile and canvas grid renderer.
- `src/ai/`: Monster behavior trees and pathfinding logic.
- `src/__tests__/`: Vitest test suites (43 tests covering simulation, combat, loot, pathfinding).

---

## ⚡ Performance Guidelines (For "Bolt" / Optimization Personas)
1. **Zero-Allocation Steady-State**: In hot game loops (render, combat ticks, FOV updates), avoid allocating fresh objects or arrays per frame. Pre-allocate and mutate cached structures (`this._cachedPos`, `this._reusableArray`).
2. **Canvas State Optimization**: Hoist `ctx.save()` / `ctx.restore()` out of repetitive entity render loops.
3. **Deterministic Combat**: Combat randomness must remain seedable or strictly adhere to damage formulas without breaking test assertions in `src/__tests__/combat.test.ts`.
