import {memo, useMemo, useState} from 'react';

import Page from '../../Page';
import SettingsPageContents from './SettingsPage-Contents';
import SettingsPageNav from './SettingsPage-Nav';
import {SettingsSearchHighlightProvider} from './SettingsSearchHighlightContext';
import {SettingsSearchQueryProvider} from './SettingsSearchQueryContext';
import {useSectionSearchSnapshot} from './SettingsSearchRegistry';

type Props = {show: boolean};

const SettingsPage = memo(({show}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const sectionTexts = useSectionSearchSnapshot();
  const highlightWords = useMemo(() => searchValue.trim().split(/\s+/).filter(Boolean), [searchValue]);
  const normalizedSearch = useMemo(() => searchValue.trim(), [searchValue]);

  return (
    <Page show={show}>
      <SettingsSearchQueryProvider value={normalizedSearch}>
        <SettingsSearchHighlightProvider value={highlightWords}>
          <div className="flex size-full flex-row pb-4 space-x-1 relative">
            <SettingsPageNav searchValue={searchValue} sectionTexts={sectionTexts} setSearchValue={setSearchValue} />
            <SettingsPageContents searchValue={searchValue} sectionTexts={sectionTexts} />
          </div>
        </SettingsSearchHighlightProvider>
      </SettingsSearchQueryProvider>
    </Page>
  );
});

export default SettingsPage;
