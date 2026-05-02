import {rendererIpcEventsApi} from '@lynx_shared/ipc/ipcEvents';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';

import {allCards, allModules, getCardMethod, useGetArgumentsByID, useGetCardsByPath} from '../modules';
import {initPluginBrowserSentry} from '../sentry';
import {rendererIpcApi} from './ipcApi';
import {ExtensionData_Renderer, ExtensionImport_Renderer} from './types';
import {ExtensionRendererApi} from './types/api';
import type {ExtensionEvents} from './types/events';

// ─── Extension Data Store ─────────────────────────────────────────────────────

/**
 * Mutable registry that accumulates all UI modifications contributed by loaded
 * extensions. It is populated synchronously during `initializeExtensions` —
 * before React mounts — so the values are effectively stable after that point.
 *
 * Each array or `undefined` field maps 1-to-1 with a method on
 * `ExtensionRendererApi`. Arrays are filled by the "add*" methods; optional
 * fields are set by the "replace*" methods.
 */
export const extensionsData: ExtensionData_Renderer = {
  titleBar: {
    addStart: [],
    addCenter: [],
    addEnd: [],
    replaceCenter: undefined,
    replaceEnd: undefined,
  },
  statusBar: {
    addStart: [],
    addCenter: [],
    addEnd: [],
    replaceContainer: undefined,
  },
  runningAI: {
    container: undefined,
    terminal: undefined,
    browser: undefined,
  },
  router: {
    add: [],
    replace: {
      homePage: undefined,
      imageGenerationPage: undefined,
      textGenerationPage: undefined,
      audioGenerationPage: undefined,
      modulesPage: undefined,
      settingsPage: undefined,
      dashboardPage: undefined,
      toolsPage: undefined,
      extensionsPage: undefined,
      gamesPage: undefined,
    },
  },
  navBar: {
    replace: {
      container: undefined,
      contentBar: undefined,
      settingsBar: undefined,
    },
    addButton: {
      contentBar: [],
      settingsBar: [],
    },
  },
  replaceModals: {
    updateApp: undefined,
    launchConfig: undefined,
    cardExtensions: undefined,
    updatingNotification: undefined,
    cardInfo: undefined,
    installUi: undefined,
    uninstallCard: undefined,
    warning: undefined,
    cardReadme: undefined,
    gitManager: undefined,
    unassignCard: undefined,
  },
  addCustomHook: [],
  replaceBackground: undefined,
  customizePages: {
    home: {
      replace: {
        searchAndFilter: undefined,
        categories: undefined,
        searchResult: undefined,
      },
      add: {
        top: [],
        bottom: [],
        scrollTop: [],
        scrollBottom: [],
        pinCategory: [],
        recentlyCategory: [],
        allCategory: [],
      },
    },
    audio: {
      add: {top: [], bottom: [], scrollTop: [], scrollBottom: [], cardsContainer: []},
    },
    image: {
      add: {top: [], bottom: [], scrollTop: [], scrollBottom: [], cardsContainer: []},
    },
    text: {
      add: {top: [], bottom: [], scrollTop: [], scrollBottom: [], cardsContainer: []},
    },
    tools: {
      add: {top: [], bottom: [], scrollTop: [], scrollBottom: [], cardsContainer: []},
    },
    games: {
      add: {top: [], bottom: [], scrollTop: [], scrollBottom: [], cardsContainer: []},
    },
    settings: {
      add: {navButton: [], content: []},
    },
    dashboard: {
      add: {navButton: [], content: []},
    },
    agents: {
      add: {top: [], bottom: [], scrollTop: [], scrollBottom: [], cardsContainer: []},
    },
    others: {
      add: {top: [], bottom: [], scrollTop: [], scrollBottom: [], cardsContainer: []},
    },
  },
  addReducer: [],
  cards: {
    replace: undefined,
    replaceComponent: undefined,
    customize: {
      header: undefined,
      body: undefined,
      footer: undefined,
      menu: {
        replace: undefined,
        addSection: [],
        addModal: [],
      },
    },
  },
  addModal: [],
  replaceMarkdownViewer: undefined,
};

type ExtensionEventName = keyof ExtensionEvents;
type ExtensionEventListener = (payload: ExtensionEvents[ExtensionEventName]) => void;

