import {compact} from 'lodash';
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import {ExtensionStatusBar} from './ExtensionTypes';
import {getRemote, setRemote} from './Vite-Federation';

type ExtensionContextData = {
  statusBar: ExtensionStatusBar;
  loadingExtensions: boolean;
};

export const ExtensionContext = createContext<ExtensionContextData>({
  loadingExtensions: false,
  statusBar: undefined,
});

export default function ExtensionsProvider({children}: {children: ReactNode}) {
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(false);

  const [statusBar, setStatusBar] = useState<ExtensionStatusBar>(undefined);

  useEffect(() => {
    const loadExtensions = async () => {
      const extensionDataAddress: string[] = await window.electron.ipcRenderer.invoke('extension-address-data');
      const finalAddress: string[] = extensionDataAddress.map(ext => `${ext}/scripts/renderer/rendererEntry.mjs`);

      const folderNames = compact(
        finalAddress.map(url => {
          const match = url.match(/:\/\/[^/]+\/([^/]+)\/scripts/);
          return match ? match[1] : null;
        }),
      );

      finalAddress.forEach((url, index) => {
        console.log(url, index, folderNames[index]);
        setRemote(folderNames[index], {
          format: 'esm',
          from: 'vite',
          url,
        });
      });

      const importedExtensions = await Promise.all(folderNames.map(folderName => getRemote(folderName, 'Extension')));

      const extensions = importedExtensions.map(ext => ext.StatusBar);

      for (const extension of extensions) {
        const StatusBar = extension;
        const start = extension.Start;
        const center = extension.Center;
        const end = extension.End;

        setStatusBar(prevState => {
          console.log('prevState before: ', prevState);
          if (prevState) {
            if (!prevState.StatusBar) {
              prevState.StatusBar = StatusBar();
            }
            prevState.add.start.push(start);
            prevState.add.center.push(center);
            prevState.add.end.push(end);
          } else {
            prevState = {
              StatusBar: StatusBar(),
              add: {
                start: [start],
                center: [center],
                end: [end],
              },
            };
          }

          console.log('prevState after: ', prevState);
          return prevState;
        });
      }

      setLoadingExtensions(false);
    };

    loadExtensions();
  }, []);

  const contextValue: ExtensionContextData = useMemo(() => {
    return {loadingExtensions, statusBar};
  }, [loadingExtensions, statusBar]);

  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
}

export const useExtensions = () => {
  return useContext(ExtensionContext);
};
