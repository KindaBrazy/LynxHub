import LynxScroll from '../../components/LynxScroll';
import {DashboardSections} from './Container';
import SettingsContentSkeleton from './SettingsContentSkeleton';
import {useDelayedShow} from './useDelayedShow';

/** Settings content */
const DashboardPageContents = () => {
  const showSections = useDelayedShow(300);

  return (
    <LynxScroll className="size-full pl-1 pr-4 py-2">
      <div className=" flex flex-col gap-y-4">
        {!showSections && <SettingsContentSkeleton />}
        {showSections && <DashboardSections />}
      </div>
    </LynxScroll>
  );
};

export default DashboardPageContents;
