import type {ReactNode} from 'react';

import {useDocumentDarkMode} from './hooks';

/**
 * Props for the shared renderer HeroUI provider wrapper.
 */
interface SharedHeroUIProviderProps {
  children: ReactNode;
}

/**
 * Wraps child windows with HeroUI providers and synchronizes dark/light classes.
 */
export default function HeroUIProvider({children}: SharedHeroUIProviderProps) {
  const isDark = useDocumentDarkMode();

  return <div className={`bg-background text-foreground ${isDark ? 'dark' : 'light'}`}>{children}</div>;
}
