import {HeroUIProvider} from '@heroui/react';
import {ConfigProvider as AntDProvider, message, notification, theme} from 'antd';
import {ReactNode, useLayoutEffect, useMemo} from 'react';

import {useAppState} from './Redux/App/AppReducer';

/** Config HeroUI and AntD and return providers */
export default function UIProviders({children}: {children: ReactNode}) {
  const darkMode = useAppState('darkMode');
  const algorithm = useMemo(() => (darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm), [darkMode]);
  const colorBgSpotlight = useMemo(() => (darkMode ? '#424242' : 'white'), [darkMode]);
  const colorTextLightSolid = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

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
        <AntDProvider
          theme={{
            algorithm,
            components: {
              Button: {colorPrimaryBorder: 'rgba(0,0,0,0)'},
              Tooltip: {colorBgSpotlight, colorTextLightSolid},
            },
            token: {colorBgMask: 'rgba(0, 0, 0, 0.2)', fontFamily: 'Nunito, sans-serif'},
          }}>
          {children}
        </AntDProvider>
      </HeroUIProvider>
    </div>
  );
}
