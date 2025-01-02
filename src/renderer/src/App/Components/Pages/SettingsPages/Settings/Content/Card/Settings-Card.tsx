import {EditCard_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons4';
import SettingsSection from '../../SettingsPage-ContentSection';
import ConfigCard from './ConfigCard/ConfigCard';
import PreviewCard from './PreviewCard';

export const SettingsCardId = 'settings_card_elem';

/** Reporting app issues on GitHub */
export default function SettingsCard() {
  return (
    <SettingsSection id={SettingsCardId} title="Customize Card" icon={<EditCard_Icon className="size-5" />} itemsCenter>
      <div className="flex md:flex-col lg:flex-row justify-between space-x-4">
        <div className="flex w-full flex-col gap-y-2">
          <ConfigCard />
        </div>
        <div className="flex w-full items-center justify-center">
          <PreviewCard />
        </div>
      </div>
    </SettingsSection>
  );
}
