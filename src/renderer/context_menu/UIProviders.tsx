import {HeroUIProvider, ToastProvider} from '@heroui/react';
import {ConfigProvider as AntDProvider, message, notification, theme} from 'antd';
import {ReactNode, useLayoutEffect, useMemo} from 'react';

import {useDocumentDarkMode} from '../CrossHooks';

/** Config HeroUI and AntD and return providers */
export default function UIProviders({children}: {children: ReactNode}) {
  const isDark = useDocumentDarkMode();

  const algorithm = useMemo(() => (isDark ? theme.darkAlgorithm : theme.defaultAlgorithm), [isDark]);
  const colorBgSpotlight = useMemo(() => (isDark ? '#424242' : 'white'), [isDark]);
  const colorTextLightSolid = useMemo(() => (isDark ? 'white' : 'black'), [isDark]);

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
