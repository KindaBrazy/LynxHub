import {XTermAPI} from '@lynx/components/XTermCore';
import ptyIpc from '@lynx_shared/ipc/pty';
import {isEmpty} from 'lodash-es';
import {Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef} from 'react';

type UseTerminalSetupProps = {
  id: string;
  xtermRef: RefObject<XTermAPI | null>;
  clearTerminal: RefObject<(() => void) | undefined>;
  setSelectedTerminalText: Dispatch<SetStateAction<string>>;
  quickHotkeySet: Set<string>;
  copySelection: () => void;
};

export function useTerminalSetup({
  id,
  xtermRef,
  clearTerminal,
  setSelectedTerminalText,
  quickHotkeySet,
  copySelection,
}: UseTerminalSetupProps) {
  const contextMenuCleanupRef = useRef<(() => void) | null>(null);

  // Cleanup context menu listener on unmount
  useEffect(() => {
    return () => {
      contextMenuCleanupRef.current?.();
    };
  }, []);

  // Handle terminal ready callback
  const handleTerminalReady = useCallback(
    (api: XTermAPI) => {
      xtermRef.current = api;
      if (api.terminal) api.terminal.focus();

      // Setup clear terminal ref

      clearTerminal.current = () => api.clear();

      // Setup selection change handler
      api.terminal.onSelectionChange(() => setSelectedTerminalText(api.getSelection()));

      // Setup custom key handler
      api.terminal.attachCustomKeyEventHandler(e => {
        const key = e.key.toLowerCase();
        const lookupKey = `${key}|${e.ctrlKey ? 1 : 0}${e.shiftKey ? 1 : 0}${e.altKey ? 1 : 0}${e.metaKey ? 1 : 0}`;
        if (quickHotkeySet.has(lookupKey)) {
          return false;
        }

        const isCmdOrCtrl = e.ctrlKey || e.metaKey;

        if (e.key === 'f' && isCmdOrCtrl) {
          return false;
        }

        const selection = api.getSelection();
        if (!selection) return true;

        const hasSelection = !isEmpty(selection);

        if (e.key === 'c' && isCmdOrCtrl && hasSelection) {
          return false;
        }

        if ((e.key === 'Backspace' || e.key === 'Delete') && hasSelection) {
          const backspaces = '\b'.repeat(selection.length);
          ptyIpc.write(id, backspaces);
          api.clearSelection();
          return false;
        }

        return true;
      });

      // Setup context menu handler
      const terminalContainer = api.terminal.element?.parentElement;
      const handleContextMenu = () => {
        if (!isEmpty(api.getSelection())) {
          copySelection();
        } else {
          // Clipboard readText requires document focus - wrap in try-catch to handle NotAllowedError
          navigator.clipboard
            .readText()
            .then(text => {
              if (text) ptyIpc.write(id, text);
            })
            .catch(() => {
              // Silently ignore - document may not be focused or clipboard permission denied
            });
        }
      };

      terminalContainer?.addEventListener('contextmenu', handleContextMenu);

      // Store cleanup function in ref
      contextMenuCleanupRef.current = () => {
        terminalContainer?.removeEventListener('contextmenu', handleContextMenu);
      };
    },
    [clearTerminal, setSelectedTerminalText, id, copySelection, quickHotkeySet, xtermRef],
  );

  return {handleTerminalReady};
}
