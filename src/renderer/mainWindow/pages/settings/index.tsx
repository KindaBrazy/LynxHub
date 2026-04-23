import {memo} from 'react';

import Page from '../Page';
import SettingsPageContents from './Contents';
import SettingsPageNav from './Navigation';
import {useSectionSearchSnapshot} from './SettingsSearchRegistry';

/**
 * Main Settings Page wrapper component.
 * Composes the sidebar navigation and scrollable contents.
 */
const SettingsPage = memo(() => {
  const sectionTexts = useSectionSearchSnapshot();

  return (
    <Page>
      <div className="flex size-full flex-row pb-4 space-x-1 relative">
        <SettingsPageNav sectionTexts={sectionTexts} />
        <SettingsPageContents sectionTexts={sectionTexts} />
      </div>
    </Page>
  );
});

export default SettingsPage;
