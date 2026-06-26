import applicationIpc from '@lynx_shared/ipc/application';
import browserIpc from '@lynx_shared/ipc/browser';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import windowDialogsIpc from '@lynx_shared/ipc/dialogsWindow';
import downloadManagerIpc from '@lynx_shared/ipc/downloadManager';
import filesIpc from '@lynx_shared/ipc/files';
import gitIpc from '@lynx_shared/ipc/git';
import lynxIpc from '@lynx_shared/ipc/lynxIpc';
import ptyIpc from '@lynx_shared/ipc/pty';
import shareScreenIpc from '@lynx_shared/ipc/shareScreen';
import staticsIpc from '@lynx_shared/ipc/statics';
import storageIpc from '@lynx_shared/ipc/storage';
import toastWindowIpc from '@lynx_shared/ipc/toastWindow';
import userIpc from '@lynx_shared/ipc/user';
import userImagesIpc from '@lynx_shared/ipc/userImages';
import utilsIpc from '@lynx_shared/ipc/utils';

import {RendererIpcApi} from './types/ipcWrapper';

export const rendererIpcApi: RendererIpcApi = {
  lynxIpc: lynxIpc,
  application: applicationIpc,
  browser: browserIpc,
  contextMenu: contextMenuIpc,
  windowDialogs: windowDialogsIpc,
  downloadManager: downloadManagerIpc,
  files: filesIpc,
  git: gitIpc,
  pty: ptyIpc,
  shareScreen: shareScreenIpc,
  statics: staticsIpc,
  storage: storageIpc,
  toastWindow: toastWindowIpc,
  user: userIpc,
  userImages: userImagesIpc,
  utils: utilsIpc,
};
