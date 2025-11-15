import {Skeleton} from '@heroui/react';
import {useEffect, useState} from 'react';

import LynxScroll from '../../../Reusable/LynxScroll';
import {DashboardSections} from './DashboardContainer';

/** Settings content */
const DashboardPageContents = () => {
  const [showSections, setShowSections] = useState(false);

  useEffect(() => {
    let frameId = 0;
    const timeoutId = window.setTimeout(() => {
      frameId = window.requestAnimationFrame(() => {
        setShowSections(true);
      });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <LynxScroll className="size-full pl-1 pr-4">
      <div className=" flex flex-col gap-y-4">
        {!showSections && (
          <div className="flex flex-col gap-y-4">
            <Skeleton className="w-full h-64 rounded-xl" />
            <Skeleton className="w-full h-64 rounded-xl" />
          </div>
        )}
        {showSections && <DashboardSections />}
      </div>
    </LynxScroll>
  );
};

export default DashboardPageContents;
