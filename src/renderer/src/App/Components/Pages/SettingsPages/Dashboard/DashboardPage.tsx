import Page from '../../Page';
import DashboardPageContents from './DashboardPage-Contents';
import DashboardPageNav from './DashboardPage-Nav';

type Props = {show: boolean};

const DashboardPage = ({show}: Props) => (
  <Page show={show}>
    <div className="flex size-full flex-row space-x-1 relative">
      <DashboardPageNav />
      <DashboardPageContents />
    </div>
  </Page>
);

export default DashboardPage;
