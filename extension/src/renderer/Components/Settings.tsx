import SettingsSection from '@lynx/components/ContentSection';
import {GroupSection} from '@lynx/pages/settings/Navigation';
import {Bug} from '@solar-icons/react-perf/BoldDuotone';

const sectionId = 'my_extension_settings';
const sectionTitle = 'Config';

export function SettingsNavButton() {
  return (
    <GroupSection
      items={[
        {
          title: sectionTitle,
          icon: <Bug className="size-4 shrink-0 dark:text-white text-black" />,
          elementId: sectionId,
        },
      ]}
      title="My Extension"
    />
  );
}

export function SettingsContent() {
  return (
    <SettingsSection id={sectionId} title={sectionTitle} icon={<Bug className="size-5" />} itemsCenter>
      This is extension settings
    </SettingsSection>
  );
}
