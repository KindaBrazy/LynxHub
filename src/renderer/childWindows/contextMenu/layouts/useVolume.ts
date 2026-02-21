import browserIpc from '@lynx_shared/ipc/browser';
import {useCallback, useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {contextActions, useContextState} from '../redux/reducer';
import {ContextDispatch} from '../redux/store';

/**
 * Custom hook to manage volume state and IPC communication.
 * Handles debouncing of IPC calls and Redux state updates.
 */
export const useVolume = () => {
  const {id, tabId, volume, muted, globalMuted} = useContextState('browserVolume');
  const dispatch = useDispatch<ContextDispatch>();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeIpcTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (volumeIpcTimerRef.current) clearTimeout(volumeIpcTimerRef.current);
    };
  }, []);

  /**
   * Updates the volume locally and via IPC.
   * Debounces IPC calls to prevent flooding.
   */
  const handleVolumeChange = useCallback(
    (value: number | number[]) => {
      const newVolume = Array.isArray(value) ? value[0] : value;
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      
      // Update local Redux state immediately for UI responsiveness
      dispatch(contextActions.updateVolume(clampedVolume));

      // Debounce the IPC call to main process (system volume)
      if (volumeIpcTimerRef.current) {
        clearTimeout(volumeIpcTimerRef.current);
      }
      volumeIpcTimerRef.current = setTimeout(() => {
        browserIpc.invoke.setVolume(id, clampedVolume).catch(error => {
          console.error('Failed to set volume:', error);
        });
      }, 50);

      // Debounce the IPC call to update tab volume (other windows)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        browserIpc.send.updateTabVolume(tabId, clampedVolume);
      }, 150);
    },
    [id, tabId, dispatch],
  );

  /**
   * Toggles the mute state locally and via IPC.
   */
  const toggleMute = useCallback(async () => {
    const newMutedState = !muted;
    dispatch(contextActions.updateMuted(newMutedState));

    try {
      await browserIpc.invoke.setMuted(id, newMutedState);
      // Notify main window to update Redux state
      browserIpc.send.updateTabMuted(tabId, newMutedState);
    } catch (error) {
      console.error('Failed to set mute state:', error);
      // Revert state on error
      dispatch(contextActions.updateMuted(!newMutedState));
    }
  }, [id, tabId, muted, dispatch]);

  return {
    volume,
    muted,
    globalMuted,
    handleVolumeChange,
    toggleMute,
  };
};
