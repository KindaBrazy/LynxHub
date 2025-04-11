import {useState} from 'react';

import {RunningCard} from '../../Utils/Types';
import Terminal from './Terminal/Terminal';
import Terminal_TopBar from './Terminal/Terminal_TopBar';
import SwitchAndTerminate from './TopBar/SwitchAndTerminate';

const initialTerminal: RunningCard = {
  currentView: 'terminal',
  id: '',
  tabId: '',
  webUIAddress: '',
  customAddress: '',
  currentAddress: '',
  startTime: '',
};

type Props = {tabId: string};

export default function Empty_Terminal({tabId}: Props) {
  const [runningCard] = useState<RunningCard>({...initialTerminal, id: tabId, startTime: new Date().toString()});
  const [terminalContent, setTerminalContent] = useState<string>('');

  return (
    <>
      <div
        className={
          'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack' +
          ' flex flex-row gap-x-1 px-2 py-1 items-center justify-between'
        }>
        <Terminal_TopBar terminalContent={terminalContent} startTime={runningCard.startTime} />

        <SwitchAndTerminate isEmptyTerminal={true} runningCard={runningCard} />
      </div>

      <Terminal runningCard={runningCard} setTerminalContent={setTerminalContent} />
    </>
  );
}
