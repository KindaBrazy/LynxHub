import {RunningCard} from '../../../Utils/Types';
import Browser_TopBar from '../Browser/Browser_TopBar';
import Terminal_TopBar from '../Terminal/Terminal_TopBar';
import SwitchAndTerminate from './SwitchAndTerminate';

type Props = {
  runningCard: RunningCard;
  terminalContent: string;
  tabID: string;
};

export default function TopBar({runningCard, terminalContent, tabID}: Props) {
  return (
    <div
      className={
        'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack' +
        ' flex flex-row gap-x-1 px-2 py-1 items-center justify-between'
      }>
      {runningCard.currentView === 'terminal' ? (
        <Terminal_TopBar terminalContent={terminalContent} startTime={runningCard.startTime} />
      ) : (
        <Browser_TopBar tabID={tabID} runningCard={runningCard} />
      )}

      <SwitchAndTerminate runningCard={runningCard} />
    </div>
  );
}
