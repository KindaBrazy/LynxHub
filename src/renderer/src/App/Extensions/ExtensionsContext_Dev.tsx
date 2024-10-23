import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import {StatusBar} from '../../../extension/Extension';
import {loadStatusBar} from './ExtensionLoader';
import {ExtensionStatusBar} from './ExtensionTypes';

type ExtensionContextData = {
  statusBar: ExtensionStatusBar;
  loadingExtensions: boolean;
};

const ExtensionContext = createContext<ExtensionContextData>({
  loadingExtensions: false,
  statusBar: undefined,
});

export default function ExtensionsProvider_Dev({children}: {children: ReactNode}) {
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(false);

  const [statusBar, setStatusBar] = useState<ExtensionStatusBar>(undefined);

  useEffect(() => {
    const loadExtensions = async () => {
      loadStatusBar(setStatusBar, StatusBar);

      setLoadingExtensions(false);
    };

    loadExtensions();
  }, []);

  const contextValue: ExtensionContextData = useMemo(() => {
    return {loadingExtensions, statusBar};
  }, [loadingExtensions, statusBar]);

  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
}

export const useExtensions_Dev = () => {
  return useContext(ExtensionContext);
};
