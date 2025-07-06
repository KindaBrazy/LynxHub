import mitt, {Emitter} from 'mitt';

import {allCards, allModules, getCardMethod, useGetArgumentsByID, useGetCardsByPath} from '../Modules/ModuleLoader';
import {ExtensionData_Renderer, ExtensionEvents, ExtensionImport_Renderer} from './ExtensionTypes_Renderer';
import {ExtensionRendererApi} from './ExtensionTypes_Renderer_Api';

type EmitterType = Emitter<ExtensionEvents> & {all: Map<string, unknown[]>};

const emitter: EmitterType = mitt<ExtensionEvents>();

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
      add: {
        top: [],
        bottom: [],
        scrollTop: [],
        scrollBottom: [],
        cardsContainer: [],
      },
    },
    image: {
      add: {
        top: [],
        bottom: [],
        scrollTop: [],
        scrollBottom: [],
        cardsContainer: [],
      },
    },
    text: {
      add: {
        top: [],
        bottom: [],
        scrollTop: [],
        scrollBottom: [],
        cardsContainer: [],
      },
    },
    settings: {
      add: {
        navButton: [],
        content: [],
      },
    },
    dashboard: {
      add: {
        navButton: [],
        content: [],
      },
    },
    tools: {
      addComponent: [],
    },
    games: {
      addComponent: [],
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
      },
    },
  },
  addModal: [],
  replaceMarkdownViewer: undefined,
};

export const extensionRendererApi: ExtensionRendererApi = {
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
  statusBar: {
    addStart: comp => extensionsData.statusBar.addStart.push(comp),
    addCenter: comp => extensionsData.statusBar.addCenter.push(comp),
    addEnd: comp => extensionsData.statusBar.addEnd.push(comp),
    replaceContainer: comp => {
      extensionsData.statusBar.replaceContainer = comp;
    },
  },
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
  router: {
    add: function (routeObject: []): void {
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
  replaceMarkdownViewer: comp => {
    extensionsData.replaceMarkdownViewer = comp;
  },
  addCustomHook: comp => extensionsData.addCustomHook.push(comp),
  addModal: comp => extensionsData.addModal.push(comp),
  replaceBackground: comp => {
    extensionsData.replaceBackground = comp;
  },
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
    tools: {
      addComponent: comp => extensionsData.customizePages.tools.addComponent.push(comp),
    },
    games: {
      addComponent: comp => extensionsData.customizePages.games.addComponent.push(comp),
    },
  },
  addReducer: reducer => {
    extensionsData.addReducer = [...extensionsData.addReducer, ...reducer];
  },
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
      },
    },
  },
  events: {
    on: emitter.on,
    off: emitter.off,
    emit: emitter.emit,
    getListenerCount: (eventName: string) => {
      const listeners = emitter.all.get(eventName);
      return listeners ? listeners.length : 0;
    },
  },
};

export default function extensionLoader(extensions: ExtensionImport_Renderer[]) {
  for (const extension of extensions) {
    extension.InitialExtensions({
      ...extensionRendererApi,
      modulesData: {
        allModules,
        allCards,
        useGetArgumentsByID,
        useGetCardsByPath,
        getCardMethod,
      },
    });
  }
}