const extensionEventNames: ExtensionEventName[] = [
  'before_card_start',
  'before_card_install',
  'card_install_addStep',
  'card_collect_user_input',
];

const extensionEventListeners = new Map<ExtensionEventName, Set<ExtensionEventListener>>(
  extensionEventNames.map(name => [name, new Set<ExtensionEventListener>()]),
);

const getEventListeners = (event: ExtensionEventName): Set<ExtensionEventListener> => {
  const listeners = extensionEventListeners.get(event);
  if (listeners) {
    return listeners;
  }

  const fallback = new Set<ExtensionEventListener>();
  extensionEventListeners.set(event, fallback);
  return fallback;
};

const extensionEventsApi: ExtensionRendererApi['events'] = {
  on: (event, callback) => {
    const listeners = getEventListeners(event);
    const wrapped = callback as ExtensionEventListener;
    listeners.add(wrapped);
    return () => {
      listeners.delete(wrapped);
    };
  },
  off: (event, callback) => {
    const listeners = getEventListeners(event);
    listeners.delete(callback as ExtensionEventListener);
  },
  emit: (event, payload) => {
    const listeners = [...getEventListeners(event)];
    for (const listener of listeners) {
      try {
        listener(payload as ExtensionEvents[ExtensionEventName]);
      } catch (error) {
        console.error(`Extension event "${String(event)}" failed:`, error);
      }
    }
  },
  getListenerCount: event => getEventListeners(event).size,
};

// ─── Extension Renderer API ───────────────────────────────────────────────────

/**
 * The concrete implementation of `ExtensionRendererApi` that is handed to each
 * extension's `InitialExtensions` entry point.
 *
 * Every method mutates the shared `extensionsData` object, which the app reads
 * after all extensions have finished initializing. Since initialization is
 * synchronous and happens before React renders, these mutations are safe —
 * there is no concurrent read/write hazard.
 */
