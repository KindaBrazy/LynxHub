import {memo} from 'react';

import {useRegisterHotkeys} from './hotkeys';
import useHtmlAttributes from './html_attributes';
import {useClearOldFaviconCache, useMigrateCardTitles} from './migration';
import {useFilterPinnedCards} from './states';
import useAppEvents from './useEvents';
import useVolumeSync from './volume';

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
