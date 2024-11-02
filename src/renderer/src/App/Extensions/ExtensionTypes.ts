import {ComponentProps, FC} from 'react';
import {RouteObject} from 'react-router-dom';

// -----------------------------------------------> Elements & Props
export type ElementProps = ComponentProps<'div'>;

export type FcProp = FC<ElementProps>;

// -----------------------------------------------> Extension Renderer API

type CompFc = (component: FC) => void;
type CompFcProp = (component: FcProp) => void;

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
      };
    };
  };
};

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
      };
    };
  };
};

export type ExtensionImport_Renderer = {
  InitialExtensions: (lynxAPI: ExtensionRendererApi) => void;
};
