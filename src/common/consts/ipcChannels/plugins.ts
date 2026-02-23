/**
 * IPC channels for plugin management.
 * Handles plugin installation, uninstallation, syncing, and listing.
 */
export const pluginChannels = {
  onSyncAvailable: 'plugins:on-sync-available',

  getList: 'plugins:get-list',
  getAddresses: 'plugins:get-addresses',
  getInstalledList: 'plugins:get-installed-list',
  getUnloadedList: 'plugins:get-unloaded-list',

  install: 'plugins:install',
  uninstall: 'plugins:uninstall',
  sync: 'plugins:sync',
  syncAll: 'plugins:sync-all',
  checkForSync: 'plugins:check-for-sync',

  updateSyncList: 'plugins:update-sync-list',
} as const;
