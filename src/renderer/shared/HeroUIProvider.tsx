import {HeroUIProvider as HeroProvider, ToastProvider} from '@heroui/react';
import {ReactNode} from 'react';

import {useDocumentDarkMode} from './hooks';

/** Config HeroUI and AntD and return providers */
export default function HeroUIProvider({children}: {children: ReactNode}) {
  const isDark = useDocumentDarkMode();

  return (
    <div>
      <HeroProvider>
        <ToastProvider />
        <div className={`bg-background text-foreground ${isDark ? 'dark' : 'light'}`}>{children}</div>
      </HeroProvider>
    </div>
  );
}
