import {APP_NAME, APP_NAME_VERSION} from '@lynx_common/consts';
import {isWin} from '@lynx_common/utils';
import {ElectronMenuItem} from '@lynx_main/plugins/extensions/types';
import {Menu, nativeImage, Tray} from 'electron';

import trayIconMenu from '../../../resources/16x16.png?asset';
import trayIcon from '../../../resources/icon.ico?asset';
import classHolder from './classHolder';

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

    const icon = isWin ? trayIcon : trayIconMenu;

    this.tray = new Tray(icon);
    this.tray.setToolTip(APP_NAME);

    const staticItems: ElectronMenuItem[] = [
      {enabled: false, icon: nativeImage.createFromPath(trayIconMenu), label: APP_NAME_VERSION},
      {type: 'separator'},
      {label: 'Show', type: 'normal', click: this.showMainWindow},
      {label: 'Quit', type: 'normal', click: this.closeMainWindow},
    ];

    const resultItems = extensionManager?.getTrayItems(staticItems) ?? staticItems;
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
