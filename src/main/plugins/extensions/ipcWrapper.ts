import type {applicationIpc} from '../../ipc/application';
import type {browserIpc} from '../../ipc/browser';
import type {contextMenuIpc} from '../../ipc/contextMenu';
import type {dialogsWindowIpc} from '../../ipc/dialogsWindow';
import type {downloadManagerIpc} from '../../ipc/downloadManager';
import type {filesIpc} from '../../ipc/filesIpc';
import type {gitIpc} from '../../ipc/gitIpc';
import type lynxIpc from '../../ipc/ipcWrapper';
import type {ptyIpc} from '../../ipc/pty';
import type {sendToContextMenu, sendToLinkPreview, sendToMain} from '../../ipc/sender';
import type {shareScreenIpc} from '../../ipc/shareScreen';
import type {staticsIpc} from '../../ipc/statics';
import type {storageIpc, storageUtilsIpc} from '../../ipc/storage';
import type {userIpc} from '../../ipc/user';
import type {utilsIpc} from '../../ipc/utils';

export type MainIpcApi = {
  senders: {
    sendToMain: typeof sendToMain;
    sendToLinkPreview: typeof sendToLinkPreview;
    sendToContextMenu: typeof sendToContextMenu;
  };
  lynxIpc: typeof lynxIpc;
  application: typeof applicationIpc;
  browser: typeof browserIpc;
  contextMenu: typeof contextMenuIpc;
  dialogWindow: typeof dialogsWindowIpc;
  downloadManager: typeof downloadManagerIpc;
  files: typeof filesIpc;
  git: typeof gitIpc;
  pty: typeof ptyIpc;
  shareScreen: typeof shareScreenIpc;
  statics: typeof staticsIpc;
  storage: typeof storageIpc;
  storageUtils: typeof storageUtilsIpc;
  user: typeof userIpc;
  utils: typeof utilsIpc;
};
