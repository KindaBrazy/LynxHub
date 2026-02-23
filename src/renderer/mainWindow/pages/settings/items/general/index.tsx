import SettingsSection from '@lynx/components/SettingsSection';
import {SettingPage_Icon} from '@lynx_assets/icons/pages';

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
    <SettingsSection title="General" id={SettingsGeneralId} icon={<SettingPage_Icon className="size-5" />}>
      <Theme />
      <Taskbar />
      <Tooltip />
      <TitleName />
      <Confirm />
      <CollectErrors />
    </SettingsSection>
  );
}
