import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsStartupStartMinimized from './SettingsStartup-StartMinimized';
import SettingsStartupStartPage from './SettingsStartup-StartPage';
import SettingsStartupSystem from './SettingsStartup-System';

export const SettingsStartupId = 'settings_startup_elem';

export default function SettingsStartup() {
  return (
    <SettingsSection icon="Rocket" title="Startup" id={SettingsStartupId}>
      {window.osPlatform !== 'linux' && <SettingsStartupSystem />}
      <SettingsStartupStartMinimized />
      <SettingsStartupStartPage />
    </SettingsSection>
  );
}
