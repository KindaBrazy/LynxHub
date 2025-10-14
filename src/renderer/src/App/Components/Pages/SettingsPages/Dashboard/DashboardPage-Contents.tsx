import LynxScroll from '../../../Reusable/LynxScroll';
import {DashboardSections} from './DashboardContainer';

/** Settings content */
const DashboardPageContents = () => {
  return (
    <LynxScroll className="size-full pl-1 pr-4">
      <div className=" flex flex-col gap-y-4">
        <DashboardSections />
      </div>
    </LynxScroll>
  );
};

export default DashboardPageContents;
