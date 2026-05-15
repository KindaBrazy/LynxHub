import {Label} from '@heroui/react';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {memo, ReactNode} from 'react';

/**
 * Creates a handler that hides the context window before executing the action.
 * @param actionFn - The action to execute.
 * @returns A function that hides the window and then calls the action.
 */
export const createActionHandler = (actionFn: () => void): (() => void) => {
  return () => {
    contextMenuIpc.send.hideWindow();
    actionFn();
  };
};

type ActionButtonProps = {
  /** Optional icon to display on the left */
  icon?: ReactNode;
  /** Text to display */
  title: string;
  /** Handler for click/press event */
  onPress: () => void;
  /** Optional extra classes */
  className?: string;
};

/**
 * A reusable button component for context menu items.
 * Renders an icon (if provided) and a title.
 */
export const ActionButton = memo(function ActionButton({icon, title, onPress, className}: ActionButtonProps) {
  return (
    <div
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onPress();
        }
      }}
      className={
        `w-full hover:bg-surface-tertiary transition-colors duration-100 py-2.5 px-3 gap-x-2` +
        ` flex items-center text-sm ${className || ''} cursor-pointer shrink-0 rounded-xl`
      }
      tabIndex={0}
      role="button"
      onClick={onPress}>
      <div className="shrink-0">{icon}</div>
      <Label className="pointer-events-none text-nowrap">{title}</Label>
    </div>
  );
});
