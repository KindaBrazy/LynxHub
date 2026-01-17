import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {BrowserWindow, ipcMain} from 'electron';

import {toMs} from '../../cross/utils';
import classHolder from '../core/class_holder';

export default function DialogManager() {
  const {appManager} = classHolder;

  if (!appManager) {
    setTimeout(DialogManager, toMs(1, 'seconds'));
    return;
  }

  appManager.onCreateWindow(() => {
    const handleShowPrompt = (_event: any, arg: any) => {
      let promptResponse: string | null = null;

      const promptWindow: BrowserWindow = new BrowserWindow({
        width: 300,
        height: 150,
        parent: appManager.getMainWindow(),
        resizable: false,
        movable: true,
        alwaysOnTop: true,
        frame: false,
        modal: true,
        webPreferences: {
          preload: path.join(__dirname, '../preload/index.cjs'),
        },
      });

      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        promptWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/prompt_dialog.html`);
      } else {
        promptWindow.loadFile(path.join(__dirname, `../renderer/prompt_dialog.html`));
      }

      promptWindow.webContents.send('dlg-title', arg);

      promptWindow.on('hide', () => {
        _event.returnValue = promptResponse;
      });

      const handleDlgResult = (_e: any, value: any) => {
        promptResponse = value === '' ? null : value;
      };

      const handleDlgHide = () => {
        promptWindow?.hide();
      };

      ipcMain.on('dlg-result', handleDlgResult);
      ipcMain.on('dlg-hide', handleDlgHide);

      // Clean up listeners when dialog window is closed
      promptWindow.on('closed', () => {
        ipcMain.removeListener('show-prompt', handleShowPrompt);
        ipcMain.removeListener('dlg-result', handleDlgResult);
        ipcMain.removeListener('dlg-hide', handleDlgHide);
      });
    };

    ipcMain.on('show-prompt', handleShowPrompt);
  });
}
