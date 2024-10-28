import {ReactNode} from 'react';

import {ContainerElements, ElementComp, StatusBarComponent} from '../../../../cross/ExtensionTypes';

export type ExtensionStatusBar =
  | {
      Container?: (elements: ContainerElements) => ReactNode;
      add: ContainerElements;
    }
  | undefined;

export type ExtensionAppBackground = (() => ReactNode) | undefined;

export type ExtensionImport = {
  StatusBar?: StatusBarComponent;
  Background?: ExtensionAppBackground;
  CustomHook?: ElementComp;
};
