import {Button} from '@heroui/react';
import rendererIpc from '@lynx_shared/ipc';
import {Volume, VolumeCross, VolumeLoud} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useMemo, useRef} from 'react';

import {useVolumeState} from '../../../../redux/reducers/volume';

type Props = {
  id: string;
  tabId: string;
};

const Browser_Volume = memo(({id, tabId}: Props) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const tabAudioPlaying = useVolumeState('tabAudioPlaying');
  const tabMuted = useVolumeState('tabMuted');
  const tabVolumes = useVolumeState('tabVolumes');
  const globalMuted = useVolumeState('globalMuted');

  const isPlaying = tabAudioPlaying[tabId] || false;
  const isMuted = tabMuted[tabId] || false;
  const volume = tabVolumes[tabId] ?? 100;

  const openVolumeMenu = useCallback(() => {
    const bounds = btnRef.current?.getBoundingClientRect();
    if (bounds) {
      const {x, y} = bounds;
      rendererIpc.browser.openVolume({id, tabId, volume, muted: isMuted, globalMuted}, {x: x - 125, y: y + 30});
    } else {
      rendererIpc.browser.openVolume({id, tabId, volume, muted: isMuted, globalMuted});
    }
  }, [id, tabId, volume, isMuted, globalMuted]);

  const icon = useMemo(() => {
    if (isMuted || globalMuted) {
      return <VolumeCross className="size-4" />;
    }
    if (volume > 50) {
      return <VolumeLoud className="size-4" />;
    }
    return <Volume className="size-4" />;
  }, [isMuted, globalMuted, volume]);

  const ariaLabel = useMemo(() => {
    if (isMuted || globalMuted) {
      return 'Volume control (muted)';
    }
    if (isPlaying) {
      return 'Volume control (playing)';
    }
    return 'Volume control';
  }, [isMuted, globalMuted, isPlaying]);

  const ariaDescription = useMemo(() => {
    const parts: string[] = [];
    if (isMuted || globalMuted) {
      parts.push('Audio is muted');
    }
    if (isPlaying) {
      parts.push('Audio is playing');
    }
    parts.push(`Current volume: ${volume} percent`);
    return parts.join('. ');
  }, [isMuted, globalMuted, isPlaying, volume]);

  return (
    <Button
      size="sm"
      ref={btnRef}
      variant="light"
      aria-label={ariaLabel}
      onPress={openVolumeMenu}
      className="cursor-default"
      aria-description={ariaDescription}
      isIconOnly>
      {icon}
    </Button>
  );
});

export default Browser_Volume;
