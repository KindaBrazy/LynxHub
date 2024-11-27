import {MenuItem, MenuItemConstructorOptions} from 'electron';

import DiscordRpcManager from '../../DiscordRpcManager';
import ElectronAppManager from '../../ElectronAppManager';
import StorageManager from '../../Storage/StorageManager';
import ModuleManager from '../ModuleManager';

export type EMenuItem = MenuItemConstructorOptions | MenuItem;

type TsFC = () => void;
type TsFCPromise = () => Promise<void>;
type TsFC_Tray = () => {item: EMenuItem; index: number};
type ApiFC = (fc: TsFC) => void;
type ApiFCPromise = (fc: TsFCPromise) => void;
type ApiFC_Tray = (fc: TsFC_Tray) => void;

export type ExtensionData_Main = {
  listenForChannels: TsFC[];
  onAppReady: TsFCPromise[];
  onReadyToShow: TsFC[];
  trayMenu_AddItem: TsFC_Tray[];
};

export type ExtensionMainApi = {
  /**
   * Listen for specific IPC channels using ipcMain.
   * This allows communication between the main process and renderer processes.
   */
  listenForChannels: ApiFC;

  /**
   * Called when the application is ready.
   * This method is triggered after `app.whenReady()` resolves.
   */
  onAppReady: ApiFCPromise;

  /**
   * Called when the main application window is ready to be displayed.
   * Corresponds to the `ready-to-show` event.
   */
  onReadyToShow: ApiFC;

  /** Add a new item to the tray menu at a specific index. */
  trayMenu_AddItem: ApiFC_Tray;
};

export type MainExtensionUtils = {
  /**
   * Retrieves the `StorageManager` instance when it is ready.
   * @returns A promise that resolves to the `StorageManager`.
   */
  getStorageManager: () => Promise<StorageManager>;

  /**
   * Retrieves the `ElectronAppManager` instance when it is ready.
   * @returns A promise that resolves to the `ElectronAppManager`.
   */
  getAppManager: () => Promise<ElectronAppManager>;

  /**
   * Retrieves the `DiscordRpcManager` instance when it is ready.
   * @returns A promise that resolves to the `DiscordRpcManager`.
   */
  getDiscordRpcManager: () => Promise<DiscordRpcManager>;

  /**
   * Retrieves the `ModuleManager` instance when it is ready.
   * @returns A promise that resolves to the `ModuleManager`.
   */
  getModuleManager: () => Promise<ModuleManager>;
};

export type ExtensionImport_Main = {
  initialExtension: (lynxApi: ExtensionMainApi, utils: MainExtensionUtils) => Promise<void>;
};
