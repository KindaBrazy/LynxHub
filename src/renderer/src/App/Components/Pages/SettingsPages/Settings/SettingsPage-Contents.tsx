import LynxScroll from '../../../Reusable/LynxScroll';
import {SettingsSections} from './SettingsContainer';

/** Settings content */
const SettingsPageContents = () => {
  return (
    <LynxScroll className="size-full pl-1 pr-4">
      <div className=" flex flex-col gap-y-4">
        <SettingsSections />
      </div>
    </LynxScroll>
  );
};

export default SettingsPageContents;
