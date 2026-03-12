import SettingsSection from '@lynx/components/SettingsSection';
import {SettingPage_Icon} from '@lynx_assets/icons/pages';
import {Shield} from '@solar-icons/react-perf/BoldDuotone';

import CollectErrors from './CollectErrors';
import Confirm from './Confirm';
import Taskbar from './Taskbar';
import Theme from './Theme';
import TitleName from './TitleName';
import Tooltip from './Tooltip';

export const SettingsGeneralId = 'settings_app_elem';

/**
 * General Settings section component.
 * Aggregates various general application settings like Theme, Taskbar, and Tooltips.
 */
export default function SettingsGeneral() {
  return (
    <>
      <SettingsSection title="General" id={SettingsGeneralId} icon={<SettingPage_Icon className="size-5" />}>
        <Theme />
        <Taskbar />
        <Tooltip />
        <TitleName />
        <CollectErrors />
      </SettingsSection>
      <SettingsSection
        description={
          <span>
            Hold <span className="bg-foreground-100 px-1 rounded-sm">CTRL</span> to bypass any of these confirmations.
          </span>
        }
        title="Confirmations"
        id={SettingsGeneralId}
        icon={<Shield className="size-5" />}>
        <Confirm />
      </SettingsSection>
    </>
  );
}
