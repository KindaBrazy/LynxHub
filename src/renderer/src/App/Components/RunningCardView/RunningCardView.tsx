import {WebviewTag} from 'electron';
import {isNil} from 'lodash';
import {useMemo, useRef, useState} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {RunningCard} from '../../Utils/Types';
import Browser from '../Browser_Terminal/Browser/Browser';
import LynxTerminal from '../Browser_Terminal/Terminal/LynxTerminal';
import TopBar from '../Browser_Terminal/TopBar/TopBar';

type Props = {runningCard: RunningCard};
const RunningCardView = ({runningCard}: Props) => {
  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  const webViewRef = useRef<WebviewTag>(null);
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

  return (
    <>
      <TopBar webview={webViewRef} isDomReady={isDomReady} currentView={runningCard.currentView} />
      {isNil(ExtTerminal) ? <LynxTerminal runningCard={runningCard} /> : <ExtTerminal />}
      {isNil(ExtBrowser) ? (
        <Browser
          webViewRef={webViewRef}
          isDomReady={isDomReady}
          runningCard={runningCard}
          setIsDomReady={setIsDomReady}
        />
      ) : (
        <ExtBrowser />
      )}
    </>
  );
};
export default RunningCardView;
