import os from 'node:os';

import {Menu, Tray} from 'electron';

import {APP_NAME, APP_NAME_VERSION} from '../../cross/CrossConstants';
import {appManager, extensionManager} from '../index';
import {EMenuItem} from './Plugin/Extensions/ExtensionTypes';

/** Manages the system tray icon and its context menu for the application. */
export default class TrayManager {
  //#region Private Properties

  private tray?: Tray;
  private readonly trayIcon: string;
  private readonly trayIconMenu: string;
  //#endregion

  //#region Constructor

  /**
   * Creates a new TrayManager instance.
   * @param trayIcon - Path to the tray icon image.
   * @param trayIconMenu - Path to the icon used in the context menu.
   */
  constructor(trayIcon: string, trayIconMenu: string) {
    this.trayIcon = trayIcon;
    this.trayIconMenu = trayIconMenu;
  }

  //#endregion

  //#region Private Methods

  /** Closes the main application window. */
  private closeMainWindow = (): void => {
    appManager.getMainWindow()?.close();
  };

  /** Shows the main application window. */
  private showMainWindow = (): void => {
    appManager.getMainWindow()?.show();
  };
  //#endregion

  //#region Public Methods

  /** Creates and sets up the tray icon with its context menu. */
  public createTrayIcon(): void {
    if (this.tray) return;

    const icon = os.platform() === 'win32' ? this.trayIcon : this.trayIconMenu;

    this.tray = new Tray(icon);
    this.tray.setToolTip(APP_NAME);

    const staticItems: EMenuItem[] = [
      {enabled: false, icon: this.trayIconMenu, label: APP_NAME_VERSION},
      {type: 'separator'},
      {label: 'Show', type: 'normal', click: this.showMainWindow},
      {label: 'Quit', type: 'normal', click: this.closeMainWindow},
    ];

    const resultItems = extensionManager.getTrayItems(staticItems);
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

  //#endregion
}
