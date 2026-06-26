import {appActions} from '@lynx/redux/reducers/app';
import {useUserState} from '@lynx/redux/reducers/user';
import storageIpc from '@lynx_shared/ipc/storage';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Hook to track user active usage days and duration.
 * Triggers the tier upgrade promo modal when the user runs the app
 * on at least 3 distinct days and logs at least 7 hours of active usage.
 */
export default function useUsageTracker() {
  const dispatch = useDispatch();
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    // Generate today's date string in local YYYY-MM-DD format
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Initialize/check usage stats on mount
    storageIpc.get('app').then(appData => {
      const activeDays = appData.activeDays || [];
      const totalUsageTime = appData.totalUsageTime || 0;
      const hasSeenUpgradePromo = appData.hasSeenUpgradePromo || false;

      const updatedActiveDays = [...activeDays];
      if (!updatedActiveDays.includes(todayStr)) {
        updatedActiveDays.push(todayStr);
        storageIpc.update('app', {activeDays: updatedActiveDays});
      }

      // Check if conditions are already met on startup
      if (
        updatedActiveDays.length >= 3 &&
        totalUsageTime >= 25200 && // 7 hours in seconds
        !hasSeenUpgradePromo &&
        updateChannel === 'public'
      ) {
        dispatch(appActions.setAppState({key: 'showUpgradePromo', value: true}));
      }
    });

    // Set up active usage timer to increment totalUsageTime every 60 seconds
    const interval = setInterval(() => {
      storageIpc.get('app').then(appData => {
        const activeDays = appData.activeDays || [];
        const totalUsageTime = appData.totalUsageTime || 0;
        const hasSeenUpgradePromo = appData.hasSeenUpgradePromo || false;

        const updatedActiveDays = [...activeDays];
        if (!updatedActiveDays.includes(todayStr)) {
          updatedActiveDays.push(todayStr);
        }

        const newTotalUsageTime = totalUsageTime + 60;

        storageIpc.update('app', {
          totalUsageTime: newTotalUsageTime,
          activeDays: updatedActiveDays,
        });

        // Trigger promo dynamically if threshold is reached during this session
        if (
          updatedActiveDays.length >= 3 &&
          newTotalUsageTime >= 25200 && // 7 hours in seconds
          !hasSeenUpgradePromo &&
          updateChannel === 'public'
        ) {
          dispatch(appActions.setAppState({key: 'showUpgradePromo', value: true}));
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, updateChannel]);
}
