import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {volumeActions} from '../Redux/Reducer/VolumeReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';

/** Syncs volume state updates from context menu window to Redux */
export default function useVolumeSync() {
  const dispatch = useDispatch<AppDispatch>();

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
}