export const extensionRendererApi: ExtensionRendererApi = {
  // ── Title Bar ────────────────────────────────────────────────────────────
  titleBar: {
    addStart: comp => extensionsData.titleBar.addStart.push(comp),
    addCenter: comp => extensionsData.titleBar.addCenter.push(comp),
    addEnd: comp => extensionsData.titleBar.addEnd.push(comp),
    replaceCenter: comp => {
      extensionsData.titleBar.replaceCenter = comp;
    },
    replaceEnd: comp => {
      extensionsData.titleBar.replaceEnd = comp;
    },
  },

  // ── Status Bar ───────────────────────────────────────────────────────────
  statusBar: {
    addStart: comp => extensionsData.statusBar.addStart.push(comp),
    addCenter: comp => extensionsData.statusBar.addCenter.push(comp),
    addEnd: comp => extensionsData.statusBar.addEnd.push(comp),
    replaceContainer: comp => {
      extensionsData.statusBar.replaceContainer = comp;
    },
  },

  // ── Running AI View ──────────────────────────────────────────────────────
  runningAI: {
    container: comp => {
      extensionsData.runningAI.container = comp;
    },
    terminal: comp => {
      extensionsData.runningAI.terminal = comp;
    },
    browser: comp => {
      extensionsData.runningAI.browser = comp;
    },
  },

  // ── Router ───────────────────────────────────────────────────────────────
  router: {
    add: (routeObject: any[]) => {
      extensionsData.router.add = [...extensionsData.router.add, ...routeObject];
    },
    replace: {
      homePage: comp => {
        extensionsData.router.replace.homePage = comp;
      },
      imageGenerationPage: comp => {
        extensionsData.router.replace.imageGenerationPage = comp;
      },
      textGenerationPage: comp => {
        extensionsData.router.replace.textGenerationPage = comp;
      },
      audioGenerationPage: comp => {
        extensionsData.router.replace.audioGenerationPage = comp;
      },
      toolsPage: comp => {
        extensionsData.router.replace.toolsPage = comp;
      },
      gamesPage: comp => {
        extensionsData.router.replace.gamesPage = comp;
      },
      dashboardPage: comp => {
        extensionsData.router.replace.dashboardPage = comp;
      },
      modulesPage: comp => {
        extensionsData.router.replace.modulesPage = comp;
      },
      extensionsPage: comp => {
        extensionsData.router.replace.extensionsPage = comp;
      },
      settingsPage: comp => {
        extensionsData.router.replace.settingsPage = comp;
      },
    },
  },

  // ── Navigation Bar ───────────────────────────────────────────────────────
  navBar: {
    replace: {
      container: comp => {
        extensionsData.navBar.replace.container = comp;
      },
      contentBar: comp => {
        extensionsData.navBar.replace.contentBar = comp;
      },
      settingsBar: comp => {
        extensionsData.navBar.replace.settingsBar = comp;
      },
    },
    addButton: {
      contentBar: comp => extensionsData.navBar.addButton.contentBar.push(comp),
      settingsBar: comp => extensionsData.navBar.addButton.settingsBar.push(comp),
    },
  },

  // ── Modals ───────────────────────────────────────────────────────────────
  replaceModals: {
    updateApp: comp => {
      extensionsData.replaceModals.updateApp = comp;
    },
    launchConfig: comp => {
      extensionsData.replaceModals.launchConfig = comp;
    },
    cardExtensions: comp => {
      extensionsData.replaceModals.cardExtensions = comp;
    },
    updatingNotification: comp => {
      extensionsData.replaceModals.updatingNotification = comp;
    },
    cardInfo: comp => {
      extensionsData.replaceModals.cardInfo = comp;
    },
    installUi: comp => {
      extensionsData.replaceModals.installUi = comp;
    },
    uninstallCard: comp => {
      extensionsData.replaceModals.uninstallCard = comp;
    },
    unassignCard: comp => {
      extensionsData.replaceModals.unassignCard = comp;
    },
    warning: comp => {
      extensionsData.replaceModals.warning = comp;
    },
    cardReadme: comp => {
      extensionsData.replaceModals.cardReadme = comp;
    },
    gitManager: comp => {
      extensionsData.replaceModals.gitManager = comp;
    },
  },

  // ── Markdown Viewer ──────────────────────────────────────────────────────
  replaceMarkdownViewer: comp => {
    extensionsData.replaceMarkdownViewer = comp;
  },

  // ── Custom Hooks & Modals ────────────────────────────────────────────────
  addCustomHook: comp => extensionsData.addCustomHook.push(comp),
  addModal: comp => extensionsData.addModal.push(comp),

  // ── Background ───────────────────────────────────────────────────────────
  replaceBackground: comp => {
    extensionsData.replaceBackground = comp;
  },

  // ── Page Customization ───────────────────────────────────────────────────
  customizePages: {
    home: {
      replace: {
        searchAndFilter: comp => {
          extensionsData.customizePages.home.replace.searchAndFilter = comp;
        },
        searchResult: comp => {
          extensionsData.customizePages.home.replace.searchResult = comp;
        },
        categories: comp => {
          extensionsData.customizePages.home.replace.categories = comp;
        },
      },
      add: {
        top: comp => extensionsData.customizePages.home.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.home.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.home.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.home.add.scrollBottom.push(comp),
        pinCategory: comp => extensionsData.customizePages.home.add.pinCategory.push(comp),
        recentlyCategory: comp => extensionsData.customizePages.home.add.recentlyCategory.push(comp),
        allCategory: comp => extensionsData.customizePages.home.add.allCategory.push(comp),
      },
    },
    audio: {
      add: {
        top: comp => extensionsData.customizePages.audio.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.audio.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.audio.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.audio.add.scrollBottom.push(comp),
        cardsContainer: comp => extensionsData.customizePages.audio.add.cardsContainer.push(comp),
      },
    },
    image: {
      add: {
        top: comp => extensionsData.customizePages.image.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.image.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.image.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.image.add.scrollBottom.push(comp),
        cardsContainer: comp => extensionsData.customizePages.image.add.cardsContainer.push(comp),
      },
    },
    text: {
      add: {
        top: comp => extensionsData.customizePages.text.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.text.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.text.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.text.add.scrollBottom.push(comp),
        cardsContainer: comp => extensionsData.customizePages.text.add.cardsContainer.push(comp),
      },
    },
    agents: {
      add: {
        top: comp => extensionsData.customizePages.agents.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.agents.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.agents.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.agents.add.scrollBottom.push(comp),
        cardsContainer: comp => extensionsData.customizePages.agents.add.cardsContainer.push(comp),
      },
    },
    others: {
      add: {
        top: comp => extensionsData.customizePages.others.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.others.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.others.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.others.add.scrollBottom.push(comp),
        cardsContainer: comp => extensionsData.customizePages.others.add.cardsContainer.push(comp),
      },
    },
    tools: {
      add: {
        top: comp => extensionsData.customizePages.tools.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.tools.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.tools.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.tools.add.scrollBottom.push(comp),
        cardsContainer: comp => extensionsData.customizePages.tools.add.cardsContainer.push(comp),
      },
    },
    games: {
      add: {
        top: comp => extensionsData.customizePages.games.add.top.push(comp),
        bottom: comp => extensionsData.customizePages.games.add.bottom.push(comp),
        scrollTop: comp => extensionsData.customizePages.games.add.scrollTop.push(comp),
        scrollBottom: comp => extensionsData.customizePages.games.add.scrollBottom.push(comp),
        cardsContainer: comp => extensionsData.customizePages.games.add.cardsContainer.push(comp),
      },
    },
    settings: {
      add: {
        navButton: comp => extensionsData.customizePages.settings.add.navButton.push(comp),
        content: comp => extensionsData.customizePages.settings.add.content.push(comp),
      },
    },
    dashboard: {
      add: {
        navButton: comp => extensionsData.customizePages.dashboard.add.navButton.push(comp),
        content: comp => extensionsData.customizePages.dashboard.add.content.push(comp),
      },
    },
  },

  // ── Redux Reducers ───────────────────────────────────────────────────────
  addReducer: reducer => {
    extensionsData.addReducer = [...extensionsData.addReducer, ...reducer];
  },

  // ── Cards ────────────────────────────────────────────────────────────────
  cards: {
    replace: comp => {
      extensionsData.cards.replace = comp;
    },
    replaceComponent: comp => {
      extensionsData.cards.replaceComponent = comp;
    },
    customize: {
      header: comp => {
        extensionsData.cards.customize.header = comp;
      },
      body: comp => {
        extensionsData.cards.customize.body = comp;
      },
      footer: comp => {
        extensionsData.cards.customize.footer = comp;
      },
      menu: {
        replace: comp => {
          extensionsData.cards.customize.menu.replace = comp;
        },
        addSection: comp => extensionsData.cards.customize.menu.addSection.push(...comp),
        addModal: comp => extensionsData.cards.customize.menu.addModal.push(...comp),
      },
    },
  },

  // ── Card Terminal Pre-Commands ────────────────────────────────────────────
  setCards_TerminalPreCommands: (id: string, preCommands: string[]) => {
    storageUtilsIpc.send.setCardTerminalPreCommands(id, preCommands);
  },

  // ── Extension Event Hooks ───────────────────────────────────────────────
  events: extensionEventsApi,

  // ── IPC Event Hooks ─────────────────────────────────────────────────────
  ipcEvents: rendererIpcEventsApi,

  // ── Sentry ───────────────────────────────────────────────────────────────
  initBrowserSentry: initPluginBrowserSentry,
};

// ─── Extension Initializer ────────────────────────────────────────────────────

/** Shape of each entry passed to `initializeExtensions`. */
type LoadedExtension = {id: string; module: ExtensionImport_Renderer};

/**
 * Calls `InitialExtensions` on each successfully-loaded extension module,
 * injecting the full renderer API and the extension's own ID.
 *
 * Extensions may call any method on the provided API during initialization to
 * register components, hooks, reducers, or event listeners. All side-effects
 * are written to the shared `extensionsData` object, which the React tree
 * reads after this function returns.
 *
 * @param extensions - Array of `{id, module}` pairs for every loaded extension.
 */
export default function initializeExtensions(extensions: LoadedExtension[]) {
  for (const extension of extensions) {
    extension.module.InitialExtensions(
      {
        ...extensionRendererApi,
        modulesData: {
          allModules,
          allCards,
          useGetArgumentsByID,
          useGetCardsByPath,
          getCardMethod,
        },
      },
      rendererIpcApi,
      extension.id,
    );
  }
}
