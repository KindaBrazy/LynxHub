import {useEffect} from 'react';

import {APP_NAME} from '../../../../cross/CrossConstants';
import {useAppState} from '../Redux/App/AppReducer';

/** HTML attributes and document title */
export default function useHtmlAttributes() {
  const darkMode = useAppState('darkMode');

  useEffect(() => {
    // Set HTML attributes based on dark mode
    document.documentElement.className = `select-none text-foreground bg-background overflow-hidden 
    ${darkMode ? 'dark' : 'light'}`;

    // Set the document title
    document.title = APP_NAME;
  }, [darkMode]);
}
