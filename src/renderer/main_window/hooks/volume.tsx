import rendererIpc from '@lynx_shared/ipc';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {useCardsState} from '../redux/reducers/cards';
import {volumeActions} from '../redux/reducers/volume';
import {AppDispatch} from '../redux/store';

/** Syncs volume state updates from context menu window and audio events to Redux */
export default function useVolumeSync() {
  const dispatch = useDispatch<AppDispatch>();
  const runningCards = useCardsState('runningCard');

  // Listen for volume/mute updates from context menu
  useEffect(() => {
    const removeVolumeListener = rendererIpc.volume.onTabVolumeUpdate((tabId, volume) => {
      dispatch(volumeActions.setTabVolume({tabId, volume}));
    });

    const removeMutedListener = rendererIpc.volume.onTabMutedUpdate((tabId, muted) => {
      dispatch(volumeActions.setTabMuted({tabId, muted}));
    });

    return () => {
      removeVolumeListener();
      removeMutedListener();
    };
  }, [dispatch]);

  // Listen for audio state changes from browser
  useEffect(() => {
    const removeAudioListener = rendererIpc.volume.onAudioStateChange((id, state) => {
      const card = runningCards.find(c => c.id === id);
      if (card) {
        dispatch(volumeActions.setTabAudioPlaying({tabId: card.tabId, playing: state.playing}));
      }
    });

    return () => removeAudioListener();
  }, [dispatch, runningCards]);
}
