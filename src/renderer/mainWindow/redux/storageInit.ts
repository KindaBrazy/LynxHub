import AppStorageData from '@lynx_common/types/storage';
import applicationIpc from '@lynx_shared/ipc/application';
import storageIpc from '@lynx_shared/ipc/storage';

let cachedStorage: AppStorageData | null = null;
let systemDarkMode: 'dark' | 'light' | null = null;

/**
 * Fetches all storage data in a single IPC call.
 * This should be called once at app startup before creating the Redux store.
 */
export const initializeStorage = async (): Promise<AppStorageData> => {
  const [storage, darkMode] = await Promise.all([storageIpc.getAll(), applicationIpc.invoke.getSystemDarkMode()]);

  cachedStorage = storage;
  systemDarkMode = darkMode;

  return storage;
};

/**
 * Gets the cached storage data. Returns null if not initialized.
 */
export const getStorageData = (): AppStorageData | null => {
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
