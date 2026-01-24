import LynxScroll from '@lynx/components/LynxScroll';

import {SettingsSections} from './Container';

type Props = {sectionTexts: Map<string, string>};

/** Settings content */
const SettingsPageContents = ({sectionTexts}: Props) => {
  return (
    <LynxScroll className="size-full pl-1 pr-4 py-2">
      <div className="flex flex-col gap-y-4">
        <SettingsSections sectionTexts={sectionTexts} />
      </div>
    </LynxScroll>
  );
};

export default SettingsPageContents;
