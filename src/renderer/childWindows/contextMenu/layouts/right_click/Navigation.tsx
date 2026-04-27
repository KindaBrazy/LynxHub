import {NavHistory} from '@lynx_common/types/ipc';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {ArrowLeft, ArrowRight, Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {NavBtnProps} from '../../types';
import {createActionHandler} from './Utils';

function NavButton({icon, onPress, className, isDisabled}: NavBtnProps) {
  return (
    <div
      className={
        `size-full flex items-center rounded-lg justify-center transition-colors duration-150` +
        ` ${isDisabled ? 'opacity-50' : 'hover:bg-surface-secondary cursor-pointer'} ${className}`
      }
      role="button"
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={isDisabled ? undefined : onPress}>
      {icon}
    </div>
  );
}

type NavigationProps = {
  id: number;
  navHistory: NavHistory;
};

/**
 * Navigation component for the context menu.
 * Provides Back, Forward, and Refresh buttons.
 */
const Navigation = memo(function Navigation({id, navHistory}: NavigationProps) {
  return (
    <div className="w-full flex flex-row items-center justify-center h-8 px-2 overflow-hidden gap-x-1">
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
});

export default Navigation;
