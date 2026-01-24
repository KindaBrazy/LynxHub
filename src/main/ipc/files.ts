import {resolve} from 'node:path';

import fileChannels from '@lynx_common/consts/ipc_channels/files';
import {FolderListData, FolderNames} from '@lynx_common/types';
import {MainHT} from '@lynx_common/types/ipc';
import {getAppDirectory} from '@lynx_main/core/data_folder';
import {getAbsolutePath, getRelativePath, openDialog} from '@lynx_main/utils';
import calcFolderSize from '@lynx_main/utils/calc_folder_size';
import {OpenDialogOptions, shell} from 'electron';

import lynxIpc from './lynxIpc';
import {checkFilesExist, getRelativeList, isEmptyDir, removeDir, saveToFile, trashDir} from './methods';

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
  filesIpc.handle.removeDir(dir => removeDir(dir));

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
}

export const filesIpc = {
  on: {
    openPath: (callback: (dir: string) => void) => lynxIpc.on(fileChannels.openPath, callback),
  },
  handle: {
    getAppDirectories: (callback: (name: FolderNames) => MainHT<string>) =>
      lynxIpc.handle(fileChannels.getAppDirectories, callback),
    dialog: (callback: (option: OpenDialogOptions) => MainHT<string | undefined>) =>
      lynxIpc.handle(fileChannels.dialog, callback),
    saveToFile: (callback: (content: string) => MainHT<string | null>) =>
      lynxIpc.handle(fileChannels.saveToFile, callback),
    removeDir: (callback: (dir: string) => MainHT<void>) => lynxIpc.handle(fileChannels.removeDir, callback),
    trashDir: (callback: (dir: string) => MainHT<void>) => lynxIpc.handle(fileChannels.trashDir, callback),
    isEmptyDir: (callback: (dir: string) => MainHT<boolean>) => lynxIpc.handle(fileChannels.isEmptyDir, callback),
    listDir: (callback: (dirPath: string, relatives: string[]) => MainHT<FolderListData[]>) =>
      lynxIpc.handle(fileChannels.listDir, callback),
    checkFilesExist: (callback: (dir: string, fileNames: string[]) => MainHT<boolean>) =>
      lynxIpc.handle(fileChannels.checkFilesExist, callback),
    calcFolderSize: (callback: (dir: string) => MainHT<number>) =>
      lynxIpc.handle(fileChannels.calcFolderSize, callback),
    getRelativePath: (callback: (basePath: string, targetPath: string) => MainHT<string>) =>
      lynxIpc.handle(fileChannels.getRelativePath, callback),
    getAbsolutePath: (callback: (basePath: string, targetPath: string) => MainHT<string>) =>
      lynxIpc.handle(fileChannels.getAbsolutePath, callback),
  },
};
