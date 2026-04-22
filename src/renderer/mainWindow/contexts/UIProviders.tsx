import {HeroUIProvider} from '@heroui/react';
import {ReactNode} from 'react';

/**
 * Configures HeroUI and Ant Design providers for the application.
 * Handles theme switching and global configuration for toast/message notifications.
 *
 * @param props - The component props
 * @param props.children - The child components to wrap
 */
export default function UIProviders({children}: {children: ReactNode}) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
