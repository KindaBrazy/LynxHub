/**
 * IPC channels for user-related operations.
 * Handles user authentication and Patreon integration.
 */
export const userChannels = {
  patreon: {
    getInfo: 'patreon:getInfo',
    login: 'patreon:login',
    logout: 'patreon:logout',
    updateChannel: 'patreon:updateChannel',

    onReleaseChannel: 'patreon:onReleaseChannel',
  },
} as const;

