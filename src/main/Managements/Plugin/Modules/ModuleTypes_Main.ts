import {MainIpcTypes} from '../../../../../module/src/types';

type StorageType = {get: (key: string) => any; set: (key: string, data: any) => void};

export type MainModuleUtils = {
  storage: StorageType;
  ipc: MainIpcTypes;
  pty: any;
  isPullAvailable: (dir: string) => Promise<boolean>;
  trashDir: (dir: string) => Promise<void>;
  removeDir: (dir: string) => Promise<void>;
  getInstallDir: (id: string) => string | undefined;
  getConfigDir: () => string | undefined;
  pullDir: (dir: string, showTaskbarProgress?: boolean) => Promise<void>;
};
