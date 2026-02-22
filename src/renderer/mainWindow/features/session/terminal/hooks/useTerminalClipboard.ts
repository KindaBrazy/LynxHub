import {XTermAPI} from '@lynx/components/XTermCore';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {AppDispatch} from '@lynx/redux/store';
import {lynxTopToast} from '@lynx/utils/hooks';
import {RefObject, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

export function useTerminalClipboard(xtermRef: RefObject<XTermAPI | null>) {
  const dispatch = useDispatch<AppDispatch>();
  const copyPressed = useHotkeysState('copyPressed');

  const copySelection = useCallback(() => {
    const selection = xtermRef.current?.getSelection();
    if (selection) {
      try {
        navigator.clipboard.writeText(selection);
        lynxTopToast(dispatch).success(`Copied to clipboard`);
        xtermRef.current?.clearSelection();
      } catch (e) {
        console.error(e);
        lynxTopToast(dispatch).warning(`Failed to copy. Please try again.`);
      }
    }
  }, [dispatch, xtermRef]);

  useEffect(() => {
    if (copyPressed) copySelection();
  }, [copyPressed, copySelection]);

  return {copySelection};
}
