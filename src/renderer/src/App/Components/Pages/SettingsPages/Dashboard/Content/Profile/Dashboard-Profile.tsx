import {User_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../../Settings/SettingsPage-ContentSection';
import Profile_Patreon from './Profile_Patreon';

export const DashboardProfileId = 'settings_profile_elem';

export default function DashboardProfile() {
  return (
    <SettingsSection title="Profiles" id={DashboardProfileId} icon={<User_Icon className="size-5" />}>
      <Profile_Patreon />
      {/*<Profile_Google />*/}
    </SettingsSection>
  );
}
