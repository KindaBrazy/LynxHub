import CopyClipboard from '../../Reusable/CopyClipboard';
import Terminal_Timer from './Terminal_Timer';

type Props = {startTime: string; terminalContent: string};
export default function Terminal_TopBar({startTime, terminalContent}: Props) {
  return (
    <>
      <div className="flex flex-row h-full items-center gap-x-1">
        <Terminal_Timer startTime={startTime} />
        <CopyClipboard showTooltip={false} contentToCopy={terminalContent} />
      </div>
      <div className="flex flex-row h-full items-center gap-x-1"></div>
    </>
  );
}
