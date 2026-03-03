import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {useEffect, useRef} from 'react';

/**
 * Hides the context menu window via IPC.
 */
export const hideContextWindow = (): void => {
  contextMenuIpc.send.hideWindow();
};

/**
 * Sets focus to a specific HTML element.
 */
export function useFocus() {
  const focusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const target = focusRef.current;
    if (!target) return;

    target.focus();

    return () => {
      target.blur();
    };
  }, []);

  return focusRef;
}
