import {ScrollShadow} from '@nextui-org/react';

import {DashboardSections} from './DashboardContainer';

/** Settings content */
export default function DashboardPageContents() {
  return (
    <ScrollShadow orientation="vertical" className="flex size-full flex-col space-y-8 pb-4 pl-1" hideScrollBar>
      <DashboardSections />
    </ScrollShadow>
  );
}
