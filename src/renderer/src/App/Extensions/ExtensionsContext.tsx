import {compact, isEmpty} from 'lodash';
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import {isDev} from '../../../../cross/CrossUtils';
import {ElementComp} from '../../../../cross/ExtensionTypes';
import rendererIpc from '../RendererIpc';
import {loadStatusBar, loadTitleBar} from './ExtensionLoader';
import {ExtensionAppBackground, ExtensionImport, ExtensionStatusBar, ExtensionTitleBar} from './ExtensionTypes';
import {getRemote, setRemote} from './Vite-Federation';

type ExtensionContextData = {
  loadingExtensions: boolean;
  statusBar: ExtensionStatusBar;
  titleBar: ExtensionTitleBar;
  background: ExtensionAppBackground;
  customHooks: ElementComp[];
};

const ExtensionContext = createContext<ExtensionContextData>({
  loadingExtensions: false,
  statusBar: undefined,
  titleBar: undefined,
  background: undefined,
  customHooks: [],
});

export default function ExtensionsProvider({children}: {children: ReactNode}) {
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(false);

  const [statusBar, setStatusBar] = useState<ExtensionStatusBar>(undefined);
  const [titleBar, setTitleBar] = useState<ExtensionTitleBar>(undefined);
  const [background, setBackground] = useState<ExtensionAppBackground>(undefined);
  const [customHooks, setCustomHooks] = useState<ElementComp[]>([]);

  useEffect(() => {
    const loadExtensions = async () => {
      setStatusBar(undefined);
      setTitleBar(undefined);
      setCustomHooks([]);
      let importedExtensions: ExtensionImport[];
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
      const TitleBar = compact(importedExtensions.map(ext => ext.TitleBar));
      const Background = compact(importedExtensions.map(ext => ext.Background));
      const CustomHooks = compact(importedExtensions.map(ext => ext.CustomHook));

      if (!isEmpty(StatusBars)) loadStatusBar(setStatusBar, StatusBars);
      if (!isEmpty(TitleBar)) loadTitleBar(setTitleBar, TitleBar);
      if (!isEmpty(Background)) setBackground(Background[0]);
      if (!isEmpty(CustomHooks)) setCustomHooks(CustomHooks);

      setLoadingExtensions(false);
    };

    loadExtensions();
  }, []);

  const contextValue: ExtensionContextData = useMemo(() => {
    return {loadingExtensions, statusBar, titleBar, background, customHooks};
  }, [loadingExtensions, statusBar, titleBar, background, customHooks]);

  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
}

export const useExtensions = () => {
  return useContext(ExtensionContext);
};
