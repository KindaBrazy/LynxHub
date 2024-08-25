import SettingsSection from '../../SettingsPage-ContentSection';
import SettingsGeneralCompactMode from './SettingsGeneral-CompactMode';
import SettingsGeneralConfirm from './SettingsGeneral-Confirm';
import SettingsGeneralTaskbar from './SettingsGeneral-Taskbar';
import SettingsGeneralTheme from './SettingsGeneral-Theme';
import SettingsGeneralTooltip from './SettingsGeneral-Tooltip';

export const SettingsGeneralId = 'settings_app_elem';

export default function SettingsGeneral() {
  return (
    <SettingsSection icon="Tuning" title="General" id={SettingsGeneralId}>
      <SettingsGeneralTheme />
      <SettingsGeneralTaskbar />
      <SettingsGeneralTooltip />
      <SettingsGeneralCompactMode />
      <SettingsGeneralConfirm />
    </SettingsSection>
  );
}
