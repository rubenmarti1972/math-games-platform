# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:4200)
pnpm start        # or: ng serve

# Production build (output: dist/math-games-platform/)
pnpm build        # or: ng build

# Run tests
pnpm test         # or: ng test

# Run a single test file (Karma)
ng test --include="**/game.service.spec.ts"
```

> Node version pinned to **20.19.5** (see `engines` in `package.json`). Package manager: **pnpm**.

---

## Architecture

The app is an **Angular 20 standalone-components** project (no NgModules). All components use `standalone: true` and are lazily loaded via the router.

### Top-level structure

```
src/app/
  app.routes.ts          # Root router: '/' → World3d, '/games/*' → game shells
  app.config.ts          # ApplicationConfig (provideRouter only)
  game-world/            # Immersive entry points (Three.js scenes)
  games/                 # Game logic + per-game sub-apps
  pages/                 # Shared page-level components (e.g. games list)
  core/                  # App-wide services (GameCatalogService)
  shared/                # Reusable UI components
src/styles/              # SCSS design tokens (variables, mixins, layout, components)
src/types/               # Global TS declarations (three.d.ts)
```

### Game-World layer (`game-world/`)

The root route (`/`) renders **`World3dComponent`** — a Three.js 3D world loaded at runtime from jsDelivr CDN. Users click on floating island portals to navigate to games. Each island maps to a `PortalRoute` (`/games/othello`, `/games/panda4x4`, `/games/colores`).

`OthelloAdventureComponent` is the layout shell wrapping the Othello sub-app.

### Games layer (`games/`)

Each game lives in its own folder and is effectively a **self-contained mini-app** with its own routes, services, and components:

| Game | Path | Notes |
|------|------|-------|
| **Othello** | `games/othello/` | 6×6 Reversi variant; has lobby, 9+ puzzle "retos", PvP/CPU modes, online mode |
| **Panda 4x4** | `games/panda4x4/` | Logic/pattern puzzle; minimal single-route setup |
| **Colores** | `games/colores/` | Multi-level colour-mixing math challenge |

The game registry (`games/games.registry.ts`) is the single source of truth for game IDs, titles, routes, and difficulty levels. `GameCatalogService` (`core/`) wraps access to the older `games/data/games.data.ts` catalog.

### Othello internals

- **`GameService`** — core board state as RxJS `BehaviorSubject` streams (`board$`, `currentPlayer$`, etc.). Holds all "reto" (puzzle challenge) setup methods (`applyReto1()` … `applyReto9()`). Supports a `'dual'` cell state (wildcard pieces).
- **`GameModeService`** — tracks `pvp` vs `cpu` mode.
- **`GameOnlineService`** — separate service for the online multiplayer board state (simpler, no CPU logic).
- **`Variant2GameService`** — variant board logic used by retos 9 & 10.
- Components under `pages/`: lobby, game-board, variant boards, instructions, move-history, score-board, player-turn-indicator, controls-panel, settings.
- `three/othello-3d.component` — optional Three.js 3D board view.

### Styling conventions

Global SCSS design tokens live in `src/styles/`:
- `variables.scss` — color palette (`$color-primary: #0f2a44`, `$color-secondary: #4da6ff`, `$color-accent: #ff9f1c`), font stacks
- `mixins.scss`, `layout.scss`, `components.scss` — shared helpers

Inline styles use `inlineStyleLanguage: "scss"` (configured in `angular.json`).

### TypeScript config

Strict mode is fully enabled (`strict`, `noImplicitOverride`, `strictTemplates`, etc.). Target is **ES2022**. Module resolution: `bundler`.
