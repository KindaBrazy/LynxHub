import {compact} from 'lodash';
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import rendererIpc from '../RendererIpc';
import {loadStatusBar} from './ExtensionLoader';
import {ExtensionStatusBar} from './ExtensionTypes';
import {getRemote, setRemote} from './Vite-Federation';

type ExtensionContextData = {
  statusBar: ExtensionStatusBar;
  loadingExtensions: boolean;
};

const ExtensionContext = createContext<ExtensionContextData>({
  loadingExtensions: false,
  statusBar: undefined,
});

export default function ExtensionsProvider_Prod({children}: {children: ReactNode}) {
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(false);

  const [statusBar, setStatusBar] = useState<ExtensionStatusBar>(undefined);

  useEffect(() => {
    const loadExtensions = async () => {
      const extensionDataAddress: string[] = await rendererIpc.extension.getExtensionsData();
      const finalAddress: string[] = extensionDataAddress.map(ext => `${ext}/scripts/renderer/rendererEntry.mjs`);

      const folderNames = compact(
        finalAddress.map(url => {
          const match = url.match(/:\/\/[^/]+\/([^/]+)\/scripts/);
          return match ? match[1] : null;
        }),
      );

      finalAddress.forEach((url, index) => {
        setRemote(folderNames[index], {
          format: 'esm',
          from: 'vite',
          url,
        });
      });

      const importedExtensions = await Promise.all(folderNames.map(folderName => getRemote(folderName, 'Extension')));

      const StatusBars = importedExtensions.map(ext => ext.StatusBar);

      loadStatusBar(setStatusBar, StatusBars);

      setLoadingExtensions(false);
    };

    loadExtensions();
  }, []);

  const contextValue: ExtensionContextData = useMemo(() => {
    return {loadingExtensions, statusBar};
  }, [loadingExtensions, statusBar]);

  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
}

export const useExtensions_Prod = () => {
  return useContext(ExtensionContext);
};
