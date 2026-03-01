import {HeroUIProvider, ToastProvider} from '@heroui/react';
import {useAppState} from '@lynx/redux/reducers/app';
import {ReactNode} from 'react';

/**
 * Configures HeroUI and Ant Design providers for the application.
 * Handles theme switching and global configuration for toast/message notifications.
 *
 * @param props - The component props
 * @param props.children - The child components to wrap
 */
export default function UIProviders({children}: {children: ReactNode}) {
  const toastPlacement = useAppState('toastPlacement');

  return (
    <HeroUIProvider>
      <ToastProvider placement={toastPlacement} />
      {children}
    </HeroUIProvider>
  );
}
