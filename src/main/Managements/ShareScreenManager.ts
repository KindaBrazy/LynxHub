import {platform} from 'node:os';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {
  BrowserWindow,
  desktopCapturer,
  DesktopCapturerSource,
  DisplayMediaRequestHandlerHandlerRequest,
  ipcMain,
  session,
  Streams,
} from 'electron';

import {screenShareChannels} from '../../cross/ScreenShareConsts';
import {ScreenShareSources, ScreenShareStart} from '../../cross/ScreenShareTypes';
import {appManager} from '../index';

export default class ShareScreenManager {
  private selectorWindow?: BrowserWindow;
  private mainWindow?: BrowserWindow;
  private availableSources: DesktopCapturerSource[] = [];

  public start() {
    this.requestHandler = this.requestHandler.bind(this);

    session.fromPartition('persist:lynxhub_browser').setDisplayMediaRequestHandler(this.requestHandler);
    session.defaultSession.setDisplayMediaRequestHandler(this.requestHandler);

    const mainWindow = appManager?.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) this.mainWindow = mainWindow;
  }

  private requestHandler(_: DisplayMediaRequestHandlerHandlerRequest, callback: (streams: Streams) => void) {
    this.showSelector();
    this.startShare(callback);
    this.getSources();
  }

  private onDone() {
    this.availableSources = [];
    this.selectorWindow?.close();
    this.selectorWindow?.on('closed', () => {
      this.selectorWindow = undefined;

      ipcMain.removeAllListeners(screenShareChannels.getScreenSources);
      ipcMain.removeAllListeners(screenShareChannels.getWindowSources);

      this.start();
    });
  }

  private startShare(callback: (streams: Streams) => void) {
    const handleStart = (_, data: ScreenShareStart) => {
      ipcMain.removeListener(screenShareChannels.cancel, handleCancel);

      const target = this.availableSources.find(
        item => (data.type === 'windows' ? item.id : item.display_id) === data.id,
      );

      if (target) {
        const mainFrame = this.mainWindow?.webContents.mainFrame;
        const audio = mainFrame || (platform() === 'win32' && data.shareAudio ? 'loopback' : undefined);
        callback({video: target, audio});
      } else {
        try {
          callback({});
        } catch (e) {
          console.log(e);
        }
      }

      this.onDone();
    };

    const handleCancel = () => {
      ipcMain.removeListener(screenShareChannels.startShare, handleStart);
      try {
        callback({});
      } catch (e) {
        console.log(e);
      }
      this.onDone();
    };

    ipcMain.once(screenShareChannels.startShare, handleStart);
    ipcMain.once(screenShareChannels.cancel, handleCancel);
  }

  private getSources() {
    const resolveSources = (sources: DesktopCapturerSource[], resolve: (result: ScreenShareSources[]) => void) => {
      const result: ScreenShareSources[] = sources.map(source => {
        const thumbnail = source.thumbnail ? source.thumbnail.toDataURL() : undefined;
        const icon = source.appIcon ? source.appIcon.toDataURL() : undefined;

        return {
          display_id: source.display_id,
          id: source.id,
          name: source.name,
          thumbnail,
          icon,
        };
      });
      this.availableSources.push(...sources);
      resolve(result);
    };

    ipcMain.handle(screenShareChannels.getScreenSources, () => {
      return new Promise((resolve, reject) => {
        desktopCapturer
          .getSources({types: ['screen'], fetchWindowIcons: true})
          .then(sources => resolveSources(sources, resolve))
          .catch(reject);
      });
    });
    ipcMain.handle(screenShareChannels.getWindowSources, () => {
      return new Promise((resolve, reject) => {
        desktopCapturer
          .getSources({types: ['window'], fetchWindowIcons: true})
          .then(sources => resolveSources(sources, resolve))
          .catch(reject);
      });
    });
  }

  private showSelector() {
    this.selectorWindow = new BrowserWindow({
      frame: false,
      show: false,
      width: 620,
      height: 480,
      resizable: false,
      maximizable: false,
      skipTaskbar: true,
      parent: this.mainWindow,
      // modal: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.cjs'),
        sandbox: false,
      },
    });

    this.selectorWindow.on('ready-to-show', () => {
      this.selectorWindow?.show();
    });

    if (this.mainWindow) {
      const mainBounds = this.mainWindow.getBounds();
      const x = mainBounds.x + (mainBounds.width - 620) / 2;
      const y = mainBounds.y + 10;
      this.selectorWindow.setBounds({
        x: Math.floor(x),
        y: Math.floor(y),
        width: 620,
        height: 480,
      });
    }

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.selectorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/share_screen.html`);
    } else {
      this.selectorWindow.loadFile(path.join(__dirname, `../renderer/share_screen.html`));
    }
  }
}
