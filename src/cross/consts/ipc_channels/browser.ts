const browserChannels = {
  createBrowser: 'browser:create-browser',
  removeBrowser: 'browser:remove-browser',
  loadURL: 'browser:load-url',
  setVisible: 'browser:set-visible',

  openFindInPage: 'browser:openFindInPage',
  openZoom: 'browser:openZoom',
  openVolume: 'browser:openVolume',

  onLinkHover: 'browser:on-link-hover',
  resizeLinkPreview: 'browser:resize-link-preview',

  findInPage: 'browser:findInPage',
  stopFindInPage: 'browser:stopFindInPage',
  setZoomFactor: 'browser:setZoomFactor',

  focusWebView: 'browser:focus-webview',

  clearCache: 'browser:clear-cache',
  clearCookies: 'browser:clear-cookies',

  reload: 'browser:reload',
  stop: 'browser:stop',
  goBack: 'browser:goBack',
  goForward: 'browser:goForward',

  toggleDevTools: 'browser:toggle-devtools',

  onCanGo: 'browser:on-can-go',
  isLoading: 'browser:is-loading',
  onTitleChange: 'browser:on-title-change',
  onFavIconChange: 'browser:on-favicon-change',
  onUrlChange: 'browser:on-url-change',
  onDomReady: 'browser:on-dom-ready',

  getUserAgent: 'browser:get-user-agent',
  updateUserAgent: 'browser:update-user-agent',

  addOffset: 'browser:add-offset',
  clearHistory: 'browser:clear-history',

  onFailedLoadUrl: 'browser:on-failed-load-url',
  onClearFailed: 'browser:on-clear-failed',
};

export default browserChannels;
