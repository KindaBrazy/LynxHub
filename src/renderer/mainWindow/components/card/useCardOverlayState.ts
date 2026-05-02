import {useCallback} from 'react';

import {useCardStore} from './store';

export function useCardOverlayState(key: string) {
  const isOpen = useCardStore(state => state.overlayStates[key] ?? false);
  const open = useCardStore(state => state.openOverlay);
  const close = useCardStore(state => state.closeOverlay);
  const toggle = useCardStore(state => state.toggleOverlay);
  const setOverlay = useCardStore(state => state.setOverlay);

  const memoOpen = useCallback(() => open(key), [open, key]);
  const memoClose = useCallback(() => close(key), [close, key]);
  const memoToggle = useCallback(() => toggle(key), [toggle, key]);
  const memoSetOpen = useCallback((value: boolean) => setOverlay(key, value), [setOverlay, key]);

  return {
    isOpen,
    open: memoOpen,
    close: memoClose,
    toggle: memoToggle,
    setOpen: memoSetOpen,
  };
}

export type UseCardOverlayStateReturn = ReturnType<typeof useCardOverlayState>;
