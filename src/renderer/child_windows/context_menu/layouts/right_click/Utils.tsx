import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import {ReactNode} from 'react';

export const createActionHandler = (actionFn: () => void): (() => void) => {
  return () => {
    contextMenuIpc.send.hideWindow();
    actionFn();
  };
};

type ActionProps = {icon?: ReactNode; title: string; onPress: () => void; className?: string};
export function ActionButton({icon, title, onPress, className}: ActionProps) {
  return (
    <div
      className={
        `w-full hover:bg-foreground-200 transition-colors duration-300 py-2 px-3` +
        ` flex justify-between items-center text-sm ${className} cursor-pointer`
      }
      onClick={onPress}>
      {icon || <div />}
      <span>{title}</span>
      <div />
    </div>
  );
}
