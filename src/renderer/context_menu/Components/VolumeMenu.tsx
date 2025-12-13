import {Button, Slider} from '@heroui/react';
import {VolumeCross, VolumeLoud} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useRef, useState} from 'react';

import rendererIpc from '../../src/App/RendererIpc';
import {SetElementsType, SetWidthSizeType} from './ContextHooks';

type VolumeData = {
  id: string;
  tabId: string;
  volume: number;
  muted: boolean;
  globalMuted: boolean;
};

export function useVolumeMenu(setElements: SetElementsType, setWidthSize: SetWidthSizeType) {
  const [data, setData] = useState<VolumeData | null>(null);
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isGlobalMuted, setIsGlobalMuted] = useState<boolean>(false);
  const [toggle, setToggle] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleVolumeChange = useCallback(
    (value: number | number[]) => {
      if (!data) return;
      const newVolume = Array.isArray(value) ? value[0] : value;
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      setVolume(clampedVolume);

      // Apply volume immediately for real-time feedback
      rendererIpc.volume.setVolume(data.id, clampedVolume).catch(error => {
        console.error('Failed to set volume:', error);
      });

      // Debounce Redux state update to avoid excessive updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        rendererIpc.volume.updateTabVolume(data.tabId, clampedVolume);
      }, 150);
    },
    [data],
  );

  const handleMuteToggle = useCallback(async () => {
    if (!data) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    try {
      await rendererIpc.volume.setMuted(data.id, newMutedState);
      // Notify main window to update Redux state
      rendererIpc.volume.updateTabMuted(data.tabId, newMutedState);
    } catch (error) {
      console.error('Failed to set mute state:', error);
    }
  }, [data, isMuted]);

  useEffect(() => {
    if (data) {
      const effectiveMuted = isMuted || isGlobalMuted;
      setElements([
        <div key={`volume_${data.tabId}_${toggle}`} className="flex w-52 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <span className="text-small font-medium">Volume Control</span>
            <Button
              size="sm"
              variant="light"
              onPress={handleMuteToggle}
              className="cursor-default"
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
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
              onChange={handleVolumeChange}
              aria-label="Volume level slider"
            />
            <div className="flex justify-between text-tiny text-default-500">
              <span>0%</span>
              <span className="font-medium text-default-700">{volume}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>,
      ]);
    }
  }, [data, volume, isMuted, isGlobalMuted, toggle, handleVolumeChange, handleMuteToggle]);

  useEffect(() => {
    const offVolume = rendererIpc.contextMenu.onVolume((_, volumeData) => {
      setData(volumeData);
      setVolume(volumeData.volume);
      setIsMuted(volumeData.muted);
      setIsGlobalMuted(volumeData.globalMuted);
      setWidthSize('sm');
      setToggle(prev => !prev);
      rendererIpc.contextMenu.showWindow();
    });

    return () => offVolume();
  }, [setElements, setWidthSize]);
}
