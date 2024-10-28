import {compact, isEmpty} from 'lodash';
import {Dispatch, SetStateAction} from 'react';

import {StatusBarComponent, TitleBarComponent} from '../../../../cross/ExtensionTypes';
import {ExtensionStatusBar, ExtensionTitleBar} from './ExtensionTypes';

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

export const loadTitleBar = (
  setTitleBar: Dispatch<SetStateAction<ExtensionTitleBar>>,
  TitleBar: TitleBarComponent[],
) => {
  const addStart = compact(TitleBar.map(title => title.AddStart));
  const addCenter = compact(TitleBar.map(title => title.AddCenter));
  const addEnd = compact(TitleBar.map(title => title.AddEnd));

  const replaceCenter = TitleBar[0].ReplaceCenter;
  const replaceEnd = TitleBar[0].ReplaceEnd;

  setTitleBar(prevState => {
    if (prevState) {
      if (!isEmpty(addStart) && prevState.AddStart) prevState.AddStart = compact([...prevState.AddStart, ...addStart]);

      if (!isEmpty(replaceCenter)) prevState.ReplaceCenter = replaceCenter;
      if (!isEmpty(addCenter) && prevState.AddCenter)
        prevState.AddCenter = compact([...prevState.AddCenter, ...addCenter]);

      if (!isEmpty(replaceEnd)) prevState.ReplaceEnd = replaceEnd;
      if (!isEmpty(addEnd) && prevState.AddEnd) prevState.AddEnd = compact([...prevState.AddEnd, ...addCenter]);
    } else {
      prevState = {
        AddStart: compact(addStart),

        ReplaceCenter: replaceCenter,
        AddCenter: compact(addCenter),

        ReplaceEnd: replaceEnd,
        AddEnd: compact(addEnd),
      };
    }

    return prevState;
  });
};
