import {useOverlayState} from '@heroui/react';
import {
  pluginsActions,
  useIsInstallingPlugin,
  useIsUninstallingPlugin,
  usePluginsState,
} from '@lynx/redux/reducers/plugins';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import {PluginInstalledItem, PluginItem} from '@lynx_common/types/plugins';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {MouseEvent, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {topToast} from '../../../layouts/ToastProviders';

export function usePluginItemState(item: PluginItem, installed: PluginInstalledItem[]) {
  const dispatch = useDispatch<AppDispatch>();

  const selectedPlugin = usePluginsState('selectedPlugin');
  const skipped = usePluginsState('unloadedList');
  const syncList = usePluginsState('syncList');

  const isInstalling = useIsInstallingPlugin(item.metadata.id);
  const isUnInstalling = useIsUninstallingPlugin(item.metadata.id);

  const configModal = useOverlayState();

  const isSelected = useMemo(
    () => selectedPlugin?.metadata.id === item.metadata.id,
    [selectedPlugin, item.metadata.id],
  );

  const {isExtension, foundInstalled, foundUnloaded, win32, darwin, linux, isCompatible} = useMemo(() => {
    const isExt = item.metadata.type === 'extension';
    const isCompatible = item.isCompatible;

    const installedPlugin = installed.find(i => i.id === item.metadata.id);
    const unloadedPlugin = skipped.find(u => installedPlugin?.id === u.id);

    const hasLinux = item.versions.some(v => v.platforms.includes('linux'));
    const hasWin32 = item.versions.some(v => v.platforms.includes('win32'));
    const hasDarwin = item.versions.some(v => v.platforms.includes('darwin'));

    return {
      isExtension: isExt,
      foundInstalled: installedPlugin,
      foundUnloaded: unloadedPlugin,
      linux: hasLinux,
      win32: hasWin32,
      darwin: hasDarwin,
      isCompatible,
    };
  }, [item, installed, skipped]);

  const currentVersion = useMemo(() => {
    const targetInstallVersion = item.versions.find(versionItem => versionItem.isCompatible);

    if (foundInstalled) {
      return foundInstalled.version;
    }
    if (targetInstallVersion) {
      return targetInstallVersion.version;
    }

    return 'N/A';
  }, [item.versions, foundInstalled]);

  const {targetUpdate, targetVersion, isUpgrade} = useMemo(() => {
    const updateTarget = syncList.find(update => update.id === item.metadata.id);
    const upgradeState = updateTarget?.type === 'upgrade';
    const tgtVersion = updateTarget?.version;

    return {
      targetUpdate: updateTarget,
      isUpgrade: upgradeState,
      targetVersion: tgtVersion,
    };
  }, [syncList, item.metadata.id]);

  const handleUninstall = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation();
      pluginsIpc.uninstall(item.metadata.id).then(result => {
        if (result) {
          topToast.success(`${item.metadata.title} uninstalled successfully`);
          showRestartModal(dispatch, 'To complete the uninstallation, please restart the app.');
          dispatch(pluginsActions.removeInstalled(item.metadata.id));
        }
      });
    },
    [item, dispatch],
  );

  const handleSelect = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin Select: id:${item.metadata.id}`);
    dispatch(pluginsActions.setSelectedPlugin(item));
  }, [dispatch, item]);

  return {
    isInstalling,
    isUnInstalling,
    configModal,
    isSelected,
    isExtension,
    foundInstalled,
    foundUnloaded,
    linux,
    win32,
    darwin,
    isCompatible,
    currentVersion,
    targetUpdate,
    targetVersion,
    isUpgrade,
    handleUninstall,
    handleSelect,
  };
}
