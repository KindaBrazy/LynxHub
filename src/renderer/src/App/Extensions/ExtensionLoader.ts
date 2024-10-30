import {compact} from 'lodash';
import {Dispatch, SetStateAction} from 'react';

import {
  ExtensionModal,
  ExtensionNavBar,
  ExtensionStatusBar,
  ExtensionTitleBar,
  ModalsComponent,
  NavBarComponent,
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

  setTitleBar({AddStart, ReplaceCenter, AddCenter, ReplaceEnd, AddEnd});
};

export const loadNavBar = (setNavBar: Dispatch<SetStateAction<ExtensionNavBar>>, NavBarData: NavBarComponent[]) => {
  const [NavBar] = compact(NavBarData.map(nav => nav.NavBar));

  const [ContentButtons] = compact(NavBarData.map(title => title.ContentButtons));
  const [SettingsButtons] = compact(NavBarData.map(title => title.SettingsButtons));

  const AddContentButton = compact(NavBarData.map(title => title.AddContentButton));
  const AddSettingsButton = compact(NavBarData.map(title => title.AddSettingsButton));

  setNavBar({NavBar, ContentButtons, SettingsButtons, AddContentButton, AddSettingsButton});
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
