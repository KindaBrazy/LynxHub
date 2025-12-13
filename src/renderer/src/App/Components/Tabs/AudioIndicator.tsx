import {Button} from '@heroui/react';
import {VolumeCross, VolumeLoud} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {useVolumeState, volumeActions} from '../../Redux/Reducer/VolumeReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';

type Props = {
  tabId: string;
  id: string;
};

const AudioIndicator = memo(({tabId, id}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const tabAudioPlaying = useVolumeState('tabAudioPlaying');
  const tabMuted = useVolumeState('tabMuted');
  const globalMuted = useVolumeState('globalMuted');

  const isPlaying = tabAudioPlaying[tabId] || false;
  const isMuted = tabMuted[tabId] || false;

  const handleMuteToggle = useCallback(async () => {
    const newMutedState = !isMuted;
    dispatch(volumeActions.setTabMuted({tabId, muted: newMutedState}));

    try {
      // Apply effective mute: tab is muted if either tab mute OR global mute is enabled
      const effectiveMute = newMutedState || globalMuted;
      await rendererIpc.volume.setMuted(id, effectiveMute);
    } catch (error) {
      console.error('Failed to toggle mute state:', error);
    }
  }, [dispatch, id, tabId, isMuted, globalMuted]);

  const icon = useMemo(
    () => (isMuted ? <VolumeCross className="size-3.5 shrink-0" /> : <VolumeLoud className="size-3.5 shrink-0" />),
    [isMuted],
  );
  const ariaLabel = useMemo(() => (isMuted ? 'Unmute tab audio' : 'Mute tab audio'), [isMuted]);
  const ariaDescription = useMemo(() => (isPlaying ? 'Audio is currently playing' : 'Audio indicator'), [isPlaying]);

  // Don't render if not playing and not muted
  if (!isPlaying && !isMuted) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="light"
      aria-label={ariaLabel}
      aria-pressed={isMuted}
      onPress={handleMuteToggle}
      aria-description={ariaDescription}
      className="cursor-default scale-90 min-w-0 p-1 shrink-0"
      isIconOnly>
      {icon}
    </Button>
  );
});

export default AudioIndicator;
