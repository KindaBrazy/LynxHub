import {CardData} from '@lynx_module/types';
import {Reducer} from '@reduxjs/toolkit';
import {ComponentProps, FC} from 'react';

import {CardsDataManager} from '../Components/Cards/CardsDataManager';
import {ExtensionRendererApi} from './ExtensionTypes_Renderer_Api';

// -----------------------------------------------> Elements & Props
export type ElementProps = ComponentProps<'div'>;
export type RefElementProps = ComponentProps<'div'> & {ref: (node: HTMLDivElement) => void};
export type CardElementProps = ComponentProps<'div'> & {cards: CardData[]};
export type SearchResultProps = ComponentProps<'div'> & {searchValue: string};
export type CardDataProps = ComponentProps<'div'> & {context: CardsDataManager};
export type ReplaceMdProps = ComponentProps<'div'> & {repoPath: string; rounded?: boolean};

export type FcProp = FC<ElementProps>;
export type FcPropRef = FC<RefElementProps>;
export type FcPropCardData = FC<CardDataProps>;
export type FcPropCard = FC<CardElementProps>;
export type FcPropSearchResult = FC<SearchResultProps>;
export type FcPropReplaceMd = FC<ReplaceMdProps>;

export type AddMenuType = {index: number; components: FcPropCardData[]};

// -----------------------------------------------> Extension Renderer API

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
    replaceContainer: FcPropRef | undefined;
  };
  runningAI: {
    container: FC | undefined;
    terminal: FC | undefined;
    browser: FC | undefined;
  };
  router: {
    add: [];
    replace: {
      homePage: FC | undefined;
      imageGenerationPage: FC | undefined;
      textGenerationPage: FC | undefined;
      audioGenerationPage: FC | undefined;
      toolsPage: FC | undefined;
      gamesPage: FC | undefined;
      dashboardPage: FC | undefined;
      modulesPage: FC | undefined;
      extensionsPage: FC | undefined;
      settingsPage: FC | undefined;
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
    unassignCard: FC | undefined;
    warning: FC | undefined;
    cardReadme: FC | undefined;
    gitManager: FC | undefined;
  };
  replaceMarkdownViewer: FcPropReplaceMd | undefined;
  addModal: FC[];
  addCustomHook: FC[];
  replaceBackground: FC | undefined;
  customizePages: {
    home: {
      replace: {
        searchAndFilter: FC | undefined;
        searchResult: FcPropSearchResult | undefined;
        categories: FC | undefined;
      };
      add: {
        top: FC[];
        bottom: FC[];
        scrollTop: FC[];
        scrollBottom: FC[];
        pinCategory: FC[];
        recentlyCategory: FC[];
        allCategory: FcPropCardData[];
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
    tools: {addComponent: FC[]};
    games: {addComponent: FC[]};
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
    replaceComponent: FcPropCardData | undefined;
    customize: {
      header: FcPropCardData | undefined;
      body: FcPropCardData | undefined;
      footer: FcPropCardData | undefined;
      menu: {replace: FcPropCardData | undefined; addSection: AddMenuType[]};
    };
  };
};

export type ExtensionImport_Renderer = {
  InitialExtensions: (lynxAPI: ExtensionRendererApi, extensionId: string) => void;
};
