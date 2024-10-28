import {Fragment, useEffect} from 'react';

import {useAppState} from '../../src/App/Redux/App/AppReducer';

export function CustomHook() {
  const darkMode = useAppState('darkMode');

  useEffect(() => {
    console.log('dark?: ', darkMode);
  }, [darkMode]);

  return <Fragment />;
}
