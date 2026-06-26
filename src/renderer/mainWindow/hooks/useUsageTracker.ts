import {appActions} from '@lynx/redux/reducers/app';
import {useUserState} from '@lynx/redux/reducers/user';
import storageIpc from '@lynx_shared/ipc/storage';
import userIpc from '@lynx_shared/ipc/user';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Hook to track user active usage days and duration.
 * Triggers the tier upgrade promo modal (6 days & 14 hours)
 * and the GitHub star promo modal (3 days & 7 hours) under appropriate conditions.
 */
export default function useUsageTracker() {
  const dispatch = useDispatch();
  const updateChannel = useUserState('updateChannel');
  const userData = useUserState('userData');
  const isGitHubConnected = userData?.connectedProviders?.includes('github') || false;

  useEffect(() => {
    // Generate today's date string in local YYYY-MM-DD format
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const checkAndTriggerPromos = (
      activeDays: string[],
      totalUsageTime: number,
      hasSeenUpgradePromo: boolean,
      hasSeenStarPromo: boolean,
      hasStarredRepo: boolean,
    ) => {
      // 1. Upgrade Promo: 6 days and 14 hours (50400 seconds)
      if (
        activeDays.length >= 6 &&
        totalUsageTime >= 50400 && // 14 hours in seconds
        !hasSeenUpgradePromo &&
        updateChannel === 'public'
      ) {
        dispatch(appActions.setAppState({key: 'showUpgradePromo', value: true}));
      }

      // 2. Star Repo Promo: 3 days and 7 hours (25200 seconds)
      // Only show if GitHub is connected, and user hasn't seen it and hasn't starred yet
      if (
        activeDays.length >= 3 &&
        totalUsageTime >= 25200 && // 7 hours in seconds
        isGitHubConnected &&
        !hasSeenStarPromo &&
        !hasStarredRepo &&
        updateChannel === 'public'
      ) {
        // Double check with GitHub API first if they have starred it
        userIpc.account.checkGitHubStar().then(res => {
          if (res.starred) {
            storageIpc.update('app', {hasStarredRepo: true});
          } else {
            dispatch(appActions.setAppState({key: 'showStarPromo', value: true}));
          }
        });
      }
    };

    // Initialize/check usage stats on mount
    storageIpc.get('app').then(appData => {
      const activeDays = appData.activeDays || [];
      const totalUsageTime = appData.totalUsageTime || 0;
      const hasSeenUpgradePromo = appData.hasSeenUpgradePromo || false;
      const hasSeenStarPromo = appData.hasSeenStarPromo || false;
      const hasStarredRepo = appData.hasStarredRepo || false;

      const updatedActiveDays = [...activeDays];
      if (!updatedActiveDays.includes(todayStr)) {
        updatedActiveDays.push(todayStr);
        storageIpc.update('app', {activeDays: updatedActiveDays});
      }

      checkAndTriggerPromos(updatedActiveDays, totalUsageTime, hasSeenUpgradePromo, hasSeenStarPromo, hasStarredRepo);
    });

    // Set up active usage timer to increment totalUsageTime every 60 seconds
    const interval = setInterval(() => {
      storageIpc.get('app').then(appData => {
        const activeDays = appData.activeDays || [];
        const totalUsageTime = appData.totalUsageTime || 0;
        const hasSeenUpgradePromo = appData.hasSeenUpgradePromo || false;
        const hasSeenStarPromo = appData.hasSeenStarPromo || false;
        const hasStarredRepo = appData.hasStarredRepo || false;

        const updatedActiveDays = [...activeDays];
        if (!updatedActiveDays.includes(todayStr)) {
          updatedActiveDays.push(todayStr);
        }

        const newTotalUsageTime = totalUsageTime + 60;

        storageIpc.update('app', {
          totalUsageTime: newTotalUsageTime,
          activeDays: updatedActiveDays,
        });

        checkAndTriggerPromos(
          updatedActiveDays,
          newTotalUsageTime,
          hasSeenUpgradePromo,
          hasSeenStarPromo,
          hasStarredRepo,
        );
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, updateChannel, isGitHubConnected]);
}
