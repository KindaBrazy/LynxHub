import {RunningCard} from '@lynx/types';
import {memo} from 'react';

import BrowserError from './BrowserError';
import BrowserHome from './BrowserHome';
import BrowserViewPlaceholder from './BrowserViewPlaceholder';
import {useBrowser} from './hooks/useBrowser';

type Props = {runningCard: RunningCard};

const Browser = memo(({runningCard}: Props) => {
  const {failedLoad, handleReload, showEmptyPage, currentView, type} = useBrowser(runningCard);

  return (
    <div
      className={
        `absolute inset-0 top-10! overflow-hidden bg-white shadow-md dark:bg-LynxNearBlack ` +
        `${currentView === 'browser' ? 'block' : 'hidden'}`
      }>
      {showEmptyPage ? (
        <BrowserHome type={type} />
      ) : failedLoad ? (
        <BrowserError error={failedLoad} id={runningCard.id} onReload={handleReload} />
      ) : (
        <BrowserViewPlaceholder />
      )}
    </div>
  );
});

export default Browser;
