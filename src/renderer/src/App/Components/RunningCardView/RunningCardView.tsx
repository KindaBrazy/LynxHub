import {useState} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import Browser from './Browser';
import LynxTerminal from './LynxTerminal';

export default function RunningCardView() {
  const [runningAI] = useState(extensionsData.runningAI);

  return (
    <>
      {runningAI.terminal ? <runningAI.terminal /> : <LynxTerminal />}
      {runningAI.browser ? <runningAI.browser /> : <Browser />}
    </>
  );
}
