# LynxHub Renderer (`src/renderer`)

This folder contains all renderer-side UI code (React + TypeScript) for:

- the main application window
- small auxiliary windows (context menu, loading, toast, share-screen picker, link preview)
- shared renderer services (IPC clients, Sentry boot, styles, shared providers/assets)

## Runtime map

| Area            | Purpose                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| `mainWindow/`   | Primary app UI, state, layout, pages, plugin composition.                                |
| `childWindows/` | Independent lightweight renderer apps for secondary windows.                             |
| `shared/`       | Cross-window renderer utilities: IPC wrappers, shared styles, assets, sentry, providers. |
| `*.html`        | Multi-entry build inputs used by electron-vite for each renderer window.                 |

## Boot sequence (main window)

Main entry: `src/renderer/mainWindow/index.tsx`

Actual order:

1. initialize storage cache once via IPC (`initializeStorage()`)
2. load module renderer code (`loadModules()`)
3. load extension renderer code (`loadExtensions()`)
4. read settings from cached storage (`collectErrors`, `addBreadcrumbs`, etc.)
5. configure root error handling and Redux store
6. render `<App />` inside providers and error boundaries

Root layout is in `src/renderer/mainWindow/App.tsx`:

- `UIProviders`
- `AppHooks`
- onboarding initializer
- extension-injected hooks
- background, title bar, main content, modals

## Main window architecture

### Feature layout

`mainWindow/` is split by responsibility:

- `components/`: reusable UI components and modal systems
- `features/`: heavy feature blocks (session browser/terminal/top bar flows)
- `layouts/`: shell structure (`titleBar`, `tabs`, `navBar`, `statusBar`)
- `pages/`: route-level pages (home, settings, plugins, dashboard, etc.)
- `hooks/`: app-level event wiring and side effects
- `redux/`: reducers, store setup, storage preloading
- `plugins/`: runtime module/extension composition

### State model

Main-window state uses Redux Toolkit plus plugin extension reducers:

- static reducers defined in `redux/reducers/*`
- preloaded state built from storage cache in `redux/store.ts`
- extension reducers injected from `plugins/extensions/loader.ts`
- Sentry Redux enhancer enabled when `collectErrors` is true

Module card data is managed via `useSyncExternalStore` in
`mainWindow/plugins/modules/index.ts`, enabling reactive shared module state
outside Redux for plugin-loaded cards.

## Plugin runtime in renderer

Renderer loads two plugin classes:

### Modules (cards)

- loader: `mainWindow/plugins/modules/index.ts`
- dev mode: tries local alias `@lynx_module/renderer`
- production: imports module entries from plugin addresses returned by IPC
- applies disabled-card filtering from storage and rebuilds card indexes/search data

### Extensions (UI injections)

- loader: `mainWindow/plugins/extensions/index.ts`
- API registry: `mainWindow/plugins/extensions/loader.ts`
- dev mode: tries `@lynx_extension/renderer/Extension`
- production: registers remotes via Module Federation and loads each extension entry
- one failing extension does not block others

Extensions can contribute:

- title/status/nav bar UI
- page customizations
- modal replacements/additions
- custom hooks
- additional reducers
- event listeners via emitter-backed extension events API

## Child windows

Each child window is its own renderer app with independent entry:

- `childWindows/contextMenu`
- `childWindows/loading`
- `childWindows/toast`
- `childWindows/shareScreen`
- `childWindows/linkPreview`

Each has a dedicated HTML file at `src/renderer/*.html`, registered in
`electron.vite.config.ts` under `renderer.build.rollupOptions.input`.

These windows should stay small, focused, and weakly coupled to main-window state.

## Shared renderer layer (`shared/`)

| Path                        | Role                                                  |
| --------------------------- | ----------------------------------------------------- |
| `shared/ipc/*`              | Typed IPC wrappers used by renderer feature code.     |
| `shared/ipc/lynxIpc.ts`     | Low-level adapter over `window.electron.ipcRenderer`. |
| `shared/sentry/*`           | Renderer Sentry init + breadcrumb controls.           |
| `shared/HeroUIProvider.tsx` | Shared provider wrapper used by child windows.        |
| `shared/styles.css`         | Shared styles/theme for auxiliary windows.            |
| `shared/assets/*`           | Shared fonts/icons/static assets.                     |

## IPC rule in renderer

Do this:

- call domain wrappers in `shared/ipc/*`
- keep channel constants in `src/common/consts/ipcChannels/*`
- keep payload types in `src/common/types/*`

Avoid this:

- direct raw channel strings in feature components
- direct `window.electron.ipcRenderer` usage outside wrappers

## Imports and aliases

Common aliases used in renderer code:

- `@lynx/*` -> `src/renderer/mainWindow/*`
- `@lynx_shared/*` -> `src/renderer/shared/*`
- `@lynx_assets/*` -> `src/renderer/shared/assets/*`
- `@lynx_common/*` -> `src/common/*`
- `@lynx_module/*` and `@lynx_extension/*` for local dev plugin loading

## Contributor workflows

### Add a new main-window page

1. Add page under `mainWindow/pages/<name>/`.
2. Wire page into layout/router flow (`layouts` / page container usage).
3. Add/update reducer state if needed.
4. If native data is needed, add IPC wrapper in `shared/ipc`.

### Add a new child window

1. Create `src/renderer/childWindows/<name>/index.tsx`.
2. Add `src/renderer/<name>.html` with `#root`.
3. Register HTML entry in `electron.vite.config.ts`.
4. Add main-process window management in `src/main/childWindows`.

### Add a new IPC method used by UI

1. Add channel in `src/common/consts/ipcChannels`.
2. Add/update shared type in `src/common/types`.
3. Implement main handler/listener in `src/main/ipc`.
4. Expose typed renderer function in `src/renderer/shared/ipc`.
5. Consume wrapper in UI code.

### Add extension injection points

1. Extend extension API types in `src/common/types/plugins/extensions`.
2. Implement mutation target in `mainWindow/plugins/extensions/loader.ts`.
3. Consume that injected data in target UI component/layout.
4. Verify no-extension and multi-extension behavior.

## Conventions and guardrails

- Keep business logic near its owning feature folder.
- Keep child windows isolated from main-window Redux when possible.
- Treat plugin-loaded code as untrusted: fail gracefully and isolate errors.
- Prefer shared helpers/contracts in `src/common` for cross-process logic.
- Keep startup paths deterministic; avoid async side effects in render-only components.

## Validate renderer changes

```bash
npm run typecheck:web
```

For cross-boundary changes:

```bash
npm run typecheck
```

Recommended manual checks:

- app launch and initial render
- module/extension loading behavior (dev and production assumptions)
- affected child windows
- IPC events for changed domains

## Related docs

- shared contracts: `src/common/README.md`
- main process architecture: `src/main/README.md`
- project overview: `README.md`
