import {topToast} from '@lynx/layouts/ToastProviders';
import {validateGitRepoUrl} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import gitIpc from '@lynx_shared/ipc/git';
import utilsIpc from '@lynx_shared/ipc/utils';
import {isEmpty} from 'lodash';
import {useCallback, useState} from 'react';

export type ExtensionData = {
  name: string;
  remoteUrl: string;
  size: string;
};

export type ExtensionStatus = {
  isUpdating: boolean;
  isDisabled: boolean;
  hasUpdate: boolean;
  isDeleting: boolean;
  resultDir?: string;
};

export const useInstalledExtensions = (dir: string) => {
  const [extensions, setExtensions] = useState<ExtensionData[]>([]);
  const [installedUrls, setInstalledUrls] = useState<string[]>([]);
  const [updatesAvailable, setUpdatesAvailable] = useState<string[]>([]);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [statusMap, setStatusMap] = useState<Map<string, ExtensionStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const getExtensions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await utilsIpc.getExtensionsDetails(dir);
      if (data === 'empty') {
        setExtensions([]);
        setInstalledUrls([]);
        setStatusMap(new Map());
      } else {
        setExtensions(data);
        setInstalledUrls(data.map(ext => validateGitRepoUrl(ext.remoteUrl)));

        // Initialize status map
        const initialMap = new Map<string, ExtensionStatus>();
        data.forEach(ext => {
          initialMap.set(ext.name, {
            isUpdating: false,
            isDisabled: false,
            hasUpdate: false,
            isDeleting: false,
          });
        });
        setStatusMap(initialMap);
      }
    } catch (error) {
      console.error('Failed to get extensions:', error);
      setExtensions([]);
    } finally {
      setIsLoading(false);
    }
  }, [dir]);

  const checkUpdates = useCallback(async () => {
    if (isEmpty(extensions)) return;

    try {
      const updateStatusList = await utilsIpc.getExtensionsUpdateStatus(dir);
      if (isEmpty(updateStatusList)) return;

      const newUpdatesAvailable: string[] = [];

      setStatusMap(prev => {
        const newMap = new Map(prev);
        updateStatusList.forEach(status => {
          const {updateAvailable, isDisabled, id} = status;
          if (updateAvailable) newUpdatesAvailable.push(id);

          const current = newMap.get(id) || {
            isUpdating: false,
            isDisabled: false,
            hasUpdate: false,
            isDeleting: false,
          };

          newMap.set(id, {
            ...current,
            hasUpdate: updateAvailable,
            isDisabled: isDisabled || false,
            resultDir: `${dir}/${id}`,
          });
        });
        return newMap;
      });

      setUpdatesAvailable(newUpdatesAvailable);
    } catch (error) {
      console.error('Failed to check updates:', error);
    }
  }, [dir, extensions]);

  const updateStatus = useCallback((name: string, status: Partial<ExtensionStatus>) => {
    setStatusMap(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(name) || {
        isUpdating: false,
        isDisabled: false,
        hasUpdate: false,
        isDeleting: false,
      };
      newMap.set(name, {...current, ...status});
      return newMap;
    });
  }, []);

  const deleteExtension = useCallback(
    async (name: string, type: 'removeDir' | 'trashDir') => {
      updateStatus(name, {isDeleting: true});
      try {
        await filesIpc[type](`${dir}/${name}`);
        const action = type === 'removeDir' ? 'removed' : 'moved to trash';
        topToast.success(`${name} extension ${action} successfully.`);

        setExtensions(prev => prev.filter(e => e.name !== name));
        setInstalledUrls(prev => {
          const ext = extensions.find(e => e.name === name);
          if (!ext) return prev;
          return prev.filter(url => url !== validateGitRepoUrl(ext.remoteUrl));
        });
        setStatusMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(name);
          return newMap;
        });
      } catch (error) {
        const action = type === 'removeDir' ? 'remove' : 'move to trash';
        topToast.danger(`Error: Unable to ${action} the folder.`);
        updateStatus(name, {isDeleting: false});
      }
    },
    [dir, extensions, updateStatus],
  );

  const disableExtension = useCallback(
    async (name: string, isDisabled: boolean, targetDir: string) => {
      // Optimistic update
      updateStatus(name, {isDisabled: !isDisabled});

      try {
        const resultDir = await utilsIpc.disableExtension(!isDisabled, targetDir);
        updateStatus(name, {isDisabled: !isDisabled, resultDir});
      } catch (error) {
        const action = isDisabled ? 'enabling' : 'disabling';
        topToast.danger(`Something went wrong when ${action} extension.`);
        // Revert on error
        updateStatus(name, {isDisabled: isDisabled});
      }
    },
    [updateStatus],
  );

  const updateExtension = useCallback(
    async (name: string) => {
      const extDir = `${dir}/${name}`;
      const pullId = `${name}_pull`;

      updateStatus(name, {isUpdating: true});

      return new Promise<void>((resolve, reject) => {
        const removeListener = gitIpc.onProgress((id, state) => {
          if (id !== pullId) return;

          if (state === 'Failed') {
            removeListener();
            topToast.danger(`Error: Unable to update ${name}.`);
            updateStatus(name, {isUpdating: false});
            reject(new Error(`Unable to update ${name}`));
          } else if (state === 'Completed') {
            removeListener();
            topToast.success(`${name} updated successfully!`);
            updateStatus(name, {isUpdating: false, hasUpdate: false});
            setUpdatesAvailable(prev => prev.filter(u => u !== name));
            resolve();
          }
        });

        gitIpc.pull(extDir, pullId);
      });
    },
    [dir, updateStatus],
  );

  const updateAll = useCallback(async () => {
    setIsUpdatingAll(true);
    await Promise.all(updatesAvailable.map(updateExtension));
    setIsUpdatingAll(false);
  }, [updatesAvailable, updateExtension]);

  return {
    extensions,
    installedUrls,
    updatesAvailable,
    isUpdatingAll,
    statusMap,
    isLoading,
    getExtensions,
    checkUpdates,
    deleteExtension,
    disableExtension,
    updateExtension,
    updateAll,
  };
};
