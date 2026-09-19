# Crypt Descent (Gandharv v2.0) ⚔️

> **A deep, tactical, browser-native roguelike dungeon crawler built with TypeScript, rot-js, and procedural Simplex Noise generation.**

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)
![Vitest](https://img.shields.io/badge/Vitest-3.0-green.svg)

Crypt Descent is a turn-based procedural dungeon crawler combining classic ASCII/tile hybrid aesthetics with modern roguelike mechanics. Descend through increasingly perilous crypt depths, battle hostile denizens, uncover ancient relics, master character class archetypes, and survive procedural subterranean perils.

---

## 🕹️ Gameplay Features

- **Procedural Crypt Generation**: Level layouts synthesized using Simplex Noise and Cellular Automata (`rot-js`) for organic caverns, interconnected rooms, and atmospheric hazards.
- **Dynamic Field-of-View & Lighting**: Precise raycasting shadowcasting with fog-of-war discovery and light sources.
- **Deep Turn-Based Combat**:
  - Distance-based attack resolution, hit chance formulas, armor mitigation, critical hits, and elemental damage types.
  - Multi-tier enemy AI with patrol, aggressive pursuit, flanking, and defensive retreat states.
- **Class & Skill Trees**: Choose distinct character classes with unique passive proficiencies, active mana-cost abilities, and dynamic stat scaling.
- **Loot & Relic Synergy**: Procedural equipment drops (weapons, armor, scrolls, potions, artifacts) with rarity tiers and game-changing relic perks.
- **Dungeon Economy**: Discover crypt merchants, trade gold for supplies, gamble on unidentified items, and upgrade gear.
- **Synthesized Audio Engine**: Zero-asset, Web Audio API sound synthesizer generating procedural impacts, footfalls, spell casts, and ambient crypt tones.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- `npm`

### Development
```bash
# Clone the repository
git clone https://github.com/Prompt-0/crypt-descent.git
cd crypt-descent

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build & Testing
```bash
# Run 43 automated simulation, pathfinding, and combat tests
npm run test

# Compile production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🧱 Architecture

```
crypt-descent/
├── src/
│   ├── ai/          # Monster behavior trees and sensory logic
│   ├── audio/       # Web Audio API procedural sound synthesizer
│   ├── classes/     # Player class archetypes and growth curves
│   ├── combat/      # Damage formulas, hit resolution, and status effects
│   ├── core/        # Game loop, turn scheduler, and state management
│   ├── entities/    # Actor base classes, player, and monster manifests
│   ├── fov/         # Precise field of view raycasting
│   ├── items/       # Weapons, armor, potions, and inventory management
│   ├── procgen/     # Cellular automata and Simplex dungeon algorithms
│   ├── relics/      # Synergistic passive relic effects
│   ├── render/      # High-performance grid and canvas renderer
│   ├── shop/        # In-dungeon merchant transactions
│   ├── skills/      # Active spells, cooldowns, and targeting
│   └── __tests__/   # Comprehensive Vitest simulation test suite
└── package.json
```

---

## 📜 License

MIT License. Open source and free to explore.
