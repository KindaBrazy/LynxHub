import {User_Icon} from '../../../../../shared/assets/icons';
import SettingsSection from '../../../../components/ContentSection';
import Profile_Patreon from './Patreon';

export const DashboardProfileId = 'settings_profile_elem';

export default function DashboardProfile() {
  return (
    <SettingsSection title="Profiles" id={DashboardProfileId} icon={<User_Icon className="size-5" />}>
      <Profile_Patreon />
      {/*<Profile_Google />*/}
    </SettingsSection>
  );
}
