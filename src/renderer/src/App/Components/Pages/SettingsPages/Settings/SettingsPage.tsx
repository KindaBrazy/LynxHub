import Page from '../../Page';
import SettingsPageContents from './SettingsPage-Contents';
import SettingsPageNav from './SettingsPage-Nav';

type Props = {show: boolean};

const SettingsPage = ({show}: Props) => (
  <Page show={show}>
    <div className="flex size-full flex-row pb-4 space-x-1 absolute">
      <SettingsPageNav />
      <SettingsPageContents />
    </div>
  </Page>
);

export default SettingsPage;
