import {APP_NAME} from '@lynx_common/consts';
import {useEffect} from 'react';

import {useAppState} from '../redux/reducers/app';
import {useSettingsState} from '../redux/reducers/settings';

/** HTML attributes and document title */
export default function useHtmlAttributes() {
  const isDarkMode = useAppState('darkMode');
  const appTitle = useAppState('appTitle');
  const dynamicAppTitle = useSettingsState('dynamicAppTitle');

  useEffect(() => {
    const title =
      dynamicAppTitle && appTitle ? `${appTitle}${!appTitle?.endsWith('- ') ? ' -' : ''} ${APP_NAME}` : APP_NAME;
    if (document.title !== title) {
      document.title = title;
    }
  }, [appTitle, dynamicAppTitle]);

  useEffect(() => {
    document.documentElement.className = `select-none text-foreground bg-background overflow-hidden `;
  }, []);

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
