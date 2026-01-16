import {Button, Slider} from '@heroui/react';
import {Volume, VolumeCross, VolumeLoud} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useRef, useState} from 'react';

import rendererIpc from '../../../main_window/services/RendererIpc';
import {SetElementsType, SetWidthSizeType} from '../hooks';

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
  const volumeIpcTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleVolumeChange = useCallback(
    (value: number | number[]) => {
      if (!data) return;
      const newVolume = Array.isArray(value) ? value[0] : value;
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      setVolume(clampedVolume);

      // Debounce the IPC call to avoid flooding main process
      if (volumeIpcTimerRef.current) {
        clearTimeout(volumeIpcTimerRef.current);
      }
      volumeIpcTimerRef.current = setTimeout(() => {
        rendererIpc.volume.setVolume(data.id, clampedVolume).catch(error => {
          console.error('Failed to set volume:', error);
        });
      }, 50);

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
        <div key={`volume_${data.tabId}_${toggle}`} className="flex w-full flex-col gap-4 p-4">
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
      setWidthSize('md');
      setToggle(prev => !prev);
      rendererIpc.contextMenu.showWindow();
    });

    // Clear state when other menus open
    const clearState = () => setData(null);
    const offInitView = rendererIpc.contextMenu.onInitView(clearState);
    const offZoom = rendererIpc.contextMenu.onZoom(clearState);
    const offFind = rendererIpc.contextMenu.onFind(clearState);
    const offTerminateAI = rendererIpc.contextMenu.onTerminateAI(clearState);
    const offTerminateTab = rendererIpc.contextMenu.onTerminateTab(clearState);
    const offCloseApp = rendererIpc.contextMenu.onCloseApp(clearState);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (volumeIpcTimerRef.current) clearTimeout(volumeIpcTimerRef.current);
      offVolume();
      offInitView();
      offZoom();
      offFind();
      offTerminateAI();
      offTerminateTab();
      offCloseApp();
    };
  }, [setElements, setWidthSize]);
}
