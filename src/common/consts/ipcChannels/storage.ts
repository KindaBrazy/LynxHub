/**
 * IPC channels for storage operations.
 * Handles data persistence, custom settings, and nested updates.
 */
export const storageChannels = {
  get: 'storage:getData',

  getCustom: 'storage:get-custom',
  setCustom: 'storage:set-custom',

  getAll: 'storage:getAllData',
  update: 'storage:updateData',
  updateNested: 'storage:updateNested',
  clear: 'storage:clearStorage',
} as const;

/**
 * IPC channels for storage utility operations.
 * Handles card management, auto-updates, pinned items, and history.
 */
export const storageUtilsChannels = {
  setSystemStartup: 'storageUtils:setSystemStartup',

  addInstalledCard: 'storageUtils:add-installed-card',
  removeInstalledCard: 'storageUtils:remove-installed-card',
  onInstalledCards: 'storageUtils:on-installed-cards',

  addAutoUpdateCard: 'storageUtils:add-autoUpdate-card',
  removeAutoUpdateCard: 'storageUtils:remove-autoUpdate-card',

  addAutoUpdateExtensions: 'storageUtils:add-autoUpdate-extensions',
  removeAutoUpdateExtensions: 'storageUtils:remove-autoUpdate-extensions',

  onAutoUpdateCards: 'storageUtils:on-autoUpdate-cards',
  onAutoUpdateExtensions: 'storageUtils:on-autoUpdate-extensions',

  onPinnedCardsChange: 'storageUtils:on-pinned-cards',
  pinnedCards: 'storageUtils:pinned-cards',

  recentlyUsedCards: 'storageUtils:recently-used-cards',
  onRecentlyUsedCardsChange: 'storageUtils:on-recently-used-cards',

  homeCategory: 'storageUtils:home-category',
  onHomeCategory: 'storageUtils:on-home-category',

  preCommands: 'storageUtils:pre-commands',
  onPreCommands: 'storageUtils:on-pre-commands',

  customRun: 'storageUtils:custom-run',
  onCustomRun: 'storageUtils:on-custom-run',

  customRunBehavior: 'storageUtils:custom-run-behavior',

  preOpen: 'storageUtils:pre-open',

  getCardArguments: 'storageUtils:get-card-arguments',
  setCardArguments: 'storageUtils:set-card-arguments',

  addBrowserRecent: 'storageUtils:add-browser-recent',
  addBrowserFavorite: 'storageUtils:add-browser-favorite',
  addBrowserHistory: 'storageUtils:add-browser-history',
  addBrowserRecentFavIcon: 'storageUtils:add-browser-recent-favicon',
  removeBrowserRecent: 'storageUtils:remove-browser-recent',
  removeBrowserFavorite: 'storageUtils:remove-browser-favorite',
  removeBrowserHistory: 'storageUtils:remove-browser-favorite',

  setShowConfirm: 'storage:set-show-confirm',
  onConfirmChange: 'storage:on-confirm-change',

  addReadNotif: 'storageUtils:add-read-notif',

  setCardTerminalPreCommands: 'storageUtils:card-terminal-preCommands',

  unassignCard: 'storageUtils:unassign-card',
  getBrowserHistoryData: 'storageUtils:getBrowserHistoryData',
} as const;

