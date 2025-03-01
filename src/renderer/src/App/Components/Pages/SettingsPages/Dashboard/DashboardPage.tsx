import Page from '../../Page';
import DashboardPageContents from './DashboardPage-Contents';
import DashboardPageNav from './DashboardPage-Nav';

export const dashboardPageID: string = 'dashboardPage';

const DashboardPage = () => (
  <Page>
    <div className="flex size-full flex-row space-x-1">
      <DashboardPageNav />
      <DashboardPageContents />
    </div>
  </Page>
);

export default DashboardPage;
