import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app, BrowserWindow, ipcMain} from 'electron';

import {toMs} from '../../cross/CrossUtils';
import getClassHolder from './ClassHolder';

export default function DialogManager() {
  const {appManager} = getClassHolder();

  if (!appManager) {
    setTimeout(DialogManager, toMs(1, 'seconds'));
    return;
  }

  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-attach-webview', (_e, webPreferences) => {
      webPreferences.preload = path.join(__dirname, '../preload/webview.cjs');
    });
  });

  appManager.onCreateWindow = () => {
    let promptResponse: string | null;

    const promptWindow: BrowserWindow = new BrowserWindow({
      width: 300,
      height: 150,
      show: false,
      parent: appManager?.getMainWindow(),
      resizable: false,
      movable: true,
      alwaysOnTop: true,
      frame: false,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/dialog.cjs'),
      },
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      promptWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/dialog.html`);
    } else {
      promptWindow.loadFile(path.join(__dirname, `../renderer/dialog.html`));
    }

    const handleShowPrompt = (_event: any, arg: any) => {
      promptResponse = null;

      promptWindow.show();
      promptWindow.webContents.send('dlg-title', arg);

      promptWindow.on('hide', () => {
        _event.returnValue = promptResponse;
      });
    };

    const handleDlgResult = (_e: any, value: any) => {
      promptResponse = value === '' ? null : value;
    };

    const handleDlgHide = () => {
      promptWindow.hide();
    };

    ipcMain.on('show-prompt', handleShowPrompt);
    ipcMain.on('dlg-result', handleDlgResult);
    ipcMain.on('dlg-hide', handleDlgHide);

    // Clean up listeners when dialog window is closed
    promptWindow.on('closed', () => {
      ipcMain.removeListener('show-prompt', handleShowPrompt);
      ipcMain.removeListener('dlg-result', handleDlgResult);
      ipcMain.removeListener('dlg-hide', handleDlgHide);
    });
  };
}
