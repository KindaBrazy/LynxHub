import {memo} from 'react';

import Page from '../Page';
import DashboardPageContents from './Contents';
import DashboardPageNav from './Navigation';

type Props = {show: boolean};

const DashboardPage = memo(({show}: Props) => {
  return (
    <Page show={show}>
      <div className="flex size-full flex-row space-x-1 relative py-2">
        <DashboardPageNav />
        <DashboardPageContents />
      </div>
    </Page>
  );
});

export default DashboardPage;
