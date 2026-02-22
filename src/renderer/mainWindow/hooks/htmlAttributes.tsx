import {useAppState} from '@lynx/redux/reducers/app';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {APP_NAME} from '@lynx_common/consts';
import {useEffect} from 'react';

/**
 * Manages HTML attributes and document title.
 * Handles dark mode classes and dynamic window title updates.
 */
export default function useHtmlAttributes() {
  const isDarkMode = useAppState('darkMode');
  const appTitle = useAppState('appTitle');
  const dynamicAppTitle = useSettingsState('dynamicAppTitle');

  // Sync document title
  useEffect(() => {
    const title =
      dynamicAppTitle && appTitle ? `${appTitle}${!appTitle?.endsWith('- ') ? ' -' : ''} ${APP_NAME}` : APP_NAME;
    if (document.title !== title) {
      document.title = title;
    }
  }, [appTitle, dynamicAppTitle]);

  // Set initial classes
  useEffect(() => {
    document.documentElement.className = `select-none text-foreground bg-background overflow-hidden `;
  }, []);

  // Sync dark mode class and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);
}
