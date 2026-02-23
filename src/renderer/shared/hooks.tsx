import {useEffect, useState} from 'react';

import applicationIpc from './ipc/application';

/**
 * Applies the current application dark-mode state to the document root class
 * and keeps it synchronized with main-process dark-mode change events.
 *
 * @param className - Optional additional class name applied to `document.documentElement`.
 * @returns `true` when dark mode is active; otherwise `false`.
 */
export function useDocumentDarkMode(className?: string) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const applyDarkMode = (isDark: boolean) => {
      const rootClassName = [isDark ? 'dark' : 'light', className].filter(Boolean).join(' ');
      document.documentElement.className = rootClassName;
      setIsDarkMode(isDark);
    };

    applicationIpc.invoke.isDarkMode().then(applyDarkMode);

    const offDarkMode = applicationIpc.on.darkMode(applyDarkMode);

    return () => offDarkMode();
  }, [className]);

  return isDarkMode;
}
