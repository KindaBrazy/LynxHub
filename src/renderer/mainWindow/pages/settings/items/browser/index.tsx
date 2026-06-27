import SettingsSection from '@lynx/components/SettingsSection';
import {Earth} from '@solar-icons/react-perf/BoldDuotone';

import AudioControl from './AudioControl';
import ClearBrowserData from './ClearBrowserData';
import Downloads from './Downloads';
import ExternalLinks from './ExternalLinks';
import HistoryLimits from './HistoryLimits';
import UserAgent from './UserAgent';

export const SettingsBrowserId = 'settings_browser_elem';

export default function SettingsBrowser() {
  return (
    <SettingsSection title="Browser" id={SettingsBrowserId} icon={<Earth className="size-5" />}>
      <ExternalLinks />
      <UserAgent />
      <Downloads />
      <AudioControl />
      <HistoryLimits />
      <ClearBrowserData />
    </SettingsSection>
  );
}
