import {applicationIpc} from '../../ipc/application';
import {browserIpc} from '../../ipc/browser';
import {contextMenuIpc} from '../../ipc/contextMenu';
import {dialogsWindowIpc} from '../../ipc/dialogsWindow';
import {downloadManagerIpc} from '../../ipc/downloadManager';
import {filesIpc} from '../../ipc/filesIpc';
import {gitIpc} from '../../ipc/gitIpc';
import lynxIpc from '../../ipc/ipcWrapper';
import {ptyIpc} from '../../ipc/pty';
import {sendToContextMenu, sendToLinkPreview, sendToMain} from '../../ipc/sender';
import {shareScreenIpc} from '../../ipc/shareScreen';
import {staticsIpc} from '../../ipc/statics';
import {storageIpc, storageUtilsIpc} from '../../ipc/storage';
import {userIpc} from '../../ipc/user';
import {utilsIpc} from '../../ipc/utils';
import {MainIpcApi} from './ipcWrapper';

export const mainIpcApi: MainIpcApi = {
  lynxIpc,
  senders: {sendToMain, sendToLinkPreview, sendToContextMenu},
  application: applicationIpc,
  browser: browserIpc,
  contextMenu: contextMenuIpc,
  dialogWindow: dialogsWindowIpc,
  downloadManager: downloadManagerIpc,
  files: filesIpc,
  git: gitIpc,
  pty: ptyIpc,
  shareScreen: shareScreenIpc,
  statics: staticsIpc,
  user: userIpc,
  utils: utilsIpc,
  storage: storageIpc,
  storageUtils: storageUtilsIpc,
};
