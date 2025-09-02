import {StyleProvider} from '@ant-design/cssinjs';
import {HeroUIProvider, ToastProvider} from '@heroui/react';
import {ConfigProvider as AntDProvider, message, notification, theme} from 'antd';
import {ReactNode, useLayoutEffect, useMemo} from 'react';

import {useAppState} from './Redux/Reducer/AppReducer';

/** Config HeroUI and AntD and return providers */
export default function UIProviders({children}: {children: ReactNode}) {
  const darkMode = useAppState('darkMode');
  const toastPlacement = useAppState('toastPlacement');
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
        <ToastProvider placement={toastPlacement} />
        <AntDProvider
          theme={{
            algorithm,
            components: {
              Button: {colorPrimaryBorder: 'rgba(0,0,0,0)'},
              Tooltip: {colorBgSpotlight, colorTextLightSolid},
            },
            token: {colorBgMask: 'rgba(0, 0, 0, 0.2)', fontFamily: 'Nunito, sans-serif'},
          }}>
          <StyleProvider layer>{children}</StyleProvider>
        </AntDProvider>
      </HeroUIProvider>
    </div>
  );
}
