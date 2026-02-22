import {ReactNode, useMemo} from 'react';

/**
 * Hook to manage static notifications (e.g., system warnings or upgrade notices).
 * Currently returns an empty list as a placeholder for future implementations.
 *
 * @returns {Object} An object containing static notifications, their count, and a warning state flag.
 */
export default function useStaticNotifications() {
  const staticNotifs = useMemo<ReactNode[]>(() => [], []);

  return {staticNotifs, staticNotifCount: staticNotifs.length, haveWarn: false};
}
