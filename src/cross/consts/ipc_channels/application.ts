export const winChannels = {
  changeState: 'win:state-change',
  onChangeState: 'win:on-state-change',

  setDarkMode: 'win:set-darkMode',
  getSystemDarkMode: 'win:get-system-darkMode',
  onDarkMode: 'win:on-darkMode',
  isDarkMode: 'win:isDarkMode',

  setTaskBarStatus: 'win:set-taskbar-status',

  getSystemInfo: 'win:get-system-info',
  openUrlDefaultBrowser: 'win:open-url-default-browser',

  // Window progress bar (taskbar/dock)
  setProgressBar: 'win:set-progress-bar',
};

export default winChannels;
