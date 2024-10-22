import SettingsSection from '../../SettingsPage-ContentSection';
import ConfigCard from './ConfigCard/ConfigCard';
import PreviewCard from './PreviewCard';

export const SettingsCardId = 'settings_card_elem';

/** Reporting app issues on GitHub */
export default function SettingsCard() {
  return (
    <SettingsSection icon="EditCard" id={SettingsCardId} title="Customize Card" itemsCenter>
      <div className="flex flex-row justify-between space-x-4">
        <div className="flex w-full flex-col gap-y-2">
          <ConfigCard />
        </div>
        <div className="flex w-fit items-center justify-center">
          <PreviewCard />
        </div>
      </div>
    </SettingsSection>
  );
}
