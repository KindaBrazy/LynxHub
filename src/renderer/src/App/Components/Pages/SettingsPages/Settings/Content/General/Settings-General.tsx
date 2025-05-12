import {Tuning_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons3';
import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsGeneralConfirm from './SettingsGeneral-Confirm';
import SettingsGeneralHwAcc from './SettingsGeneral-HWAcc';
import SettingsGeneralLinks from './SettingsGeneral-Links';
import SettingsGeneralTaskbar from './SettingsGeneral-Taskbar';
import SettingsGeneralTheme from './SettingsGeneral-Theme';
import SettingsGeneralTitleName from './SettingsGeneral-TitleName';
import SettingsGeneralTooltip from './SettingsGeneral-Tooltip';

export const SettingsGeneralId = 'settings_app_elem';

export default function SettingsGeneral() {
  return (
    <SettingsSection title="General" id={SettingsGeneralId} icon={<Tuning_Icon className="size-5" />}>
      <SettingsGeneralTheme />
      <SettingsGeneralTaskbar />
      <SettingsGeneralTooltip />
      <SettingsGeneralHwAcc />
      <SettingsGeneralLinks />
      <SettingsGeneralTitleName />
      <SettingsGeneralConfirm />
    </SettingsSection>
  );
}
