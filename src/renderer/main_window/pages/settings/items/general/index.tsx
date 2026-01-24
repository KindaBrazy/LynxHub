import SettingsSection from '@lynx/components/ContentSection';
import {Tuning_Icon} from '@lynx_assets/icons';

import CollectErrors from './CollectErrors';
import Confirm from './Confirm';
import Taskbar from './Taskbar';
import Theme from './Theme';
import TitleName from './TitleName';
import Tooltip from './Tooltip';

export const SettingsGeneralId = 'settings_app_elem';

export default function SettingsGeneral() {
  return (
    <SettingsSection title="General" id={SettingsGeneralId} icon={<Tuning_Icon className="size-5" />}>
      <Theme />
      <Taskbar />
      <Tooltip />
      <TitleName />
      <Confirm />
      <CollectErrors />
    </SettingsSection>
  );
}
