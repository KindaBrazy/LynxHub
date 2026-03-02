/**
 * IPC channels for module management.
 * Handles module updates, uninstallation, and card availability checks.
 */
export const modulesChannels = {
  cardUpdateAvailable: 'modules:card-update-available',
  uninstallCardByID: 'modules:uninstall-card-by-id',
  checkCardsUpdateInterval: 'modules:cards_update_interval',
  onCardsUpdateAvailable: 'modules:on_cards_update_available',
  onCardUpdateChecking: 'modules:on_cards_update_checking',
} as const;

/**
 * IPC channels for module API information.
 * Handles retrieval of module metadata like folder creation time and version tags.
 */
export const moduleApiChannels = {
  getFolderCreationTime: 'moduleApi:getFolderCreationTime',
  getLastPulledDate: 'moduleApi:getLastPulledDate',
  getCurrentReleaseTag: 'moduleApi:getCurrentReleaseTag',
} as const;
