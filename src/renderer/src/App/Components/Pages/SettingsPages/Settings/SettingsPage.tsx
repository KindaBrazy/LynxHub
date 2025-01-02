import Page from '../../Page';
import SettingsPageContents from './SettingsPage-Contents';
import SettingsPageNav from './SettingsPage-Nav';

export const settingsRoutePath: string = '/settingsPage';
export const settingsElementId: string = 'settingsElement';

/** App setting manager */
const SettingsPage = () => (
  <Page id={settingsElementId}>
    <div className="flex size-full flex-row pb-4 space-x-1 absolute">
      <SettingsPageNav />
      <SettingsPageContents />
    </div>
  </Page>
);

export default SettingsPage;
