import {memo} from 'react';

import Page from '../Page';
import SettingsPageContents from './Contents';
import SettingsPageNav from './Navigation';
import {useSectionSearchSnapshot} from './SettingsSearchRegistry';

type Props = {show: boolean};

const SettingsPage = memo(({show}: Props) => {
  const sectionTexts = useSectionSearchSnapshot();

  return (
    <Page show={show}>
      <div className="flex size-full flex-row pb-4 space-x-1 relative">
        <SettingsPageNav sectionTexts={sectionTexts} />
        <SettingsPageContents sectionTexts={sectionTexts} />
      </div>
    </Page>
  );
});

export default SettingsPage;
