import {isAbsolute, resolve} from 'node:path';

import {fileChannels} from '@lynx_common/consts/ipcChannels/files';
import {FolderListData, FolderNames} from '@lynx_common/types';
import {MainHT} from '@lynx_common/types/ipc';
import {getAppDirectory} from '@lynx_main/managers/dataFolder';
import {getAbsolutePath, getRelativePath, openDialog} from '@lynx_main/utils';
import calcFolderSize from '@lynx_main/utils/calcFolderSize';
import {OpenDialogOptions, shell} from 'electron';

import lynxIpc from './ipcWrapper';
import {
  checkFilesExist,
  getRelativeList,
  isEmptyDir,
  removeDirRecursive,
  saveToFile,
  trashDir,
} from './methods/windowUtils';

/**
 * Initializes listeners for file system events.
 */
export default function listenFiles() {
  // Gets app directory path by folder name (cards, extensions, etc.)
  filesIpc.handle.getAppDirectories(name => getAppDirectory(name));

  // Opens file/folder selection dialog
  filesIpc.handle.dialog(option => openDialog(option));

  // Opens directory in system file manager
  filesIpc.on.openPath(dir => shell.openPath(resolve(dir)));

  // Shows save dialog and saves content to file
  filesIpc.handle.saveToFile(content => saveToFile(content));

  // Permanently removes directory and all contents
  filesIpc.handle.removeDir(dir => removeDirRecursive(dir));

  // Moves directory to system trash
  filesIpc.handle.trashDir(dir => trashDir(dir));

  // Checks if directory is empty
  filesIpc.handle.isEmptyDir(dir => isEmptyDir(dir));

  // Lists directory contents with relative path support
  filesIpc.handle.listDir((dirPath, relatives) => getRelativeList(dirPath, relatives));

  // Checks if specified files exist in directory
  filesIpc.handle.checkFilesExist((dir, fileNames) => checkFilesExist(dir, fileNames));

  // Calculates total size of folder and all contents
  filesIpc.handle.calcFolderSize(dir => calcFolderSize(dir));

  // Converts absolute path to relative path
  filesIpc.handle.getRelativePath((basePath, targetPath) => getRelativePath(basePath, targetPath));

  // Converts relative path to absolute path
  filesIpc.handle.getAbsolutePath((basePath, targetPath) => getAbsolutePath(basePath, targetPath));

  filesIpc.handle.isAbsolute(dir => isAbsolute(dir));
}

/**
 * IPC interface for file system operations.
 */
export const filesIpc = {
  on: {
    /** Listens for open path request */
    openPath: (callback: (dir: string) => void) => lynxIpc.on(fileChannels.openPath, callback),
  },
  handle: {
    /** Handles get app directories request */
    getAppDirectories: (callback: (name: FolderNames) => MainHT<string>) =>
      lynxIpc.handle(fileChannels.getAppDirectories, callback),
    /** Handles open dialog request */
    dialog: (callback: (option: OpenDialogOptions) => MainHT<string | string[] | undefined>) =>
      lynxIpc.handle(fileChannels.dialog, callback),
    /** Handles save to file request */
    saveToFile: (callback: (content: string) => MainHT<string | null>) =>
      lynxIpc.handle(fileChannels.saveToFile, callback),
    /** Handles remove directory request */
    removeDir: (callback: (dir: string) => MainHT<void>) => lynxIpc.handle(fileChannels.removeDir, callback),
    /** Handles trash directory request */
    trashDir: (callback: (dir: string) => MainHT<void>) => lynxIpc.handle(fileChannels.trashDir, callback),
    /** Handles check if directory is empty request */
    isEmptyDir: (callback: (dir: string) => MainHT<boolean>) => lynxIpc.handle(fileChannels.isEmptyDir, callback),
    /** Handles list directory request */
    listDir: (callback: (dirPath: string, relatives: string[]) => MainHT<FolderListData[]>) =>
      lynxIpc.handle(fileChannels.listDir, callback),
    /** Handles check files exist request */
    checkFilesExist: (callback: (dir: string, fileNames: string[]) => MainHT<boolean>) =>
      lynxIpc.handle(fileChannels.checkFilesExist, callback),
    /** Handles calculate folder size request */
    calcFolderSize: (callback: (dir: string) => MainHT<number>) =>
      lynxIpc.handle(fileChannels.calcFolderSize, callback),
    /** Handles get relative path request */
    getRelativePath: (callback: (basePath: string, targetPath: string) => MainHT<string>) =>
      lynxIpc.handle(fileChannels.getRelativePath, callback),
    /** Handles get absolute path request */
    getAbsolutePath: (callback: (basePath: string, targetPath: string) => MainHT<string>) =>
      lynxIpc.handle(fileChannels.getAbsolutePath, callback),
    isAbsolute: (callback: (dir: string) => MainHT<boolean>) => lynxIpc.handle(fileChannels.isAbsolute, callback),
  },
};
