import {useCardsState} from '@lynx/redux/reducers/cards';
import {volumeActions} from '@lynx/redux/reducers/volume';
import {AppDispatch} from '@lynx/redux/store';
import browserIpc from '@lynx_shared/ipc/browser';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Syncs volume state updates from context menu window and audio events to Redux.
 */
export default function useVolumeSync() {
  const dispatch = useDispatch<AppDispatch>();
  const runningCards = useCardsState('runningCard');

  // Listen for volume/mute updates from context menu
  useEffect(() => {
    const removeVolumeListener = browserIpc.on.onTabVolumeUpdate((tabId, volume) => {
      dispatch(volumeActions.setTabVolume({tabId, volume}));
    });

    const removeMutedListener = browserIpc.on.onTabMutedUpdate((tabId, muted) => {
      dispatch(volumeActions.setTabMuted({tabId, muted}));
    });

    return () => {
      removeVolumeListener();
      removeMutedListener();
    };
  }, [dispatch]);

  // Listen for audio state changes from browser
  useEffect(() => {
    const removeAudioListener = browserIpc.on.onAudioStateChange((id, state) => {
      const card = runningCards.find(c => c.id === id);
      if (card) {
        dispatch(volumeActions.setTabAudioPlaying({tabId: card.tabId, playing: state.playing}));
      }
    });

    return () => removeAudioListener();
  }, [dispatch, runningCards]);
}
