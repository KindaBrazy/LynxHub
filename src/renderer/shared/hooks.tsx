import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../main_window/ipc';

export function useDocumentDarkMode(className?: string) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const setDark = useCallback((isDark: boolean) => {
    document.documentElement.className = `${isDark ? 'dark' : 'light'} ${className}`;
    setIsDarkMode(true);
  }, []);

  useEffect(() => {
    rendererIpc.win.isDarkMode().then(setDark);
    const offDarkMode = rendererIpc.win.onDarkMode((_, isDark) => {
      setDark(isDark);
    });

    return () => offDarkMode();
  }, []);

  return isDarkMode;
}
