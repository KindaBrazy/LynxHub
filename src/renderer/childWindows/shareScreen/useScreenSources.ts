import {useEffect, useState} from 'react';

import {ScreenShareSources} from '@lynx_common/types/shareScreen';
import shareScreenIpc from '@lynx_shared/ipc/shareScreen';

export type UseScreenSourcesReturn = {
  isLoading: boolean;
  screens: ScreenShareSources[];
  windows: ScreenShareSources[];
};

/**
 * Custom hook to fetch available screen and window sources for screen sharing.
 *
 * @returns {UseScreenSourcesReturn} An object containing loading state, screens, and windows.
 */
export function useScreenSources(): UseScreenSourcesReturn {
  const [screens, setScreens] = useState<ScreenShareSources[]>([]);
  const [windows, setWindows] = useState<ScreenShareSources[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([shareScreenIpc.getScreenSources(), shareScreenIpc.getWindowSources()])
      .then(([fetchedScreens, fetchedWindows]) => {
        if (isMounted) {
          setScreens(fetchedScreens);
          setWindows(fetchedWindows);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch screen sources:', error);
        // If there's an error, we might want to close the window or show an error state.
        // For now, following original logic, we just cancel.
        shareScreenIpc.cancel();
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {isLoading, screens, windows};
}
