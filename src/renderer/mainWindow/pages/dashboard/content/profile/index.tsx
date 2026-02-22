import SettingsSection from '@lynx/components/SettingsSection';
import {DashboardPage_Icon} from '@lynx_assets/icons/pages';

import Profile_Patreon from './Patreon';

export const DashboardProfileId = 'settings_profile_elem';

export default function DashboardProfile() {
  return (
    <SettingsSection title="Profiles" id={DashboardProfileId} icon={<DashboardPage_Icon className="size-5" />}>
      <Profile_Patreon />
      {/*<Profile_Google />*/}
    </SettingsSection>
  );
}
