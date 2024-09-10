import {MantineProvider} from '@mantine/core';
import {NextUIProvider} from '@nextui-org/react';
import {ConfigProvider, message, notification, theme} from 'antd';
import {ReactNode, useLayoutEffect, useMemo} from 'react';

import {useAppState} from './Redux/App/AppReducer';

/** Config NextUI and AntD and return providers */
export default function UIProviders({children}: {children: ReactNode}) {
  const darkMode = useAppState('darkMode');
  const algorithm = useMemo(() => (darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm), [darkMode]);
  const colorBgSpotlight = useMemo(() => (darkMode ? '#424242' : 'white'), [darkMode]);
  const colorTextLightSolid = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

  useLayoutEffect(() => {
    ConfigProvider.config({
      holderRender: children => (
        <ConfigProvider
          theme={{
            algorithm,
            token: {fontFamily: 'Nunito, sans-serif'},
          }}>
          {children}
        </ConfigProvider>
      ),
    });
    message.config({top: 38, duration: 2});
    notification.config({duration: 4, placement: 'bottomRight'});
  }, [algorithm]);

  return (
    <div>
      <NextUIProvider>
        <ConfigProvider
          theme={{
            algorithm,
            components: {
              Button: {colorPrimaryBorder: 'rgba(0,0,0,0)'},
              Tooltip: {colorBgSpotlight, colorTextLightSolid},
            },
            token: {colorBgMask: 'rgba(0, 0, 0, 0.2)', fontFamily: 'Nunito, sans-serif'},
          }}>
          <MantineProvider forceColorScheme={darkMode ? 'dark' : 'light'}>{children}</MantineProvider>
        </ConfigProvider>
      </NextUIProvider>
    </div>
  );
}
