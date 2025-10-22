import {EditCard_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../SettingsPage-ContentSection';
import CheckUpdateInterval from './CheckUpdateInterval';

export const SettingsCardId = 'settings_card_elem';

/** Reporting app issues on GitHub */
export default function SettingsCard() {
  return (
    <SettingsSection title="Card" id={SettingsCardId} icon={<EditCard_Icon className="size-5" />} itemsCenter>
      <CheckUpdateInterval />
    </SettingsSection>
  );
}
