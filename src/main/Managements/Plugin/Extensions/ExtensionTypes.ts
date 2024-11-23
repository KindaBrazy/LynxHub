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
  listenForChannels: ApiFC;
  onAppReady: ApiFCPromise;
  onReadyToShow: ApiFC;
  trayMenu_AddItem: ApiFC_Tray;
};

export type MainExtensionUtils = {
  getStorageManager: () => Promise<StorageManager>;
  getAppManager: () => Promise<ElectronAppManager>;
  getDiscordRpcManager: () => Promise<DiscordRpcManager>;
  getModuleManager: () => Promise<ModuleManager>;
};

export type MainExtensions = {id: string};

export type ExtensionImport_Main = {
  initialExtension: (lynxApi: ExtensionMainApi, utils: MainExtensionUtils) => Promise<void>;
};
