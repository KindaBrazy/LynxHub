# LynxHub Renderer Process

This directory (`src/renderer`) contains all **Electron Renderer Process** code for LynxHub.
It includes the main app UI (`mainWindow`), secondary renderer windows (`childWindows`), and shared renderer utilities (`shared`).

The renderer is React + TypeScript, built with `electron-vite`, and communicates with the Main process through typed IPC wrappers.

## 🚀 What Lives Here

- **`mainWindow/`**: Primary application UI (tabs, pages, modals, settings, card system, plugin hooks).
- **`childWindows/`**: Lightweight standalone windows (context menu, loading, toast, share screen, link preview).
- **`shared/`**: Cross-renderer assets and utilities (styles, HeroUI provider wrapper, IPC clients, Sentry init).
- **`*.html`**: Entry HTML files used by Vite as multi-page renderer build inputs.

## 🏗️ High-Level Architecture

### 1. Main Window (`mainWindow/`)

The main app UI is bootstrapped from [`mainWindow/index.tsx`](./mainWindow/index.tsx).

Startup flow:

1. Initialize storage cache with one IPC request (`initializeStorage`).
2. Load renderer-side plugin modules (`loadModules`) and extensions (`loadExtensions`).
3. Read app settings from cached storage (error collection, breadcrumbs, etc.).
4. Build Redux store with preloaded state from storage.
5. Render React root with providers and error boundaries.

Root component: [`mainWindow/App.tsx`](./mainWindow/App.tsx)

The app root wires:

- Global UI providers (`UIProviders`)
- App hooks (`AppHooks`) for lifecycle/event sync
- Extension hooks (`ExtensionHooks`)
- Main layout primitives (`Background`, `TitleBar`, `MainContents`, `Modals`)

### 2. Child Windows (`childWindows/`)

Each child window has its own React entry point and runs independently from the main window state tree.

Current child windows:

- `contextMenu/`
- `loading/`
- `toast/`
- `shareScreen/`
- `linkPreview/`

Each window is mapped to an HTML input in `electron.vite.config.ts`:

- `src/renderer/contextMenu.html`
- `src/renderer/loading.html`
- `src/renderer/toast.html`
- `src/renderer/shareScreen.html`
- `src/renderer/linkPreview.html`

### 3. Shared Renderer Layer (`shared/`)

Shared renderer code used across main and child windows:

- **`ipc/`**: Renderer-side IPC wrappers (application, storage, files, git, browser, plugins, etc.)
- **`styles.css`**: Tailwind v4 + shared theme tokens for child windows
- **`HeroUIProvider.tsx`**: Shared provider wrapper for small renderer windows
- **`sentry/`**: Renderer Sentry initialization + breadcrumbs integration

## 📂 Directory Structure

```text
src/renderer/
  childWindows/
    contextMenu/
    linkPreview/
    loading/
    shareScreen/
    toast/
  mainWindow/
    components/
      card/
      modals/
    contexts/
    features/
    hooks/
    layouts/
      navBar/
      statusBar/
      tabs/
      titleBar/
    pages/
      agents/
      audio/
      dashboard/
      games/
      home/
      image/
      others/
      plugins/
      settings/
      text/
      tools/
    plugins/
      extensions/
      modules/
    redux/
      reducers/
    types/
    utils/
    App.tsx
    index.tsx
    index.css
  shared/
    assets/
    ipc/
    public/
    sentry/
    HeroUIProvider.tsx
    styles.css
  contextMenu.html
  index.html
  linkPreview.html
  loading.html
  shareScreen.html
  toast.html
```

## 🔌 IPC in Renderer

Renderer code should call Main-process functionality through wrappers in [`shared/ipc/`](./shared/ipc):

- Avoid calling `window.electron.ipcRenderer` directly from feature code.
- Add/extend typed wrapper methods in `shared/ipc/*`.
- Keep channel names defined in `src/common/consts/ipcChannels`.

`lynxIpc.ts` is the low-level adapter (`send`, `sendSync`, `invoke`, `on`, `once`) used by typed wrappers.

## 🧠 State Management

Main window state is Redux-based (`mainWindow/redux`).

- Slice reducers live in `mainWindow/redux/reducers`.
- Initial state is hydrated from storage in `storageInit.ts` + `store.ts`.
- Store creation is aware of extension-provided reducers.
- Sentry Redux enhancer is enabled when `collectErrors` is enabled in app settings.

## 🧩 Plugin & Extension Integration (Renderer)

Renderer dynamically loads plugin UI code at startup:

- **Modules** (`mainWindow/plugins/modules`): provide cards/pages metadata and renderer methods.
- **Extensions** (`mainWindow/plugins/extensions`): loaded via Module Federation remotes.

Behavior:

- In development, local aliases (`@lynx_module`, `@lynx_extension`) are used if available.
- In production, plugin addresses are discovered via IPC and imported dynamically.
- Failures are isolated so one bad plugin does not block all others.

## 🎨 UI & Styling

UI stack in renderer:

- React 19
- Tailwind CSS v4
- HeroUI
- Ant Design (main window providers)

Guidelines:

- Keep shared window styling in `shared/styles.css`.
- Keep main-window app-specific styling in `mainWindow/index.css`.
- Reuse shared provider wrappers for small windows to keep behavior consistent.

## 🛠️ Development Workflows

### Add a New Main Window Page/Feature

1. Create page UI under `mainWindow/pages/<pageName>/`.
2. Add or wire layout navigation/tab integration under `layouts/` and relevant reducers.
3. If backend data is needed, add/update an IPC wrapper in `shared/ipc`.
4. Add shared types/constants in `src/common` when contracts are shared with Main process.

### Add a New Child Window

1. Create `src/renderer/childWindows/<windowName>/index.tsx` and related components.
2. Add `<windowName>.html` in `src/renderer/` with a `root` element.
3. Register the new HTML input in `electron.vite.config.ts` (`renderer.build.rollupOptions.input`).
4. Wire window creation/open logic in Main process (`src/main`).

### Add a New IPC Method for Renderer

1. Define channel constant in `src/common/consts/ipcChannels`.
2. Implement main-side listener/handler in `src/main/ipc`.
3. Add renderer wrapper method in `src/renderer/shared/ipc`.
4. Use wrapper in UI code (not raw IPC calls).

## ✅ Contributor Checklist

Before opening a PR touching renderer code:

1. Run `npm run typecheck:web`.
2. Run full checks if your change crosses process boundaries: `npm run typecheck`.
3. Validate affected window(s): main window and/or specific child window.
4. Ensure shared contracts in `src/common` remain backward-compatible.
5. Verify plugin/module loading still works for your path (dev and production assumptions).

## ⚠️ Renderer Conventions

- Keep renderer-side business logic close to the owning feature folder.
- Prefer shared IPC wrappers over direct global calls.
- Avoid hard-coding process-specific assumptions into reusable components.
- Use `src/common` for contracts shared with Main/preload/module/extension code.
- Keep child windows small and isolated; avoid coupling them to main window state.
