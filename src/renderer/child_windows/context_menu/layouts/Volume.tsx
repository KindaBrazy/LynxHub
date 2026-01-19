import {Button, Slider} from '@heroui/react';
import rendererIpc from '@lynx_shared/ipc';
import {Volume, VolumeCross, VolumeLoud} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {contextActions, useContextState} from '../redux/reducer';
import {ContextDispatch} from '../redux/store';

const VolumeMenu = memo(() => {
  const {id, tabId, volume, muted, globalMuted} = useContextState('browserVolume');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeIpcTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dispatch = useDispatch<ContextDispatch>();

  const handleVolumeChange = useCallback(
    (value: number | number[]) => {
      const newVolume = Array.isArray(value) ? value[0] : value;
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      dispatch(contextActions.updateVolume(clampedVolume));

      // Debounce the IPC call to avoid flooding main process
      if (volumeIpcTimerRef.current) {
        clearTimeout(volumeIpcTimerRef.current);
      }
      volumeIpcTimerRef.current = setTimeout(() => {
        rendererIpc.volume.setVolume(id, clampedVolume).catch(error => {
          console.error('Failed to set volume:', error);
        });
      }, 50);

      // Debounce Redux state update to avoid excessive updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        rendererIpc.volume.updateTabVolume(tabId, clampedVolume);
      }, 150);
    },
    [id, tabId],
  );

  const handleMuteToggle = useCallback(async () => {
    const newMutedState = !muted;
    dispatch(contextActions.updateMuted(newMutedState));

    try {
      await rendererIpc.volume.setMuted(id, newMutedState);
      // Notify main window to update Redux state
      rendererIpc.volume.updateTabMuted(tabId, newMutedState);
    } catch (error) {
      console.error('Failed to set mute state:', error);
    }
  }, [id, tabId, muted]);

  const effectiveMuted = useMemo(() => muted || globalMuted, [muted, globalMuted]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (volumeIpcTimerRef.current) clearTimeout(volumeIpcTimerRef.current);
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-small font-medium">Volume Control</span>
        <Button
          size="sm"
          variant="light"
          onPress={handleMuteToggle}
          className="cursor-default"
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          isIconOnly>
          {effectiveMuted ? <VolumeCross className="size-4" /> : <VolumeLoud className="size-4" />}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Slider
          step={1}
          size="sm"
          minValue={0}
          maxValue={100}
          value={volume}
          className="max-w-full"
          startContent={<Volume />}
          endContent={<VolumeLoud />}
          onChange={handleVolumeChange}
          aria-label="Volume level slider"
        />
        <div className="flex justify-between text-tiny text-default-500">
          <span>0%</span>
          <span className="font-medium text-default-700">{volume}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
});

export default VolumeMenu;
