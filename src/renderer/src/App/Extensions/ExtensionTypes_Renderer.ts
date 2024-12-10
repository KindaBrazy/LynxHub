import {Reducer} from '@reduxjs/toolkit';
import {ComponentProps, FC} from 'react';
import {RouteObject} from 'react-router';

import {CardData} from '../Modules/types';
import {DropDownSectionType} from '../Utils/Types';
import {ExtensionRendererApi} from './ExtensionTypes_Renderer_Api';

// -----------------------------------------------> Elements & Props
export type ElementProps = ComponentProps<'div'>;
export type CardElementProps = ComponentProps<'div'> & {cards: CardData[]};
export type SearchResultProps = ComponentProps<'div'> & {searchValue: string};
export type AddCardMenuProps = ComponentProps<'div'> & {
  addMenu: (sections: DropDownSectionType[], index?: number) => void;
};
export type ReplaceMdProps = ComponentProps<'div'> & {repoPath: string; rounded?: boolean};

export type FcProp = FC<ElementProps>;

export type FcPropCard = FC<CardElementProps>;
export type FcPropSearchResult = FC<SearchResultProps>;
export type FcPropAddCardMenu = FC<AddCardMenuProps>;
export type FcPropReplaceMd = FC<ReplaceMdProps>;

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
    install: FC | undefined;
    warning: FC | undefined;
    cardReadme: FC | undefined;
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
    replaceComponent: FC | undefined;
    customize: {
      header: FC | undefined;
      body: FC | undefined;
      footer: FC | undefined;
      menu: {replace: FC | undefined; addSection: FcPropAddCardMenu[]};
    };
  };
};

export type ExtensionImport_Renderer = {
  InitialExtensions: (lynxAPI: ExtensionRendererApi) => void;
};
