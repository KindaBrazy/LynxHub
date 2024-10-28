import {compact, isEmpty} from 'lodash';
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import {isDev} from '../../../../cross/CrossUtils';
import rendererIpc from '../RendererIpc';
import {loadStatusBar} from './ExtensionLoader';
import {ExtensionAppBackground, ExtensionImport, ExtensionStatusBar} from './ExtensionTypes';
import {getRemote, setRemote} from './Vite-Federation';

type ExtensionContextData = {
  loadingExtensions: boolean;
  statusBar: ExtensionStatusBar;
  background: ExtensionAppBackground;
};

const ExtensionContext = createContext<ExtensionContextData>({
  loadingExtensions: false,
  statusBar: undefined,
  background: undefined,
});

export default function ExtensionsProvider({children}: {children: ReactNode}) {
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(false);

  const [statusBar, setStatusBar] = useState<ExtensionStatusBar>(undefined);
  const [background, setBackground] = useState<ExtensionAppBackground>(undefined);
  useEffect(() => {
    const loadExtensions = async () => {
      setStatusBar(undefined);
      let importedExtensions: ExtensionImport[] = [];
      if (isDev()) {
        const extension = await import('../../../extension/Extension');
        importedExtensions = [extension];
      } else {
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

        importedExtensions = await Promise.all(folderNames.map(folderName => getRemote(folderName, 'Extension')));
      }

      const StatusBars = compact(importedExtensions.map(ext => ext.StatusBar));
      const Background = compact(importedExtensions.map(ext => ext.Background));

      if (!isEmpty(StatusBars)) loadStatusBar(setStatusBar, StatusBars);
      if (!isEmpty(Background)) setBackground(Background[0]);

      setLoadingExtensions(false);
    };

    loadExtensions();
  }, []);

  const contextValue: ExtensionContextData = useMemo(() => {
    return {loadingExtensions, statusBar, background};
  }, [loadingExtensions, statusBar, background]);

  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
}

export const useExtensions = () => {
  return useContext(ExtensionContext);
};
