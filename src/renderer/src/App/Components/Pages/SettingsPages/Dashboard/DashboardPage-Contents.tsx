import {ScrollShadow} from '@nextui-org/react';

import {DashboardSections} from './DashboardContainer';

/** Settings content */
const DashboardPageContents = () => (
  <ScrollShadow orientation="vertical" className="flex size-full flex-col space-y-8 pb-4 pl-1" hideScrollBar>
    <DashboardSections />
  </ScrollShadow>
);

export default DashboardPageContents;
