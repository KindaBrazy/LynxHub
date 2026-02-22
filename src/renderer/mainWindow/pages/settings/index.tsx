import { memo } from 'react';

import Page from '../Page';
import SettingsPageContents from './Contents';
import SettingsPageNav from './Navigation';
import { useSectionSearchSnapshot } from './SettingsSearchRegistry';

/** Props for the SettingsPage component */
export type SettingsPageProps = {
  /** Whether the settings page should be shown */
  show: boolean;
};

/**
 * Main Settings Page wrapper component.
 * Composes the sidebar navigation and scrollable contents.
 */
const SettingsPage = memo(({ show }: SettingsPageProps) => {
  const sectionTexts = useSectionSearchSnapshot();

  return (
    <Page show={show}>
      <div className="flex size-full flex-row pb-4 space-x-1 relative">
        <SettingsPageNav sectionTexts={sectionTexts} />
        <SettingsPageContents sectionTexts={sectionTexts} />
      </div>
    </Page>
  );
});

export default SettingsPage;
