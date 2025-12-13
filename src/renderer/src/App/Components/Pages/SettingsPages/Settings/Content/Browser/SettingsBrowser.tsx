import {Web_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsBrowser_AudioControl from './SettingsBrowser_AudioControl';
import SettingsBrowser_ClearData from './SettingsBrowser_ClearData';
import SettingsBrowser_Downloads from './SettingsBrowser_Downloads';
import SettingsBrowser_Links from './SettingsBrowser_Links';
import SettingsBrowser_UserAgent from './SettingsBrowser_UserAgent';

export const SettingsBrowserId = 'settings_browser_elem';

export default function SettingsBrowser() {
  return (
    <SettingsSection title="Browser" id={SettingsBrowserId} icon={<Web_Icon className="size-5" />}>
      <SettingsBrowser_Links />
      <SettingsBrowser_UserAgent />
      <SettingsBrowser_Downloads />
      <SettingsBrowser_AudioControl />
      <SettingsBrowser_ClearData />
    </SettingsSection>
  );
}
