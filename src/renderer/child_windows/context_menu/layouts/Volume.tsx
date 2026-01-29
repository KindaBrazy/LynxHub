import {Button, Slider} from '@heroui/react';
import browserIpc from '@lynx_shared/ipc/browser';
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
        browserIpc.invoke.setVolume(id, clampedVolume).catch(error => {
          console.error('Failed to set volume:', error);
        });
      }, 50);

      // Debounce Redux state update to avoid excessive updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        browserIpc.send.updateTabVolume(tabId, clampedVolume);
      }, 150);
    },
    [id, tabId],
  );

  const handleMuteToggle = useCallback(async () => {
    const newMutedState = !muted;
    dispatch(contextActions.updateMuted(newMutedState));

    try {
      await browserIpc.invoke.setMuted(id, newMutedState);
      // Notify main window to update Redux state
      browserIpc.send.updateTabMuted(tabId, newMutedState);
    } catch (error) {
      console.error('Failed to set mute state:', error);
    }
  }, [id, tabId, muted]);

  const setVolume = useCallback(
    (newVolume: number) => {
      handleVolumeChange(newVolume);
    },
    [handleVolumeChange],
  );

  const effectiveMuted = useMemo(() => muted || globalMuted, [muted, globalMuted]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (volumeIpcTimerRef.current) clearTimeout(volumeIpcTimerRef.current);
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {/* Header with title and mute button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VolumeLoud className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground-800">Volume Control</span>
        </div>
        <Button
          size="sm"
          variant="flat"
          onPress={handleMuteToggle}
          color={effectiveMuted ? 'danger' : 'default'}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          startContent={effectiveMuted ? <VolumeCross className="size-4" /> : <VolumeLoud className="size-4" />}>
          {effectiveMuted ? 'Unmute' : 'Mute'}
        </Button>
      </div>

      {/* Current volume display */}
      <div className="flex items-center justify-center rounded-lg bg-foreground-100 py-3">
        <div className="flex items-center gap-2">
          {effectiveMuted ? (
            <VolumeCross className="size-6 text-danger" />
          ) : volume === 0 ? (
            <Volume className="size-6 text-foreground-500" />
          ) : volume < 50 ? (
            <Volume className="size-6 text-foreground-700" />
          ) : (
            <VolumeLoud className="size-6 text-foreground-700" />
          )}
          <span className="text-2xl font-bold text-foreground-800">{effectiveMuted ? 'Muted' : `${volume}%`}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-3">
        <Slider
          classNames={{
            thumb: 'cursor-default',
            track: 'h-1.5',
            filler: 'bg-primary',
          }}
          step={1}
          size="md"
          minValue={0}
          maxValue={100}
          value={volume}
          color="primary"
          className="w-full"
          aria-label="Volume level"
          isDisabled={effectiveMuted}
          onChange={handleVolumeChange}
          getValue={value => `${value}%`}
          aria-valuetext={`${volume} percent`}
          startContent={<Volume className="size-4 text-foreground-500" />}
          endContent={<VolumeLoud className="size-5 text-foreground-500" />}
        />

        {/* Volume markers */}
        <div className="flex justify-between px-1 text-tiny text-foreground-500">
          <button
            onClick={() => setVolume(0)}
            aria-label="Set volume to 0%"
            className="transition-colors hover:text-foreground-800">
            0%
          </button>
          <button
            onClick={() => setVolume(25)}
            aria-label="Set volume to 25%"
            className="transition-colors hover:text-foreground-800">
            25%
          </button>
          <button
            onClick={() => setVolume(50)}
            aria-label="Set volume to 50%"
            className="transition-colors hover:text-foreground-800">
            50%
          </button>
          <button
            onClick={() => setVolume(75)}
            aria-label="Set volume to 75%"
            className="transition-colors hover:text-foreground-800">
            75%
          </button>
          <button
            onClick={() => setVolume(100)}
            aria-label="Set volume to 100%"
            className="font-medium transition-colors hover:text-foreground-800">
            100%
          </button>
        </div>
      </div>

      {/* Quick volume buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          aria-label="Decrease volume by 10%"
          isDisabled={effectiveMuted || volume === 0}
          onPress={() => setVolume(Math.max(0, volume - 10))}>
          −10%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          isDisabled={effectiveMuted}
          onPress={() => setVolume(50)}
          aria-label="Set volume to 50%">
          50%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          aria-label="Increase volume by 10%"
          isDisabled={effectiveMuted || volume === 100}
          onPress={() => setVolume(Math.min(100, volume + 10))}>
          +10%
        </Button>
      </div>
    </div>
  );
});

export default VolumeMenu;
