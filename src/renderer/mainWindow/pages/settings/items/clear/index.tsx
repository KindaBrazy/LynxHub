import SettingsSection from '@lynx/components/SettingsSection';
import {Album, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';

import ImageCache from './ImageCache';
import ResetSettings from './ResetSettings';

export const SettingsClearId = 'settings_rmv_data_elem';

/**
 * Renders the "Clear" settings section.
 * Provides options to reset application settings, clear caches,
 * and view cache statistics.
 */
export default function SettingsClear() {
  return (
    <>
      <SettingsSection title="Clear" id={SettingsClearId} icon={<TrashBin2 className="size-5" />} itemsCenter>
        <ResetSettings />
      </SettingsSection>
      <SettingsSection
        description={
          'Image cache stores remote images locally for faster loading. ' +
          'Cache is automatically cleaned periodically based on your settings.'
        }
        title="Image Cache"
        id={SettingsClearId}
        icon={<Album className="size-5" />}
        itemsCenter>
        <ImageCache />
      </SettingsSection>
    </>
  );
}
