import SettingsSection from '@lynx/components/SettingsSection';
import {DashboardPage_Icon} from '@lynx_assets/icons/pages';
import {memo} from 'react';

import Profile_Account from './Account';

export const DashboardProfileId = 'settings_profile_elem';

const DashboardProfile = memo(() => {
  return (
    <SettingsSection title="Profiles" id={DashboardProfileId} icon={<DashboardPage_Icon className="size-5" />}>
      <Profile_Account />
      {/*<Profile_Google />*/}
    </SettingsSection>
  );
});

DashboardProfile.displayName = 'DashboardProfile';

export default DashboardProfile;
