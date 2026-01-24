import SettingsSection from '@lynx/components/ContentSection';
import {EditCard_Icon} from '@lynx_assets/icons';

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
