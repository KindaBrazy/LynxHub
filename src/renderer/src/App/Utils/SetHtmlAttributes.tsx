import {useEffect} from 'react';

import {APP_NAME} from '../../../../cross/CrossConstants';
import {useAppState} from '../Redux/Reducer/AppReducer';
import {useSettingsState} from '../Redux/Reducer/SettingsReducer';

/** HTML attributes and document title */
export default function useHtmlAttributes() {
  const darkMode = useAppState('darkMode');
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
    document.documentElement.className = `select-none text-foreground bg-background overflow-hidden 
    ${darkMode ? 'dark' : 'light'}`;
  }, [darkMode]);
}
