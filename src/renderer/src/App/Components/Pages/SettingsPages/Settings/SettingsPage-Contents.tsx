import LynxScroll from '../../../Reusable/LynxScroll';
import SettingsContentSkeleton from '../SettingsContentSkeleton';
import {useDelayedShow} from '../useDelayedShow';
import {SettingsSections} from './SettingsContainer';

type Props = {searchValue: string; sectionTexts: Map<string, string>};

/** Settings content */
const SettingsPageContents = ({searchValue, sectionTexts}: Props) => {
  const showSections = useDelayedShow(500);

  return (
    <LynxScroll className="size-full pl-1 pr-4">
      <div className="flex flex-col gap-y-4">
        {!showSections && (
          <SettingsContentSkeleton />
        )}
        {showSections && <SettingsSections searchValue={searchValue} sectionTexts={sectionTexts} />}
      </div>
    </LynxScroll>
  );
};

export default SettingsPageContents;
