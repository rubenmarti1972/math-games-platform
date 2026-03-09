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

---

# CONTEXTO DEL PROYECTO

Estoy desarrollando una plataforma web para aprender matemáticas jugando.

## Stack técnico
- **Frontend:** Angular 20 (standalone components, signals, inject())
- **Node:** 20.19.5
- **Backend/CMS:** Strapi 5 (aún no instalado, hay que configurarlo)
- **Gestor de paquetes:** npm

## Estructura actual
El proyecto Angular está en una sola carpeta raíz. Ya existe:
- `home/landing` — componente de pantalla de inicio
- Al menos un componente de juego o ejercicio matemático
- Rutas configuradas en el router

**No toques ni elimines lo que ya existe.** Analízalo primero y adáptate a ello.

---

# PASO 1 — DIAGNÓSTICO

Antes de hacer cualquier cambio:
1. Lee toda la estructura de `src/`
2. Lista los componentes, servicios, rutas y módulos existentes
3. Identifica qué sigue las buenas prácticas de Angular 20 y qué habría que mejorar
4. Muéstrame un resumen del diagnóstico antes de continuar

---

# PASO 2 — ARQUITECTURA PROPUESTA

Propón y crea (si no existe) la siguiente estructura de carpetas:

```
src/
├── app/
│   ├── core/
│   │   ├── services/        # auth, api, storage
│   │   ├── guards/          # auth, role
│   │   └── interceptors/    # token, errors
│   ├── shared/
│   │   ├── components/      # botones, tarjetas, modals reutilizables
│   │   ├── pipes/
│   │   └── directives/
│   ├── features/
│   │   ├── home/            # ya existe, revisar
│   │   ├── auth/            # login, registro
│   │   ├── dashboard/       # progreso, estadísticas
│   │   ├── games/           # ejercicios, ya existe algo
│   │   └── leaderboard/     # ranking
│   └── app.routes.ts
```

---

# PASO 3 — STRAPI: INSTALACIÓN Y CONFIGURACIÓN

En la misma raíz del proyecto, crea una carpeta `/backend` e instala Strapi 5:

```bash
cd backend
npx create-strapi-app@latest . --quickstart
```

Luego crea los siguientes **Content Types** en Strapi:

| Nombre        | Campos principales                                                  |
|---------------|----------------------------------------------------------------------|
| `Ejercicio`   | titulo, enunciado, tipo (opcion_multiple/completar/arrastrar), nivel, categoria, opciones (JSON), respuesta_correcta, explicacion, puntos_xp |
| `Categoria`   | nombre, descripcion, icono, color                                    |
| `Nivel`       | nombre (Primaria/Secundaria/Bachillerato), orden, descripcion        |
| `Logro`       | nombre, descripcion, icono, condicion, puntos_requeridos             |
| `Progreso`    | usuario, ejercicio, completado, correcto, fecha, tiempo_segundos     |

---

# PASO 4 — SERVICIOS ANGULAR (conexión con Strapi)

Crea los siguientes servicios en `core/services/` usando `HttpClient` con signals:

- **`api.service.ts`** — base URL configurable, métodos genéricos GET/POST/PUT/DELETE
- **`auth.service.ts`** — login, registro, logout, token JWT, usuario actual como signal
- **`ejercicios.service.ts`** — obtener por nivel, categoría, aleatorios
- **`progreso.service.ts`** — guardar resultado, obtener historial, calcular XP total
- **`logros.service.ts`** — verificar logros desbloqueados, obtener todos

Configura el `HttpClient` con interceptor para añadir el JWT de Strapi automáticamente.

---

# PASO 5 — FUNCIONALIDADES A IMPLEMENTAR (por fases)

### Fase 1 — Base (empezar aquí)
- [ ] Módulo de autenticación completo (login + registro) conectado a Strapi
- [ ] Guard de rutas para proteger páginas privadas
- [ ] Servicio API base con interceptor JWT
- [ ] Revisar y mejorar el home existente

### Fase 2 — Núcleo del juego
- [ ] Refactorizar/mejorar el componente de ejercicio existente
- [ ] Motor de juego: mostrar pregunta → validar → feedback → siguiente
- [ ] 3 tipos de ejercicio: opción múltiple, completar resultado, arrastrar y soltar
- [ ] Servicio de XP y puntuación en tiempo real

### Fase 3 — Progreso y gamificación
- [ ] Dashboard personal con estadísticas y gráficas
- [ ] Sistema de logros/insignias
- [ ] Ranking/leaderboard global y por nivel

### Fase 4 — UX y polish
- [ ] Animaciones con Angular Animations
- [ ] Diseño responsive mobile-first
- [ ] Sonidos y efectos de retroalimentación
- [ ] Modo oscuro

---

# REGLAS GENERALES

- Usa **Angular 20 moderno**: standalone components, signals, `inject()`, `input()`, `output()`
- **Sin NgModules** a menos que sea estrictamente necesario
- Tipado estricto con TypeScript, sin `any`
- Nombres en **español** para variables de dominio (nivel, ejercicio, puntaje)
- Comenta el código en español
- Antes de crear un archivo nuevo, verifica si ya existe algo parecido
- Implementa **Fase 1 completa** con código funcional antes de pasar a la siguiente
