import {ReactNode} from 'react';

import {ContainerElements, StatusBarComponent} from '../../../extension/types';

export type ExtensionStatusBar =
  | {
      Container?: (elements: ContainerElements) => ReactNode;
      add: ContainerElements;
    }
  | undefined;

export type ExtensionImport = {
  StatusBar: StatusBarComponent;
};
