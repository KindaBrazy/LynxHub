import {memo} from 'react';

import Page from '../Page';
import DashboardContent from './Contents';
import DashboardNavigation from './Navigation';

type Props = {
  /** Whether the page is currently visible */
  show: boolean;
};

/**
 * The Dashboard page component.
 * Displays navigation and content sections.
 */
const DashboardPage = memo(({show}: Props) => {
  return (
    <Page show={show}>
      <div className="flex size-full flex-row space-x-1 relative py-2">
        <DashboardNavigation />
        <DashboardContent />
      </div>
    </Page>
  );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;
