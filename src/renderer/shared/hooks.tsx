import {useCallback, useEffect, useState} from 'react';

import applicationIpc from './ipc/application';

export function useDocumentDarkMode(className?: string) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const setDark = useCallback((isDark: boolean) => {
    document.documentElement.className = `${isDark ? 'dark' : 'light'} ${className}`;
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    applicationIpc.invoke.isDarkMode().then(setDark);

    const offDarkMode = applicationIpc.on.darkMode(setDark);

    return () => offDarkMode();
  }, []);

  return isDarkMode;
}
