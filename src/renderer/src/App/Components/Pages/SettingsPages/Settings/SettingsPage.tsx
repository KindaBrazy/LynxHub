import Page from '../../Page';
import SettingsPageContents from './SettingsPage-Contents';
import SettingsPageNav from './SettingsPage-Nav';

export const settingsPageID: string = 'settingsPage';

/** App setting manager */
const SettingsPage = () => (
  <Page>
    <div className="flex size-full flex-row pb-4 space-x-1 absolute">
      <SettingsPageNav />
      <SettingsPageContents />
    </div>
  </Page>
);

export default SettingsPage;
