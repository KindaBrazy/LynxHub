import {ScrollShadow} from '@heroui/react';

import {SettingsSections} from './SettingsContainer';

/** Settings content */
const SettingsPageContents = () => {
  return (
    <ScrollShadow orientation="vertical" className="flex size-full flex-col space-y-8 pb-4 pl-1" hideScrollBar>
      <SettingsSections />
    </ScrollShadow>
  );
};

export default SettingsPageContents;
