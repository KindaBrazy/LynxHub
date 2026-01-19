import {platform} from 'node:os';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {screenShareChannels} from '@lynx_cross/consts/ipc_channels/share_screen';
import {
  BrowserWindow,
  desktopCapturer,
  DesktopCapturerSource,
  DisplayMediaRequestHandlerHandlerRequest,
  ipcMain,
  session,
  Streams,
} from 'electron';

import {ScreenShareSources, ScreenShareStart} from '../../cross/types/share_screen';
import classHolder from '../core/class_holder';

export default class ShareScreenManager {
  private _selectorWindow?: BrowserWindow;
  private mainWindow?: BrowserWindow;
  private availableSources: DesktopCapturerSource[] = [];
  private handlersRegistered = false;

  public start() {
    const {appManager} = classHolder;
    this.requestHandler = this.requestHandler.bind(this);

    session.fromPartition('persist:lynxhub_browser').setDisplayMediaRequestHandler(this.requestHandler);
    session.defaultSession.setDisplayMediaRequestHandler(this.requestHandler);

    const mainWindow = appManager?.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      this.mainWindow = mainWindow;

      mainWindow.on('close', () => {
        this.mainWindow = undefined;
        this.availableSources = [];
        if (this._selectorWindow && !this._selectorWindow.isDestroyed()) {
          this._selectorWindow.close();
        }
      });
    }
  }

  private requestHandler(_: DisplayMediaRequestHandlerHandlerRequest, callback: (streams: Streams) => void) {
    this.showSelector();
    this.startShare(callback);
    this.getSources();
  }

  private onDone() {
    this.availableSources = [];
    this.handlersRegistered = false;
    this._selectorWindow?.close();
    this._selectorWindow?.on('closed', () => {
      this._selectorWindow = undefined;

      // Use removeHandler for channels registered with ipcMain.handle()
      ipcMain.removeHandler(screenShareChannels.getScreenSources);
      ipcMain.removeHandler(screenShareChannels.getWindowSources);
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
    // Prevent double-registration of handlers
    if (this.handlersRegistered) return;
    this.handlersRegistered = true;

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
          .getSources({types: ['screen'], fetchWindowIcons: true, thumbnailSize: {width: 400, height: 300}})
          .then(sources => resolveSources(sources, resolve))
          .catch(reject);
      });
    });
    ipcMain.handle(screenShareChannels.getWindowSources, () => {
      return new Promise((resolve, reject) => {
        desktopCapturer
          .getSources({types: ['window'], fetchWindowIcons: true, thumbnailSize: {width: 400, height: 300}})
          .then(sources => resolveSources(sources, resolve))
          .catch(reject);
      });
    });
  }

  private showSelector() {
    this._selectorWindow = new BrowserWindow({
      frame: false,
      show: false,
      width: 620,
      height: 480,
      resizable: false,
      maximizable: false,
      minimizable: false,
      titleBarStyle: process.platform === 'darwin' ? 'customButtonsOnHover' : 'default',
      skipTaskbar: true,
      parent: this.mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.cjs'),
        sandbox: false,
      },
    });

    this._selectorWindow.on('ready-to-show', () => {
      this._selectorWindow?.show();
    });

    if (this.mainWindow) {
      const mainBounds = this.mainWindow.getBounds();
      const x = mainBounds.x + (mainBounds.width - 620) / 2;
      const y = mainBounds.y + 10;
      this._selectorWindow.setBounds({
        x: Math.floor(x),
        y: Math.floor(y),
        width: 620,
        height: 480,
      });
    }

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this._selectorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/share_screen.html`);
    } else {
      this._selectorWindow.loadFile(path.join(__dirname, `../renderer/share_screen.html`));
    }
  }

  get selectorWindow(): BrowserWindow | undefined {
    return this._selectorWindow;
  }
}
