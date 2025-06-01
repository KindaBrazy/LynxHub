import {Reducer} from '@reduxjs/toolkit';
import {FC} from 'react';

import {ModuleData} from '../Modules/ModuleLoader';
import {
  AddMenuType,
  FcProp,
  FcPropCard,
  FcPropCardData,
  FcPropRef,
  FcPropReplaceMd,
  FcPropSearchResult,
} from './ExtensionTypes_Renderer';

type CompFc = (component: FC) => void;
type CompFcProp = (component: FcProp) => void;
type CompFcPropRef = (component: FcPropRef) => void;
type CompFcPropCard = (component: FcPropCard) => void;
type CompFcPropCardData = (component: FcPropCardData) => void;
type CompFcPropSearchResult = (component: FcPropSearchResult) => void;
type CompFcPropAddCardMenu = (component: AddMenuType[]) => void;
type CompFcPropReplaceMd = (component: FcPropReplaceMd) => void;

export type ExtensionRendererApi = {
  /** Modify the application Title Bar.
   * @see {@linkcode TitleBar} for implementation details. */
  titleBar: {
    /** Add elements to the **start** of the Title Bar (Left-aligned). */
    addStart: CompFcProp;
    /** Add elements to the **center** of the Title Bar. */
    addCenter: CompFcProp;
    /** Add elements to the **end** of the Title Bar (Right-aligned). */
    addEnd: CompFcProp;
    /** Replace the **center** elements of the Title Bar.
     * Commonly used to replace the default {@linkcode RunningCardManager} component. */
    replaceCenter: CompFcProp;
    /** Replace the **end** elements of the Title Bar.
     * Commonly used to replace the default {@linkcode WindowButtons} component. */
    replaceEnd: CompFcProp;
  };

  /** Modify the application Status Bar.
   * @see {@linkcode StatusBar} for implementation details. */
  statusBar: {
    /** Add elements to the **start** of the Status Bar (Left-aligned). */
    addStart: CompFcProp;
    /** Add elements to the **center** of the Status Bar. */
    addCenter: CompFcProp;
    /** Add elements to the **end** of the Status Bar (Right-aligned). */
    addEnd: CompFcProp;
    /** Replace the entire Status Bar container. */
    replaceContainer: CompFcPropRef;
  };

  /** Modify components within the Running AI view.
   * @see {@linkcode RunningCardView} for implementation details. */
  runningAI: {
    /** Replace the entire Running AI container,
     * including both the Terminal and Browser views. */
    container: CompFc;
    /** Replace the Terminal view within the Running AI container.
     * Commonly used to replace the default {@linkcode LynxTerminal} component. */
    terminal: CompFc;
    /** Replace the Browser view within the Running AI container.
     * Commonly used to replace the default {@linkcode Browser} component. */
    browser: CompFc;
  };

  /** Modify the application router and its associated pages.
   * @see {@linkcode initRouter} for implementation details. */
  router: {
    /** Add new routes to the application router.
     * To include a navigation button for the new route, add it to the `navBar` object. */
    add: (routeObject: []) => void;
    /** Replace existing pages within the router. */
    replace: {
      /** Replace the Home page component. */
      homePage: CompFc;
      /** Replace the Image Generation page component. */
      imageGenerationPage: CompFc;
      /** Replace the Text Generation page component. */
      textGenerationPage: CompFc;
      /** Replace the Audio Generation page component. */
      audioGenerationPage: CompFc;
      /** Replace the Tools page component. */
      toolsPage: CompFc;
      /** Replace the Games page component. */
      gamesPage: CompFc;
      /** Replace the Dashboard page component. */
      dashboardPage: CompFc;
      /** Replace the Modules page component. */
      modulesPage: CompFc;
      /** Replace the Extensions page component. */
      extensionsPage: CompFc;
      /** Replace the Settings page component. */
      settingsPage: CompFc;
    };
  };
  /** Modify navigation bar components and behavior. */
  navBar: {
    /** Replace default components of the navigation bar.
     * @see {@linkcode NavBar} for implementation details. */
    replace: {
      /** Replace the entire navigation bar container. */
      container: CompFc;
      /** Replace the **content navigation bar** (Top bar),
       * which includes buttons for navigating through sections like Home, Images, etc. */
      contentBar: CompFc;
      /** Replace the **settings navigation bar** (Bottom bar),
       * which includes buttons for navigating through sections like Settings, Modules, etc. */
      settingsBar: CompFc;
    };
    /** Add new buttons to the navigation bar for navigating to specific routes. */
    addButton: {
      /** Add a new button to the **content navigation bar** (Top bar).
       * @see {@linkcode ContentPagesButtons} for implementation details. */
      contentBar: CompFc;
      /** Add a new button to the **settings navigation bar** (Bottom bar).
       * @see {@linkcode SettingsPagesButtons} for implementation details. */
      settingsBar: CompFc;
    };
  };
  /** Add custom modal to the existing modals
   * @see {@linkcode Modals} for implementation details. */
  addModal: CompFc;
  /** Replace default modals in the application.
   * @see {@linkcode Modals} for implementation details. */
  replaceModals: {
    /** Replace the modal for updating the application.
     * This modal notifies users about app updates and helps manage the update process.
     * @see {@linkcode UpdateApp} for implementation details. */
    updateApp: CompFc;
    /** Replace the modal for managing launch configurations.
     * This modal allows customization of card launches, including commands, arguments, etc.
     * @see {@linkcode LaunchConfig} for implementation details. */
    launchConfig: CompFc;
    /** Replace the modal for managing card extensions.
     * This modal facilitates installing, updating, and removing extensions for cards.
     * @see {@linkcode CardExtensions} for implementation details. */
    cardExtensions: CompFc;
    /** Replace the modal for updating notifications.
     * This modal displays the result and information about updated cards.
     * @see {@linkcode UpdatingNotification} for implementation details. */
    updatingNotification: CompFc;
    /** Replace the modal for displaying card information.
     * This modal shows details such as disk usage, developer info, and repository links.
     * @see {@linkcode CardInfoModal} for implementation details. */
    cardInfo: CompFc;
    /** Replace the modal for installing a card.
     * This modal provides a step-by-step process for installing or locating a selected card.
     * It offers an advanced alternative to the simpler `install` modal.
     * @see {@linkcode InstallUIModal} for implementation details. */
    installUi: CompFc;
    /** Replace the modal for uninstalling a card.
     * This modal manages the uninstallation process of a selected card.
     * @see {@linkcode UninstallCard} for implementation details. */
    uninstallCard: CompFc;
    /** Replace the modal for displaying warning messages.
     * This modal is used in cases like failed installations or other critical alerts.
     * @see {@linkcode WarningModal} for implementation details. */
    warning: CompFc;
    /** Replace the modal for viewing a card's README file.
     * This modal renders GitHub-style Markdown README files to provide users with detailed documentation.
     * @see {@linkcode CardReadmeModal} for implementation details. */
    cardReadme: CompFc;
    gitManager: CompFc;
  };

  /** Replace the MarkDown viewer component.
   * This component is used to render Markdown files.
   * @see {@linkcode MarkdownViewer} for implementation details. */
  replaceMarkdownViewer: CompFcPropReplaceMd;

  /** Add a custom hook to the application.
   * @see {@linkcode ExtensionHooks} for implementation details. */
  addCustomHook: CompFc;

  /** Replace the main background color of the application.
   * @see {@linkcode Background} for implementation details. */
  replaceBackground: CompFc;

  /** Customize application pages by adding or replacing elements. */
  customizePages: {
    /** Customize the Home page.
     * @see {@linkcode HomePage} for implementation details. */
    home: {
      /** Replace existing elements on the Home page. */
      replace: {
        /** Replace the top search input and filter button.
         * @see {@linkcode HomePage} for implementation details. */
        searchAndFilter: CompFc;
        /** Replace the search result section.
         * @see {@linkcode HomePage} for implementation details. */
        searchResult: CompFcPropSearchResult;
        /** Replace the categories container.
         * @see {@linkcode HomePage} for implementation details. */
        categories: CompFc;
      };
      /** Add new elements to the Home page. */
      add: {
        /** Add elements to the top of the page, below the search and filter section
         * but above the scroll and categories. */
        top: CompFc;
        /** Add elements to the bottom of the page, below the scroll and categories. */
        bottom: CompFc;
        /** Add elements to the top of the scroll component. */
        scrollTop: CompFc;
        /** Add elements to the bottom of the scroll component. */
        scrollBottom: CompFc;
        /** Add elements to the end of the pinned category section.
         * @see {@linkcode PinnedCars} for implementation details. */
        pinCategory: CompFc;
        /** Add elements to the end of the recently used category section.
         * @see {@linkcode RecentlyCards} for implementation details. */
        recentlyCategory: CompFc;
        /** Add elements to the end of the "all categories" section.
         * @see {@linkcode AllCardsSection} for implementation details. */
        allCategory: CompFcPropCardData;
      };
    };

    /** Customize the Audio page.
     * @see {@linkcode AudioGenerationPage} for implementation details. */
    audio: {
      /** Add new elements to the Audio page. */
      add: {
        top: CompFc;
        bottom: CompFc;
        scrollTop: CompFc;
        scrollBottom: CompFc;
        cardsContainer: CompFc;
      };
    };

    /** Customize the Image page.
     * @see {@linkcode ImageGenerationPage} for implementation details. */
    image: {
      /** Add new elements to the Image page. */
      add: {
        top: CompFc;
        bottom: CompFc;
        scrollTop: CompFc;
        scrollBottom: CompFc;
        cardsContainer: CompFc;
      };
    };

    /** Customize the Text page.
     * @see {@linkcode TextGenerationPage} for implementation details. */
    text: {
      /** Add new elements to the Text page. */
      add: {
        top: CompFc;
        bottom: CompFc;
        scrollTop: CompFc;
        scrollBottom: CompFc;
        cardsContainer: CompFc;
      };
    };

    /** Customize the Tools page.
     * @see {@linkcode ToolsPage} for implementation details. */
    tools: {addComponent: CompFc};

    /** Customize the Games page.
     * @see {@linkcode GamesPage} for implementation details. */
    games: {addComponent: CompFc};

    /** Customize the Settings page.
     * @see {@linkcode SettingsPage} for implementation details. */
    settings: {
      /** Add new elements to the Settings page. */
      add: {
        /** Add a new navigation button.
         * @see {@linkcode SettingsPageNav} for implementation details. */
        navButton: CompFc;
        /** Add new content to the page.
         * @see {@linkcode SettingsPageContents} for implementation details. */
        content: CompFc;
      };
    };

    /** Customize the Dashboard page.
     * @see {@linkcode DashboardPage} for implementation details. */
    dashboard: {
      /** Add new elements to the Dashboard page. */
      add: {
        navButton: CompFc;
        content: CompFc;
      };
    };
  };

  /** Add a new reducer to the Redux store.
   * @see {@linkcode createStore} for implementation details. */
  addReducer: (reducer: {name: string; reducer: Reducer}[]) => void;

  /** Modify card-related components and handlers. */
  cards: {
    /** Replace the default cards handler.
     * This handler receives an array of cards as props and returns a component to display the cards. */
    replace: CompFcPropCard;
    /** Replace the default card component used to display a single card.
     * @see {@linkcode LynxCard} for implementation details. */
    replaceComponent: CompFcPropCardData;
    /** Customize various sections of the default card component.
     * @see {@linkcode LynxCard} for implementation details. */
    customize: {
      /** Replace the card's header section. */
      header: CompFcPropCardData;
      /** Replace the card's body section. */
      body: CompFcPropCardData;
      /** Replace the card's footer section. */
      footer: CompFcPropCardData;
      /** Customize the card's menu.
       * @see {@linkcode CardMenu} for implementation details. */
      menu: {
        /** Replace the default card menu.
         * @see {@linkcode CardMenu} for implementation details. */
        replace: CompFcPropCardData;
        /** Add sections and items to the card menu.
         * @see {@linkcode CardMenu} for implementation details. */
        addSection: CompFcPropAddCardMenu;
      };
    };
  };
  modulesData?: ModuleData;
};
