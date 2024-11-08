import SettingsSection from '../../src/App/Components/Pages/SettingsPages/Settings/SettingsPage-ContentSection';
import {GroupSection} from '../../src/App/Components/Pages/SettingsPages/Settings/SettingsPage-Nav';
import {getIconByName} from '../../src/assets/icons/SvgIconsContainer';

const sectionId = 'my_extension_settings';
const sectionIcon = getIconByName('Bug');
const sectionTitle = 'Config';

export function SettingsNavButton() {
  return <GroupSection title="My Extension" items={[{title: sectionTitle, icon: sectionIcon, elementId: sectionId}]} />;
}

export function SettingsContent() {
  return (
    <SettingsSection id={sectionId} icon={sectionIcon} title={sectionTitle} itemsCenter>
      This is extension settings
    </SettingsSection>
  );
}
