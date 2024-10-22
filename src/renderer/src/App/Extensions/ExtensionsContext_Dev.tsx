import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import {StatusBar} from '../../../extension/Extension';
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
      const start = StatusBar.Start;
      const center = StatusBar.Center;
      const end = StatusBar.End;

      setStatusBar(prevState => {
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

        return prevState;
      });

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
