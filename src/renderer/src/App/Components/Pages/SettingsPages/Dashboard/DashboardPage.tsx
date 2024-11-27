import Page from '../../Page';
import DashboardPageContents from './DashboardPage-Contents';
import DashboardPageNav from './DashboardPage-Nav';

export const dashboardRoutePath: string = '/dashboardPage';
export const dashboardElementId: string = 'dashboardElement';

const DashboardPage = () => (
  <Page id={dashboardElementId}>
    <div className="flex size-full flex-row space-x-1">
      <DashboardPageNav />
      <DashboardPageContents />
    </div>
  </Page>
);

export default DashboardPage;
