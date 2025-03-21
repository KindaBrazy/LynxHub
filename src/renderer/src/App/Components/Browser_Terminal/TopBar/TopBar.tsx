import {WebviewTag} from 'electron';
import {RefObject} from 'react';

import {RunningCard} from '../../../Utils/Types';
import Browser_TopBar from './Browser_TopBar';
import SwitchAndTerminate from './SwitchAndTerminate';
import Terminal_TopBar from './Terminal_TopBar';

type Props = {webview: RefObject<WebviewTag | null>; isDomReady: boolean; runningCard: RunningCard};

export default function TopBar({runningCard, isDomReady, webview}: Props) {
  return (
    <div
      className={
        'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack' +
        ' flex flex-row gap-x-2 px-2 py-1 items-center justify-between'
      }>
      {runningCard.currentView === 'terminal' ? (
        <Terminal_TopBar />
      ) : (
        <Browser_TopBar webview={webview} isDomReady={isDomReady} />
      )}

      <SwitchAndTerminate runningCard={runningCard} />
    </div>
  );
}
