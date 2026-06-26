import {appActions, useAppState} from '@lynx/redux/reducers/app';
import {useUserState} from '@lynx/redux/reducers/user';
import storageIpc from '@lynx_shared/ipc/storage';
import userIpc from '@lynx_shared/ipc/user';
import {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Hook to track user active usage days and duration.
 * Triggers the tier upgrade promo modal (6 days & 6 hours or 20 active days)
 * and the GitHub star promo modal (3 days & 3 hours or 10 active days) under appropriate conditions.
 * Ensures mutual exclusivity, cooldown spacing, and support for non-GitHub connected users.
 */
export default function useUsageTracker() {
  const dispatch = useDispatch();
  const updateChannel = useUserState('updateChannel');
  const userData = useUserState('userData');
  const isGitHubConnected = userData?.connectedProviders?.includes('github') || false;

  const showUpgradePromo = useAppState('showUpgradePromo');
  const showStarPromo = useAppState('showStarPromo');
  const isAnyPromoOpen = showUpgradePromo || showStarPromo;
  const isAnyPromoOpenRef = useRef(isAnyPromoOpen);

  useEffect(() => {
    isAnyPromoOpenRef.current = isAnyPromoOpen;
  }, [isAnyPromoOpen]);

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
      lastPromoShownActiveDaysCount: number | undefined,
    ) => {
      // 1. Mutual Exclusivity: Do not trigger if any promo modal is currently open
      if (isAnyPromoOpenRef.current) {
        return;
      }

      // 2. Cooldown check: At least 3 active days must pass between promo modals
      const cooldownMet =
        lastPromoShownActiveDaysCount === undefined || activeDays.length - lastPromoShownActiveDaysCount >= 3;

      if (!cooldownMet) {
        return;
      }

      // 3. Upgrade Promo: 6 active days & 6 hours (21600 seconds) OR 20 active days
      // Must only be shown after the user has seen the Star promo (or already starred the repo)
      const upgradeThresholdMet = (activeDays.length >= 6 && totalUsageTime >= 21600) || activeDays.length >= 20;

      if (
        upgradeThresholdMet &&
        !hasSeenUpgradePromo &&
        (hasSeenStarPromo || hasStarredRepo) &&
        updateChannel === 'public'
      ) {
        dispatch(appActions.setAppState({key: 'showUpgradePromo', value: true}));
        storageIpc.update('app', {lastPromoShownActiveDaysCount: activeDays.length});
        return;
      }

      // 4. Star Repo Promo: 3 active days & 3 hours (10800 seconds) OR 10 active days
      const starThresholdMet = (activeDays.length >= 3 && totalUsageTime >= 10800) || activeDays.length >= 10;

      if (starThresholdMet && !hasSeenStarPromo && !hasStarredRepo && updateChannel === 'public') {
        if (isGitHubConnected) {
          // Double check with GitHub API first if they have starred it
          userIpc.account.checkGitHubStar().then(res => {
            if (res.starred) {
              storageIpc.update('app', {hasStarredRepo: true});
            } else {
              dispatch(appActions.setAppState({key: 'showStarPromo', value: true}));
              storageIpc.update('app', {lastPromoShownActiveDaysCount: activeDays.length});
            }
          });
        } else {
          // Show star promo even if GitHub is not connected (modal will adapt)
          dispatch(appActions.setAppState({key: 'showStarPromo', value: true}));
          storageIpc.update('app', {lastPromoShownActiveDaysCount: activeDays.length});
        }
      }
    };

    // Initialize/check usage stats on mount
    storageIpc.get('app').then(appData => {
      const activeDays = appData.activeDays || [];
      const totalUsageTime = appData.totalUsageTime || 0;
      const hasSeenUpgradePromo = appData.hasSeenUpgradePromo || false;
      const hasSeenStarPromo = appData.hasSeenStarPromo || false;
      const hasStarredRepo = appData.hasStarredRepo || false;
      const lastPromoShownActiveDaysCount = appData.lastPromoShownActiveDaysCount;

      const updatedActiveDays = [...activeDays];
      if (!updatedActiveDays.includes(todayStr)) {
        updatedActiveDays.push(todayStr);
        storageIpc.update('app', {activeDays: updatedActiveDays});
      }

      checkAndTriggerPromos(
        updatedActiveDays,
        totalUsageTime,
        hasSeenUpgradePromo,
        hasSeenStarPromo,
        hasStarredRepo,
        lastPromoShownActiveDaysCount,
      );
    });

    // Set up active usage timer to increment totalUsageTime every 60 seconds
    const interval = setInterval(() => {
      storageIpc.get('app').then(appData => {
        const activeDays = appData.activeDays || [];
        const totalUsageTime = appData.totalUsageTime || 0;
        const hasSeenUpgradePromo = appData.hasSeenUpgradePromo || false;
        const hasSeenStarPromo = appData.hasSeenStarPromo || false;
        const hasStarredRepo = appData.hasStarredRepo || false;
        const lastPromoShownActiveDaysCount = appData.lastPromoShownActiveDaysCount;

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
          lastPromoShownActiveDaysCount,
        );
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, updateChannel, isGitHubConnected]);
}
