import {memo} from 'react';

import useAppEvents from './AppEvents/AppEvents';
import {useFilterPinnedCards} from './AppEvents/AppStates_Hooks';
import useVolumeSync from './AppEvents/VolumeSync';
import {useClearOldFaviconCache, useMigrateCardTitles} from './Utils/MigrationHooks';
import {useRegisterHotkeys} from './Utils/RegisterHotkeys';
import useHtmlAttributes from './Utils/SetHtmlAttributes';

const AppHooks = memo(() => {
  useHtmlAttributes();
  useRegisterHotkeys();
  useAppEvents();
  useFilterPinnedCards();
  useMigrateCardTitles();
  useClearOldFaviconCache();
  useVolumeSync();

  return null;
});

export default AppHooks;
