import {StyleProvider} from '@ant-design/cssinjs';
import {HeroUIProvider, ToastProvider} from '@heroui/react';
import {useAppState} from '@lynx/redux/reducers/app';
import {ConfigProvider as AntDProvider, message, notification, theme} from 'antd';
import {ReactNode, useLayoutEffect, useMemo} from 'react';

/**
 * Configures HeroUI and Ant Design providers for the application.
 * Handles theme switching and global configuration for toast/message notifications.
 *
 * @param props - The component props
 * @param props.children - The child components to wrap
 */
export default function UIProviders({children}: {children: ReactNode}) {
  const darkMode = useAppState('darkMode');
  const toastPlacement = useAppState('toastPlacement');

  // Memoize theme configuration to prevent unnecessary re-calculations
  const algorithm = useMemo(() => (darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm), [darkMode]);
  const colorBgSpotlight = useMemo(() => (darkMode ? '#424242' : 'white'), [darkMode]);
  const colorTextLightSolid = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

  // Configure Ant Design static methods (message, notification) to use the correct context
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
  );
}
