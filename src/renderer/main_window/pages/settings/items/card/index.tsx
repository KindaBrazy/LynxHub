import {EditCard_Icon} from '../../../../../shared/assets/icons';
import SettingsSection from '../../../../components/ContentSection';
import CheckUpdateInterval from './UpdateInterval';

export const SettingsCardId = 'settings_card_elem';

/** Reporting app issues on GitHub */
export default function SettingsCard() {
  return (
    <SettingsSection title="Card" id={SettingsCardId} icon={<EditCard_Icon className="size-5" />} itemsCenter>
      <CheckUpdateInterval />
    </SettingsSection>
  );
}
