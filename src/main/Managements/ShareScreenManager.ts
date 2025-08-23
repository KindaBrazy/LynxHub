import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {BrowserWindow, desktopCapturer, session} from 'electron';

export default class ShareScreenManager {
  private selectorWindow?: BrowserWindow;
  private mainWindow?: BrowserWindow;

  public showSelector(mainWindow: BrowserWindow) {
    this.selectorWindow = new BrowserWindow({
      frame: false,
      show: true,
      width: 620,
      height: 480,
      resizable: false,
      maximizable: false,
      skipTaskbar: true,
      parent: mainWindow,
      // modal: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.cjs'),
        sandbox: false,
      },
    });
    this.mainWindow = mainWindow;

    const mainBounds = this.mainWindow.getBounds();
    const x = mainBounds.x + (mainBounds.width - 620) / 2;
    const y = mainBounds.y + 10;
    this.selectorWindow.setBounds({
      x: Math.floor(x),
      y: Math.floor(y),
      width: 620,
      height: 480,
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.selectorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/share_screen.html`);
    } else {
      this.selectorWindow.loadFile(path.join(__dirname, `../renderer/share_screen.html`));
    }
  }

  private listenForRequest() {
    session.defaultSession.setDisplayMediaRequestHandler(
      (_, callback) => {
        desktopCapturer.getSources({types: ['window']}).then(sources => {
          callback({video: sources[0], audio: 'loopback'});
        });
      },
      {useSystemPicker: true},
    );
  }
}
