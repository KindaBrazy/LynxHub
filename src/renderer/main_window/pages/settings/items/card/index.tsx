import SettingsSection from '@lynx/components/ContentSection';
import {Card as CardIcon} from '@solar-icons/react-perf/BoldDuotone';

import CheckUpdateInterval from './UpdateInterval';

export const SettingsCardId = 'settings_card_elem';

/** Reporting app issues on GitHub */
export default function SettingsCard() {
  return (
    <SettingsSection title="Card" id={SettingsCardId} icon={<CardIcon className="size-5" />} itemsCenter>
      <CheckUpdateInterval />
    </SettingsSection>
  );
}
