import {Reducer} from '@reduxjs/toolkit';
import {ComponentProps, FC} from 'react';
import {RouteObject} from 'react-router-dom';

import {CardData} from '../Modules/types';

// -----------------------------------------------> Elements & Props
export type ElementProps = ComponentProps<'div'>;
export type CardElementProps = ComponentProps<'div'> & {cards: CardData[]};

export type FcProp = FC<ElementProps>;
export type FcPropCard = FC<CardElementProps>;

// -----------------------------------------------> Extension Renderer API

type CompFc = (component: FC) => void;
type CompFcProp = (component: FcProp) => void;
type CompFcPropCard = (component: FcPropCard) => void;

export type ExtensionData_Renderer = {
  titleBar: {
    addStart: FcProp[];
    addCenter: FcProp[];
    addEnd: FcProp[];
    replaceCenter: FcProp | undefined;
    replaceEnd: FcProp | undefined;
  };
  statusBar: {
    addStart: FcProp[];
    addCenter: FcProp[];
    addEnd: FcProp[];
    replaceContainer: FC | undefined;
  };
  runningAI: {
    container: FC | undefined;
    terminal: FC | undefined;
    browser: FC | undefined;
  };
  router: {
    add: RouteObject[];
    replace: {
      homePage: FC | undefined;
      imageGenerationPage: FC | undefined;
      textGenerationPage: FC | undefined;
      audioGenerationPage: FC | undefined;
      modulesPage: FC | undefined;
      settingsPage: FC | undefined;
      dashboardPage: FC | undefined;
      extensionsPage: FC | undefined;
    };
  };
  navBar: {
    replace: {
      container: FC | undefined;
      contentBar: FC | undefined;
      settingsBar: FC | undefined;
    };
    addButton: {
      contentBar: FC[];
      settingsBar: FC[];
    };
  };
  replaceModals: {
    updateApp: FC | undefined;
    launchConfig: FC | undefined;
    cardExtensions: FC | undefined;
    updatingNotification: FC | undefined;
    cardInfo: FC | undefined;
    installUi: FC | undefined;
    uninstallCard: FC | undefined;
    install: FC | undefined;
    warning: FC | undefined;
  };
  addCustomHook: FC[];
  replaceBackground: FC | undefined;
  customizePages: {
    home: {
      replace: {
        searchAndFilter: FC | undefined;
        categories: FC | undefined;
      };
      add: {
        top: FC[];
        bottom: FC[];
        scrollTop: FC[];
        scrollBottom: FC[];
        pinCategory: FC[];
        recentlyCategory: FC[];
        allCategory: FC[];
      };
    };
    audio: {
      add: {
        top: FC[];
        bottom: FC[];
        scrollTop: FC[];
        scrollBottom: FC[];
        cardsContainer: FC[];
      };
    };
    image: {
      add: {
        top: FC[];
        bottom: FC[];
        scrollTop: FC[];
        scrollBottom: FC[];
        cardsContainer: FC[];
      };
    };
    text: {
      add: {
        top: FC[];
        bottom: FC[];
        scrollTop: FC[];
        scrollBottom: FC[];
        cardsContainer: FC[];
      };
    };
    settings: {
      add: {
        navButton: FC[];
        content: FC[];
      };
    };
    dashboard: {
      add: {
        navButton: FC[];
        content: FC[];
      };
    };
  };
  addReducer: {name: string; reducer: Reducer}[];
  cards: {
    replace: FcPropCard | undefined;
  };
};

export type ExtensionRendererApi = {
  titleBar: {
    addStart: CompFcProp;
    addCenter: CompFcProp;
    addEnd: CompFcProp;
    replaceCenter: CompFcProp;
    replaceEnd: CompFcProp;
  };
  statusBar: {
    addStart: CompFcProp;
    addCenter: CompFcProp;
    addEnd: CompFcProp;
    replaceContainer: CompFc;
  };
  runningAI: {
    container: CompFc;
    terminal: CompFc;
    browser: CompFc;
  };
  router: {
    add: (routeObject: RouteObject[]) => void;
    replace: {
      homePage: CompFc;
      imageGenerationPage: CompFc;
      textGenerationPage: CompFc;
      audioGenerationPage: CompFc;
      modulesPage: CompFc;
      settingsPage: CompFc;
      dashboardPage: CompFc;
      extensionsPage: CompFc;
    };
  };
  navBar: {
    replace: {
      container: CompFc;
      contentBar: CompFc;
      settingsBar: CompFc;
    };
    addButton: {
      contentBar: CompFc;
      settingsBar: CompFc;
    };
  };
  replaceModals: {
    updateApp: CompFc;
    launchConfig: CompFc;
    cardExtensions: CompFc;
    updatingNotification: CompFc;
    cardInfo: CompFc;
    installUi: CompFc;
    uninstallCard: CompFc;
    install: CompFc;
    warning: CompFc;
  };
  addCustomHook: CompFc;
  replaceBackground: CompFc;
  customizePages: {
    home: {
      replace: {
        searchAndFilter: CompFc;
        categories: CompFc;
      };
      add: {
        top: CompFc;
        bottom: CompFc;
        scrollTop: CompFc;
        scrollBottom: CompFc;
        pinCategory: CompFc;
        recentlyCategory: CompFc;
        allCategory: CompFc;
      };
    };
    audio: {
      add: {
        top: CompFc;
        bottom: CompFc;
        scrollTop: CompFc;
        scrollBottom: CompFc;
        cardsContainer: CompFc;
      };
    };
    image: {
      add: {
        top: CompFc;
        bottom: CompFc;
        scrollTop: CompFc;
        scrollBottom: CompFc;
        cardsContainer: CompFc;
      };
    };
    text: {
      add: {
        top: CompFc;
        bottom: CompFc;
        scrollTop: CompFc;
        scrollBottom: CompFc;
        cardsContainer: CompFc;
      };
    };
    settings: {
      add: {
        navButton: CompFc;
        content: CompFc;
      };
    };
    dashboard: {
      add: {
        navButton: CompFc;
        content: CompFc;
      };
    };
  };
  addReducer: (reducer: {name: string; reducer: Reducer}[]) => void;
  cards: {replace: CompFcPropCard};
};

export type ExtensionImport_Renderer = {
  InitialExtensions: (lynxAPI: ExtensionRendererApi) => void;
};
