import {ScrollShadow} from '@heroui/react';
import {memo} from 'react';

import {DashboardSections} from './Container';
import DashboardSkeleton from './SettingsContentSkeleton';
import {useDelayedShow} from './useDelayedShow';

/**
 * Main content area for the Dashboard page.
 * Handles lazy loading of sections.
 */
const DashboardContent = memo(() => {
  const showSections = useDelayedShow(300);

  return (
    <ScrollShadow className="size-full pl-1 pr-4 py-2">
      <div className="flex flex-col gap-y-4">
        {!showSections && <DashboardSkeleton />}
        {showSections && <DashboardSections />}
      </div>
    </ScrollShadow>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
