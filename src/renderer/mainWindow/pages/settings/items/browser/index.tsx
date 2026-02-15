import SettingsSection from '@lynx/components/ContentSection';
import {Earth} from '@solar-icons/react-perf/BoldDuotone';

import AudioControl from './AudioControl';
import ClearData from './ClearData';
import Downloads from './Downloads';
import Links from './Links';
import UserAgent from './UserAgent';

export const SettingsBrowserId = 'settings_browser_elem';

export default function SettingsBrowser() {
  return (
    <SettingsSection title="Browser" id={SettingsBrowserId} icon={<Earth className="size-5" />}>
      <Links />
      <UserAgent />
      <Downloads />
      <AudioControl />
      <ClearData />
    </SettingsSection>
  );
}
