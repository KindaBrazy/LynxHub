import {compact, isEmpty} from 'lodash';
import {Dispatch, SetStateAction} from 'react';

import {
  ExtensionModal,
  ExtensionNavBar,
  ExtensionRunningAI,
  ExtensionStatusBar,
  ExtensionTitleBar,
  ModalsComponent,
  NavBarComponent,
  RunningAIComponent,
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

  if (!Container && isEmpty(start) && isEmpty(center) && isEmpty(end)) return;

  const add = {start, center, end};

  setStatusBar({Container, add});
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

  if (isEmpty(AddStart) && !ReplaceCenter && isEmpty(AddCenter) && !ReplaceEnd && isEmpty(AddEnd)) return;

  setTitleBar({AddStart, ReplaceCenter, AddCenter, ReplaceEnd, AddEnd});
};

export const loadNavBar = (setNavBar: Dispatch<SetStateAction<ExtensionNavBar>>, NavBarData: NavBarComponent[]) => {
  const [NavBar] = compact(NavBarData.map(nav => nav.NavBar));

  const [ContentButtons] = compact(NavBarData.map(title => title.ContentButtons));
  const [SettingsButtons] = compact(NavBarData.map(title => title.SettingsButtons));

  const AddContentButton = compact(NavBarData.map(title => title.AddContentButton));
  const AddSettingsButton = compact(NavBarData.map(title => title.AddSettingsButton));

  if (!NavBar && !ContentButtons && !SettingsButtons && isEmpty(AddContentButton) && isEmpty(AddSettingsButton)) return;

  setNavBar({NavBar, ContentButtons, SettingsButtons, AddContentButton, AddSettingsButton});
};

export const loadRunningAI = (
  setRunningAI: Dispatch<SetStateAction<ExtensionRunningAI>>,
  RunningAI: RunningAIComponent[],
) => {
  const [Container] = compact(RunningAI.map(running => running.Container));
  const [Terminal] = compact(RunningAI.map(running => running.Terminal));
  const [Browser] = compact(RunningAI.map(running => running.Browser));

  if (!Container && !Terminal && !Browser) return;

  setRunningAI({Container, Terminal, Browser});
};

export const loadModal = (setModals: Dispatch<SetStateAction<ExtensionModal>>, Modals: ModalsComponent[]) => {
  const [InstallModal] = compact(Modals.map(modal => modal.InstallModal));
  const [InstallUIModal] = compact(Modals.map(modal => modal.InstallUIModal));
  const [CardInfoModal] = compact(Modals.map(modal => modal.CardInfoModal));
  const [WarningModal] = compact(Modals.map(modal => modal.WarningModal));
  const [UpdateApp] = compact(Modals.map(modal => modal.UpdateApp));
  const [CardExtensions] = compact(Modals.map(modal => modal.CardExtensions));
  const [UninstallCard] = compact(Modals.map(modal => modal.UninstallCard));
  const [UpdatingNotification] = compact(Modals.map(modal => modal.UpdatingNotification));
  const [LaunchConfig] = compact(Modals.map(modal => modal.LaunchConfig));

  if (
    !InstallModal &&
    !InstallUIModal &&
    !CardInfoModal &&
    !WarningModal &&
    !UpdateApp &&
    !CardExtensions &&
    !UninstallCard &&
    !UpdatingNotification &&
    !LaunchConfig
  ) {
    return;
  }

  setModals({
    InstallModal,
    InstallUIModal,
    CardInfoModal,
    WarningModal,
    UpdateApp,
    CardExtensions,
    UninstallCard,
    UpdatingNotification,
    LaunchConfig,
  });
};
