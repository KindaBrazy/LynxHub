import {memo} from 'react';

import useAppEvents from './AppEvents/AppEvents';
import {useFilterPinnedCards} from './AppEvents/AppStates_Hooks';
import {useRegisterHotkeys} from './Utils/RegisterHotkeys';
import useHtmlAttributes from './Utils/SetHtmlAttributes';

const AppHooks = memo(() => {
  useHtmlAttributes();
  useRegisterHotkeys();
  useAppEvents();
  useFilterPinnedCards();

  return null;
});

export default AppHooks;
