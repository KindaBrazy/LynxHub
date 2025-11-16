import LynxScroll from '../../../Reusable/LynxScroll';
import SettingsContentSkeleton from '../SettingsContentSkeleton';
import {useDelayedShow} from '../useDelayedShow';
import {DashboardSections} from './DashboardContainer';

/** Settings content */
const DashboardPageContents = () => {
  const showSections = useDelayedShow(300);

  return (
    <LynxScroll className="size-full pl-1 pr-4">
      <div className=" flex flex-col gap-y-4">
        {!showSections && <SettingsContentSkeleton />}
        {showSections && <DashboardSections />}
      </div>
    </LynxScroll>
  );
};

export default DashboardPageContents;
