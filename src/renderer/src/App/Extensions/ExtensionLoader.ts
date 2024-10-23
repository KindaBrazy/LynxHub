import {compact} from 'lodash';
import {Dispatch, SetStateAction} from 'react';

import {StatusBarComponent} from '../../../extension/types';
import {ExtensionStatusBar} from './ExtensionTypes';

export const loadStatusBar = (
  setStatusBar: Dispatch<SetStateAction<ExtensionStatusBar>>,
  StatusBar: StatusBarComponent,
) => {
  const container = StatusBar.Container;
  const start = StatusBar.Start;
  const center = StatusBar.Center;
  const end = StatusBar.End;

  setStatusBar(prevState => {
    if (prevState) {
      if (!prevState.Container) {
        prevState.Container = container;
      }
      if (start) prevState.add.start.push(start);
      if (center) prevState.add.start.push(center);
      if (end) prevState.add.start.push(end);
    } else {
      prevState = {
        Container: container,
        add: {
          start: compact([start]),
          center: compact([center]),
          end: compact([end]),
        },
      };
    }

    return prevState;
  });
};
