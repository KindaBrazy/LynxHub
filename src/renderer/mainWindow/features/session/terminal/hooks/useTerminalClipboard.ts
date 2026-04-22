import {XTermAPI} from '@lynx/components/XTermCore';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {RefObject, useCallback, useEffect} from 'react';

import {topToast} from '../../../../layouts/ToastProviders';

export function useTerminalClipboard(xtermRef: RefObject<XTermAPI | null>) {
  const copyPressed = useHotkeysState('copyPressed');

  const copySelection = useCallback(() => {
    const selection = xtermRef.current?.getSelection();
    if (selection) {
      try {
        navigator.clipboard.writeText(selection);
        topToast.success(`Copied to clipboard`);
        xtermRef.current?.clearSelection();
      } catch (e) {
        console.error(e);
        topToast.warning(`Failed to copy. Please try again.`);
      }
    }
  }, [xtermRef]);

  useEffect(() => {
    if (copyPressed) copySelection();
  }, [copyPressed, copySelection]);

  return {copySelection};
}
