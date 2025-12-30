import StorageTypes from '../../../../cross/StorageTypes';
import rendererIpc from '../RendererIpc';

type AllStorageData = {
  [K in keyof StorageTypes]: StorageTypes[K];
};

let cachedStorage: AllStorageData | null = null;
let systemDarkMode: 'dark' | 'light' | null = null;

/**
 * Fetches all storage data in a single IPC call.
 * This should be called once at app startup before creating the Redux store.
 */
export const initializeStorage = async (): Promise<AllStorageData> => {
  const [storage, darkMode] = await Promise.all([rendererIpc.storage.getAll(), rendererIpc.win.getSystemDarkMode()]);

  cachedStorage = storage;
  systemDarkMode = darkMode;

  return storage;
};

/**
 * Gets the cached storage data. Returns null if not initialized.
 */
export const getStorageData = (): AllStorageData | null => {
  return cachedStorage;
};

/**
 * Gets the system dark mode preference.
 */
export const getSystemDarkMode = (): 'dark' | 'light' => {
  return systemDarkMode ?? 'dark';
};

/**
 * Checks if storage has been initialized.
 */
export const isStorageInitialized = (): boolean => {
  return cachedStorage !== null;
};
