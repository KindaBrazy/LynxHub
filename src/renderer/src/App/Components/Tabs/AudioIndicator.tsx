import {Button, Tooltip} from '@heroui/react';
import {Soundwave, VolumeCross} from '@solar-icons/react-perf/BoldDuotone';
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
    () => (isMuted ? <VolumeCross className="size-3.5" /> : <Soundwave className="size-3.5" />),
    [isMuted],
  );
  const tooltipText = useMemo(() => (isMuted ? 'Unmute tab audio' : 'Mute tab audio'), [isMuted]);
  const ariaLabel = useMemo(() => (isMuted ? 'Unmute tab audio' : 'Mute tab audio'), [isMuted]);
  const ariaDescription = useMemo(() => (isPlaying ? 'Audio is currently playing' : 'Audio indicator'), [isPlaying]);

  // Don't render if not playing and not muted
  if (!isPlaying && !isMuted) {
    return null;
  }

  return (
    <Tooltip delay={300} radius="sm" offset={-2} placement="bottom" content={tooltipText} showArrow>
      <Button
        size="sm"
        variant="light"
        aria-label={ariaLabel}
        aria-pressed={isMuted}
        onPress={handleMuteToggle}
        aria-description={ariaDescription}
        className="cursor-default scale-75 min-w-0 p-1"
        isIconOnly>
        {icon}
      </Button>
    </Tooltip>
  );
});

export default AudioIndicator;
