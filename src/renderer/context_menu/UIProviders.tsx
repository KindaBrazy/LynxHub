import {HeroUIProvider, ToastProvider} from '@heroui/react';
import {ConfigProvider as AntDProvider, message, notification, theme} from 'antd';
import {ReactNode, useEffect, useLayoutEffect, useMemo, useState} from 'react';

import rendererIpc from '../src/App/RendererIpc';

/** Config HeroUI and AntD and return providers */
export default function UIProviders({children}: {children: ReactNode}) {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const algorithm = useMemo(() => (darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm), [darkMode]);
  const colorBgSpotlight = useMemo(() => (darkMode ? '#424242' : 'white'), [darkMode]);
  const colorTextLightSolid = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

  useEffect(() => {
    rendererIpc.storage.get('app').then(({darkMode}) => {
      if (darkMode === 'dark') {
        setDarkMode(true);
      } else if (darkMode === 'light') {
        setDarkMode(false);
      } else {
        rendererIpc.win.getSystemDarkMode().then(result => {
          setDarkMode(result === 'dark');
        });
      }
    });
    const removeOnDarkListener = rendererIpc.win.onDarkMode((_, darkMode) => {
      if (darkMode === 'dark') {
        setDarkMode(true);
      } else if (darkMode === 'light') {
        setDarkMode(false);
      } else {
        rendererIpc.win.getSystemDarkMode().then(result => {
          setDarkMode(result === 'dark');
        });
      }
    });

    return () => removeOnDarkListener();
  }, []);

  useLayoutEffect(() => {
    AntDProvider.config({
      holderRender: children => (
        <AntDProvider
          theme={{
            algorithm,
            token: {fontFamily: 'Nunito, sans-serif'},
          }}>
          {children}
        </AntDProvider>
      ),
    });
    message.config({top: 38, duration: 2});
    notification.config({duration: 4, placement: 'bottomRight'});
  }, [algorithm]);

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <div>
      <HeroUIProvider>
        <ToastProvider />

        <AntDProvider
          theme={{
            algorithm,
            components: {
              Button: {colorPrimaryBorder: 'rgba(0,0,0,0)'},
              Tooltip: {colorBgSpotlight, colorTextLightSolid},
            },
            token: {colorBgMask: 'rgba(0, 0, 0, 0.2)', fontFamily: 'Nunito, sans-serif'},
          }}>
          <div className="bg-background text-foreground">{children}</div>
        </AntDProvider>
      </HeroUIProvider>
    </div>
  );
}
