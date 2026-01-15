import {HeroUIProvider, ToastProvider} from '@heroui/react';
import {ReactNode} from 'react';

import {useDocumentDarkMode} from './CrossHooks';

/** Config HeroUI and AntD and return providers */
export default function HeroProvider({children}: {children: ReactNode}) {
  useDocumentDarkMode();

  return (
    <div>
      <HeroUIProvider>
        <ToastProvider />
        <div className="bg-background text-foreground">{children}</div>
      </HeroUIProvider>
    </div>
  );
}
