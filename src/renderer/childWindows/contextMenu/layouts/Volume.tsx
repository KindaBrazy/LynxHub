import {Button, Slider} from '@heroui/react';
import {Volume, VolumeCross, VolumeLoud} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useMemo} from 'react';

import {useVolume} from './useVolume';

/**
 * VolumeMenu component for controlling browser volume and mute state.
 * Uses useVolume hook for state management and IPC.
 */
const VolumeMenu = memo(() => {
  const {volume, muted, globalMuted, handleVolumeChange, toggleMute} = useVolume();

  const effectiveMuted = useMemo(() => muted || globalMuted, [muted, globalMuted]);

  return (
    <div className="flex w-65 flex-col gap-4 p-4">
      {/* Header with title and mute button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VolumeLoud className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground-800">Volume Control</span>
        </div>
        <Button
          size="sm"
          variant="flat"
          onPress={toggleMute}
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
          {[0, 25, 50, 75, 100].map(val => (
            <button
              key={val}
              aria-label={`Set volume to ${val}%`}
              onClick={() => handleVolumeChange(val)}
              className="transition-colors hover:text-foreground-800">
              {val}%
            </button>
          ))}
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
          onPress={() => handleVolumeChange(Math.max(0, volume - 10))}>
          −10%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          isDisabled={effectiveMuted}
          aria-label="Set volume to 50%"
          onPress={() => handleVolumeChange(50)}>
          50%
        </Button>
        <Button
          size="sm"
          variant="flat"
          className="flex-1"
          aria-label="Increase volume by 10%"
          isDisabled={effectiveMuted || volume === 100}
          onPress={() => handleVolumeChange(Math.min(100, volume + 10))}>
          +10%
        </Button>
      </div>
    </div>
  );
});

export default VolumeMenu;
