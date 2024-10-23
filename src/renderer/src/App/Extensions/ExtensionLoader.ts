import {compact, isEmpty} from 'lodash';
import {Dispatch, SetStateAction} from 'react';

import {StatusBarComponent} from '../../../extension/types';
import {ExtensionStatusBar} from './ExtensionTypes';

export const loadStatusBar = (
  setStatusBar: Dispatch<SetStateAction<ExtensionStatusBar>>,
  StatusBar: StatusBarComponent[],
) => {
  const container = StatusBar.map(status => status.Container);
  const start = StatusBar.map(status => status.Start);
  const center = StatusBar.map(status => status.Center);
  const end = StatusBar.map(status => status.End);

  setStatusBar(prevState => {
    if (prevState) {
      if (!prevState.Container) {
        prevState.Container = container.pop();
      }
      if (!isEmpty(start)) prevState.add.start = compact([...prevState.add.start, ...start]);
      if (!isEmpty(center)) prevState.add.center = compact([...prevState.add.center, ...center]);
      if (!isEmpty(end)) prevState.add.end = compact([...prevState.add.end, ...end]);
    } else {
      prevState = {
        Container: container.pop(),
        add: {
          start: compact(start),
          center: compact(center),
          end: compact(end),
        },
      };
    }

    return prevState;
  });
};
