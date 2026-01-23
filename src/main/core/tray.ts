import os from 'node:os';

import {Menu, Tray} from 'electron';

import trayIconMenu from '../../../resources/16x16.png?asset';
import trayIcon from '../../../resources/icon.ico?asset';
import {APP_NAME, APP_NAME_VERSION} from '../../common/consts';
import {EMenuItem} from '../plugins/extensions/types';
import classHolder from './class_holder';

/** Manages the system tray icon and its context menu for the application. */
export default class TrayManager {
  private tray?: Tray;

  /** Closes the main application window. */
  private closeMainWindow = (): void => {
    const {storageManager, appManager} = classHolder;
    storageManager.updateLastSize();
    appManager?.getMainWindow()?.close();
  };

  /** Shows the main application window. */
  private showMainWindow = (): void => {
    const {appManager} = classHolder;
    appManager?.getMainWindow()?.show();
  };

  /** Creates and sets up the tray icon with its context menu. */
  public createTrayIcon(): void {
    if (this.tray) return;
    const {extensionManager} = classHolder;

    const icon = os.platform() === 'win32' ? trayIcon : trayIconMenu;

    this.tray = new Tray(icon);
    this.tray.setToolTip(APP_NAME);

    const staticItems: EMenuItem[] = [
      {enabled: false, icon: trayIconMenu, label: APP_NAME_VERSION},
      {type: 'separator'},
      {label: 'Show', type: 'normal', click: this.showMainWindow},
      {label: 'Quit', type: 'normal', click: this.closeMainWindow},
    ];

    const resultItems = extensionManager!.getTrayItems(staticItems);
    const contextMenu = Menu.buildFromTemplate(resultItems);

    this.tray.setContextMenu(contextMenu);
    this.tray.on('double-click', this.showMainWindow);
  }

  /** Destroys the tray icon, removing it from the system tray. */
  public destroyTrayIcon(): void {
    if (!this.tray) return;

    this.tray.destroy();
    this.tray = undefined;
  }
}
