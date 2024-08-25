import Page from '../../Page';
import SettingsPageContents from './SettingsPage-Contents';
import SettingsPageNav from './SettingsPage-Nav';

export const settingsRoutePath: string = '/settingsPage';
export const settingsElementId: string = 'settingsElement';

/** App setting manager */
export default function SettingsPage() {
  return (
    <Page id={settingsElementId}>
      <div className="flex size-full flex-row space-x-1">
        <SettingsPageNav />
        <SettingsPageContents />
      </div>
    </Page>
  );
}
