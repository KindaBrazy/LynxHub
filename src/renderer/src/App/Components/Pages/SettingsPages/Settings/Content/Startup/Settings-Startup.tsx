import {Rocket_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsStartupDisableLoadingAnim from './SettingsStartup-DisableLoadingAnim';
import SettingsStartupLastSize from './SettingsStartup-LastSize';
import SettingsStartupStartMinimized from './SettingsStartup-StartMinimized';
import SettingsStartupStartPage from './SettingsStartup-StartPage';
import SettingsStartupSystem from './SettingsStartup-System';

export const SettingsStartupId = 'settings_startup_elem';

export default function SettingsStartup() {
  return (
    <SettingsSection title="Startup" id={SettingsStartupId} icon={<Rocket_Icon className="size-5" />}>
      {window.osPlatform === 'win32' && <SettingsStartupSystem />}
      <SettingsStartupLastSize />
      <SettingsStartupStartMinimized />
      <SettingsStartupStartPage />
      <SettingsStartupDisableLoadingAnim />
    </SettingsSection>
  );
}
