import {NavHistory} from '@lynx_common/types/ipc';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import {ArrowLeft, ArrowRight, Refresh} from '@solar-icons/react-perf/BoldDuotone';

import {NavBtnProps} from '../../types';
import {createActionHandler} from './Utils';

function NavButton({icon, onPress, className, isDisabled}: NavBtnProps) {
  return (
    <div
      className={
        `size-full flex items-center rounded-lg justify-center transition-colors duration-150` +
        ` ${isDisabled ? 'opacity-50' : 'hover:bg-foreground-200 cursor-pointer'} ${className}`
      }
      onClick={isDisabled ? undefined : onPress}>
      {icon}
    </div>
  );
}

type Props = {id: number; navHistory: NavHistory};
export default function Navigation({id, navHistory}: Props) {
  return (
    <div key="navItems" className="w-full flex flex-row items-center justify-center h-8 px-2 overflow-hidden gap-x-1">
      <NavButton
        onPress={createActionHandler(() => {
          contextMenuIpc.send.rightClickItems.navigate(id, 'back');
        })}
        isDisabled={!navHistory.canGoBack}
        icon={<ArrowLeft className="size-5" />}
      />
      <NavButton
        onPress={createActionHandler(() => {
          contextMenuIpc.send.rightClickItems.navigate(id, 'forward');
        })}
        isDisabled={!navHistory.canGoForward}
        icon={<ArrowRight className="size-5" />}
      />
      <NavButton
        onPress={createActionHandler(() => {
          contextMenuIpc.send.rightClickItems.navigate(id, 'refresh');
        })}
        icon={<Refresh className="size-4" />}
      />
    </div>
  );
}
