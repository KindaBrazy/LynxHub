import {isNil} from 'lodash';
import {useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {RunningCard} from '../../Utils/Types';
import Browser from '../Browser/Browser';
import LynxTerminal from './LynxTerminal';

type Props = {runningCard: RunningCard};
const RunningCardView = ({runningCard}: Props) => {
  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  return (
    <>
      {isNil(ExtTerminal) ? <LynxTerminal runningCard={runningCard} /> : <ExtTerminal />}
      {isNil(ExtBrowser) ? <Browser runningCard={runningCard} /> : <ExtBrowser />}
    </>
  );
};
export default RunningCardView;
