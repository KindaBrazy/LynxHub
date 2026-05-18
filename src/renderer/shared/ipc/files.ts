import {fileChannels} from '@lynx_common/consts/ipcChannels/files';
import type {FolderListData, FolderNames} from '@lynx_common/types';
import type {OpenDialogOptions} from 'electron';

import lynxIpc from './lynxIpc';

const filesIpc = {
  // Opens file/folder selection dialog
  openDlg: (option: OpenDialogOptions) => lynxIpc.invoke<string | undefined>(fileChannels.dialog, option),

  // Opens file/folder selection dialog and returns all selected paths.
  openDlgMany: (option: OpenDialogOptions) =>
    lynxIpc
      .invoke<string | string[] | undefined>(fileChannels.dialog, {
        ...option,
        properties: Array.from(new Set([...(option.properties || []), 'multiSelections'])),
      })
      .then(result => (Array.isArray(result) ? result : result ? [result] : [])),

  // Opens directory in system file manager
  openPath: (dir: string) => lynxIpc.send(fileChannels.openPath, dir),

  // Shows save dialog and saves content to file
  saveToFile: (content: string) => lynxIpc.invoke<string | null>(fileChannels.saveToFile, content),

  // Gets app directory path by folder name (cards, extensions, etc.)
  getAppDirectories: (name: FolderNames) => lynxIpc.invoke<string>(fileChannels.getAppDirectories, name),

  // Permanently removes directory and all contents
  removeDir: (dir: string) => lynxIpc.invoke<void>(fileChannels.removeDir, dir),

  // Moves directory to system trash
  trashDir: (dir: string) => lynxIpc.invoke<void>(fileChannels.trashDir, dir),

  // Lists directory contents with relative path support
  listDir: (dirPath: string, relatives: string[]) =>
    lynxIpc.invoke<FolderListData[]>(fileChannels.listDir, dirPath, relatives),

  // Checks if specified files exist in directory
  checkFilesExist: (dir: string, fileNames: string[]) =>
    lynxIpc.invoke<boolean>(fileChannels.checkFilesExist, dir, fileNames),

  // Calculates total size of folder and all contents
  calcFolderSize: (dir: string) => lynxIpc.invoke<number>(fileChannels.calcFolderSize, dir),

  // Converts absolute path to relative path
  getRelativePath: (basePath: string, targetPath: string) =>
    lynxIpc.invoke<string>(fileChannels.getRelativePath, basePath, targetPath),

  // Converts relative path to absolute path
  getAbsolutePath: (basePath: string, targetPath: string) =>
    lynxIpc.invoke<string>(fileChannels.getAbsolutePath, basePath, targetPath),

  // Checks if directory is empty
  isEmptyDir: (dir: string) => lynxIpc.invoke<boolean>(fileChannels.isEmptyDir, dir),
  isAbsolute: (dir: string) => lynxIpc.invoke<boolean>(fileChannels.isAbsolute, dir),
};

export default filesIpc;
