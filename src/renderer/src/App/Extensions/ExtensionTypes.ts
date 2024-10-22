import {ReactNode} from 'react';

export type StatusBarAdd = {place: 'start' | 'center' | 'end'; element: ReactNode}[];

export type ExtensionStatusBar =
  | {
      StatusBar: ReactNode;
      add: {start: Array<() => ReactNode>; center: Array<() => ReactNode>; end: Array<() => ReactNode>};
    }
  | undefined;
