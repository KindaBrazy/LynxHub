import {BrowserWindow, Menu, Tray} from 'electron';

let tray: Tray | null = null;
let mainWindowRef: BrowserWindow | null = null;
let trayIcon: string = '';
let trayIconMenu: string = '';

export function TrayManagerInit(mainWindow: BrowserWindow, trayIconPath: string, trayIconMenuPath: string) {
  trayIcon = trayIconPath;
  trayIconMenu = trayIconMenuPath;
  mainWindowRef = mainWindow;
}

const QuitApp = () => {
  if (mainWindowRef) mainWindowRef.close();
};
const ShowApp = () => {
  if (mainWindowRef) mainWindowRef.show();
};

export function TrayManagerCreate(): void {
  if (!tray) {
    tray = new Tray(trayIcon);
    tray.setToolTip('AIOne Lynx');
    const contextMenu: Menu = Menu.buildFromTemplate([
      {label: 'AIOne Lynx v0.5.0', icon: trayIconMenu, enabled: false},
      {type: 'separator'},
      {label: 'Show', type: 'normal', click: ShowApp},
      {label: 'Quit', type: 'normal', click: QuitApp},
    ]);
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      ShowApp();
    });
  }
}

export function TrayManagerDestroy(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
