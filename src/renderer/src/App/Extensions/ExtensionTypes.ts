import {ReactNode} from 'react';

import {ContainerElements, ElementComp, StatusBarComponent, TitleBarComponent} from '../../../../cross/ExtensionTypes';

export type ExtensionStatusBar =
  | {
      Container?: (elements: ContainerElements) => ReactNode;
      add: ContainerElements;
    }
  | undefined;

export type ExtensionAppBackground = (() => ReactNode) | undefined;

export type ExtensionTitleBar =
  | {
      AddStart?: ElementComp[];

      ReplaceCenter?: ElementComp;
      AddCenter?: ElementComp[];

      ReplaceEnd?: ElementComp;
      AddEnd?: ElementComp[];
    }
  | undefined;

export type ExtensionImport = {
  StatusBar?: StatusBarComponent;
  TitleBar?: TitleBarComponent;
  Background?: ExtensionAppBackground;
  CustomHook?: ElementComp;
};
