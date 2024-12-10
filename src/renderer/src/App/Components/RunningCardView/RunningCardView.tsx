import {isNil} from 'lodash';
import {useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import Browser from './Browser';
import LynxTerminal from './LynxTerminal';

const RunningCardView = () => {
  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  return (
    <>
      {isNil(ExtTerminal) ? <LynxTerminal /> : <ExtTerminal />}
      {isNil(ExtBrowser) ? <Browser /> : <ExtBrowser />}
    </>
  );
};
export default RunningCardView;
