/**
 * IPC channels for file system operations.
 * Handles directory listing, file dialogs, path manipulation, and other file-related tasks.
 */
export const fileChannels = {
  getAppDirectories: 'app:getAppDirectories',
  dialog: 'app:openDialog',
  extensionsNames: 'app:extensionsFolder',
  openPath: 'app:openPath',
  saveToFile: 'app:saveToFile',
  removeDir: 'app:removeDir',
  trashDir: 'app:trashDir',
  listDir: 'app:listDir',
  checkFilesExist: 'app:checkFilesExist',
  calcFolderSize: 'app:calcFolderSize',
  getRelativePath: 'app:getRelativePath',
  getAbsolutePath: 'app:getAbsolutePath',

  isEmptyDir: 'app:isEmptyDir',
} as const;

