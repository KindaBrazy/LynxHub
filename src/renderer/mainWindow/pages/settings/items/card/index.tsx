import SettingsSection from '@lynx/components/SettingsSection';
import { Card as CardIcon } from '@solar-icons/react-perf/BoldDuotone';

import UpdateInterval from './UpdateInterval';

export const SettingsCardId = 'settings_card_elem';

/**
 * Renders the "Card" settings section, containing options
 * for updating and managing dashboard cards.
 */
export default function SettingsCard() {
  return (
    <SettingsSection title="Card" id={SettingsCardId} icon={<CardIcon className="size-5" />} itemsCenter>
      <UpdateInterval />
    </SettingsSection>
  );
}
