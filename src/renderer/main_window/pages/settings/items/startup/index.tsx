import SettingsSection from '@lynx/components/ContentSection';
import {Rocket_Icon} from '@lynx_assets/icons';

import DisableLoadingAnim from './DisableLoadingAnim';
import LastSize from './LastSize';
import StartMaximized from './StartMaximized';
import StartMinimized from './StartMinimized';
import StartPage from './StartPage';
import System from './System';

export const SettingsStartupId = 'settings_startup_elem';

export default function SettingsStartup() {
  return (
    <SettingsSection title="Startup" id={SettingsStartupId} icon={<Rocket_Icon className="size-5" />}>
      {window.osPlatform === 'win32' && <System />}
      <LastSize />
      <StartMaximized />
      <StartMinimized />
      <StartPage />
      <DisableLoadingAnim />
    </SettingsSection>
  );
}
