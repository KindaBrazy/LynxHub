import StorageManager from '../../Storage/StorageManager';

type TsFC = () => void;
type TsFCPromise = () => Promise<void>;
type ApiFC = (fc: TsFC) => void;
type ApiFCPromise = (fc: TsFCPromise) => void;

export type ExtensionData_Main = {listenForChannels: TsFC[]; onAppReady: TsFCPromise[]};

export type ExtensionMainApi = {listenForChannels: ApiFC; onAppReady: ApiFCPromise};

export type MainExtensionUtils = {storageManager: StorageManager};

export type MainExtensions = {id: string};

export type ExtensionImport_Main = {
  initialExtension: (lynxApi: ExtensionMainApi, utils: MainExtensionUtils) => Promise<void>;
};
