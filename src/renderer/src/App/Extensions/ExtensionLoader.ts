import {compact} from 'lodash';
import {Dispatch, SetStateAction} from 'react';

import {
  ExtensionStatusBar,
  ExtensionTitleBar,
  StatusBarComponent,
  TitleBarComponent,
} from '../../../../cross/ExtensionTypes';

export const loadStatusBar = (
  setStatusBar: Dispatch<SetStateAction<ExtensionStatusBar>>,
  StatusBar: StatusBarComponent[],
) => {
  const [Container] = compact(StatusBar.map(status => status.Container));

  const start = compact(StatusBar.map(status => status.Start));
  const center = compact(StatusBar.map(status => status.Center));
  const end = compact(StatusBar.map(status => status.End));

  const add = {
    start,
    center,
    end,
  };

  const result = {Container, add};

  setStatusBar(result);
};

export const loadTitleBar = (
  setTitleBar: Dispatch<SetStateAction<ExtensionTitleBar>>,
  TitleBar: TitleBarComponent[],
) => {
  const AddStart = compact(TitleBar.map(title => title.AddStart));

  const [ReplaceCenter] = compact(TitleBar.map(title => title.ReplaceCenter));
  const AddCenter = compact(TitleBar.map(title => title.AddCenter));

  const [ReplaceEnd] = compact(TitleBar.map(title => title.ReplaceEnd));
  const AddEnd = compact(TitleBar.map(title => title.AddEnd));

  const result = {
    AddStart,

    ReplaceCenter,
    AddCenter,

    ReplaceEnd,
    AddEnd,
  };

  setTitleBar(result);
};
