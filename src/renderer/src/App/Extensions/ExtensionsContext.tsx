import {compact, isEmpty} from 'lodash';
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import {ExtensionModal, ExtensionNavBar, ExtensionRunningAI, FcProp} from '../../../../cross/ExtensionTypes';
import {ExtensionAppBackground, ExtensionStatusBar, ExtensionTitleBar} from '../../../../cross/ExtensionTypes';
import {importedExtensions} from '../../main';
import {loadModal, loadNavBar, loadRunningAI, loadStatusBar, loadTitleBar} from './ExtensionLoader';

type ExtensionContextData = {
  loadingExtensions: boolean;
  statusBar: ExtensionStatusBar;
  titleBar: ExtensionTitleBar;
  navBar: ExtensionNavBar;
  runningAI: ExtensionRunningAI;
  modals: ExtensionModal;
  background: ExtensionAppBackground;
  customHooks: FcProp[];
};

const ExtensionContext = createContext<ExtensionContextData>({
  loadingExtensions: false,
  statusBar: undefined,
  titleBar: undefined,
  navBar: undefined,
  runningAI: undefined,
  modals: undefined,
  background: undefined,
  customHooks: [],
});

export default function ExtensionsProvider({children}: {children: ReactNode}) {
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(true);

  const [statusBar, setStatusBar] = useState<ExtensionStatusBar>(undefined);
  const [titleBar, setTitleBar] = useState<ExtensionTitleBar>(undefined);
  const [navBar, setNavBar] = useState<ExtensionNavBar>(undefined);
  const [runningAI, setRunningAI] = useState<ExtensionRunningAI>(undefined);
  const [modals, setModals] = useState<ExtensionModal>(undefined);
  const [background, setBackground] = useState<ExtensionAppBackground>(undefined);
  const [customHooks, setCustomHooks] = useState<FcProp[]>([]);

  useEffect(() => {
    const loadExtensions = async () => {
      const StatusBars = compact(importedExtensions.map(ext => ext.StatusBar));
      const TitleBar = compact(importedExtensions.map(ext => ext.TitleBar));
      const NavBar = compact(importedExtensions.map(ext => ext.NavBar));
      const RunningAI = compact(importedExtensions.map(ext => ext.RunningAI));
      const Modals = compact(importedExtensions.map(ext => ext.Modals));
      const Background = compact(importedExtensions.map(ext => ext.Background));
      const CustomHooks = compact(importedExtensions.map(ext => ext.CustomHook));

      if (!isEmpty(StatusBars)) loadStatusBar(setStatusBar, StatusBars);
      if (!isEmpty(TitleBar)) loadTitleBar(setTitleBar, TitleBar);
      if (!isEmpty(NavBar)) loadNavBar(setNavBar, NavBar);
      if (!isEmpty(RunningAI)) loadRunningAI(setRunningAI, RunningAI);
      if (!isEmpty(Modals)) loadModal(setModals, Modals);
      if (!isEmpty(Background)) setBackground(Background[0]);
      if (!isEmpty(CustomHooks)) setCustomHooks(CustomHooks);

      setLoadingExtensions(false);
    };

    loadExtensions();
  }, []);

  const contextValue: ExtensionContextData = useMemo(() => {
    return {loadingExtensions, statusBar, navBar, modals, runningAI, titleBar, background, customHooks};
  }, [loadingExtensions, statusBar, navBar, modals, runningAI, titleBar, background, customHooks]);

  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
}

export const useExtensions = () => {
  return useContext(ExtensionContext);
};
