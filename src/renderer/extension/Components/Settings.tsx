import SettingsSection from '../../src/App/Components/Pages/SettingsPages/Settings/SettingsPage-ContentSection';
import {GroupSection} from '../../src/App/Components/Pages/SettingsPages/Settings/SettingsPage-Nav';
import {Bug_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons3';

const sectionId = 'my_extension_settings';
const sectionTitle = 'Config';

export function SettingsNavButton() {
  return (
    <GroupSection
      items={[
        {
          title: sectionTitle,
          icon: <Bug_Icon className="size-4 shrink-0 dark:text-white text-black" />,
          elementId: sectionId,
        },
      ]}
      title="My Extension"
    />
  );
}

export function SettingsContent() {
  return (
    <SettingsSection id={sectionId} title={sectionTitle} icon={<Bug_Icon className="size-5" />} itemsCenter>
      This is extension settings
    </SettingsSection>
  );
}
