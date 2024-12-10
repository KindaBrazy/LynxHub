import {Rocket_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons5';
import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsStartupStartMinimized from './SettingsStartup-StartMinimized';
import SettingsStartupStartPage from './SettingsStartup-StartPage';
import SettingsStartupSystem from './SettingsStartup-System';

export const SettingsStartupId = 'settings_startup_elem';

export default function SettingsStartup() {
  return (
    <SettingsSection title="Startup" id={SettingsStartupId} icon={<Rocket_Icon className="size-5" />}>
      {window.osPlatform === 'win32' && <SettingsStartupSystem />}
      <SettingsStartupStartMinimized />
      <SettingsStartupStartPage />
    </SettingsSection>
  );
}
