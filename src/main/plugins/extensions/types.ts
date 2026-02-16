import MainWindowManager from '@lynx_main/mainWindow';
import StorageManager from '@lynx_main/storage/storageOperations';
import {Scope} from '@sentry/node';
import {MenuItem, MenuItemConstructorOptions} from 'electron';

import ModuleManager from '../modules';

export type EMenuItem = MenuItemConstructorOptions | MenuItem;

type TypeScriptFunctionComponent = () => void;
type TypeScriptFunctionComponentPromise = () => Promise<void>;
type TypeScriptFunctionComponent_Tray = () => {item: EMenuItem; index: number};
type ApiFunctionCallback = (fc: TypeScriptFunctionComponent) => void;
type ApiFunctionCallbackPromise = (fc: TypeScriptFunctionComponentPromise) => void;
type ApiFunctionCallback_Tray = (fc: TypeScriptFunctionComponent_Tray) => void;

export type ExtensionData_Main = {
  listenForChannels: TypeScriptFunctionComponent[];
  onAppReady: TypeScriptFunctionComponentPromise[];
  onReadyToShow: TypeScriptFunctionComponent[];
  trayMenu_AddItem: TypeScriptFunctionComponent_Tray[];
};

export type ExtensionMainApi = {
  /**
   * Listen for specific IPC channels using ipcMain.
   * This allows communication between the main process and renderer processes.
   */
  listenForChannels: ApiFunctionCallback;

  /**
   * Called when the application is ready.
   * This method is triggered after `app.whenReady()` resolves.
   */
  onAppReady: ApiFunctionCallbackPromise;

  /**
   * Called when the main application window is ready to be displayed.
   * Corresponds to the `ready-to-show` event.
   */
  onReadyToShow: ApiFunctionCallback;

  initNodeSentry: (dsn: string) => Scope;

  /** Add a new item to the tray menu at a specific index. */
  trayMenu_AddItem: ApiFunctionCallback_Tray;
};

export type MainExtensionUtils = {
  /**
   * Retrieves the `StorageManager` instance when it is ready.
   * @returns A promise that resolves to the `StorageManager`.
   */
  getStorageManager: () => Promise<StorageManager>;

  /**
   * Retrieves the `MainWindowManager` instance when it is ready.
   * @returns A promise that resolves to the `MainWindowManager`.
   */
  getAppManager: () => Promise<MainWindowManager>;

  /**
   * Retrieves the `ModuleManager` instance when it is ready.
   * @returns A promise that resolves to the `ModuleManager`.
   */
  getModuleManager: () => Promise<ModuleManager>;

  nodePty: any;
};

export type ExtensionImport_Main = {
  initialExtension: (lynxApi: ExtensionMainApi, utils: MainExtensionUtils) => Promise<void>;
};
