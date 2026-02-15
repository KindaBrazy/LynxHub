import {ButtonProps} from '@heroui/button';
import {Button} from '@heroui/react';
import {pluginsActions, useIsUpdatingPlugin, usePluginsState} from '@lynx/redux/reducers/plugins';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import {lynxTopToast} from '@lynx/utils/hooks';
import {PluginItem} from '@lynx_common/types/plugins';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

type UpdateButtonProps = {item: PluginItem};

export function UpdateButton({item}: UpdateButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const syncList = usePluginsState('syncList');
  const isUpdating = useIsUpdatingPlugin(item.metadata.id);
  const updatingAll = usePluginsState('updatingAll');

  const {id, title} = useMemo(() => item.metadata, [item]);

  const {updateItem, isUpgrade, color} = useMemo(() => {
    const updateItem = syncList.find(available => available.id === id);
    const isUpgrade = updateItem?.type === 'upgrade';
    const color: ButtonProps['color'] = isUpgrade ? 'success' : 'warning';

    return {updateItem, isUpgrade, color};
  }, [syncList, id]);

  const {variant, text} = useMemo(() => {
    const variant: ButtonProps['variant'] = isUpdating ? 'light' : 'flat';
    const text = isUpdating ? (isUpgrade ? 'Upgrading...' : 'Downgrading...') : isUpgrade ? 'Upgrade' : 'Downgrade';

    return {variant, text};
  }, [isUpdating, isUpgrade]);

  const handleSync = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin sync: id:${id}`);
    dispatch(pluginsActions.manageSet({key: 'updating', id, operation: 'add'}));
    const {version, commit} = updateItem!;

    pluginsIpc.sync(id, commit).then(isUpdated => {
      if (isUpdated) {
        lynxTopToast(dispatch).success(`${title} synced Successfully`);
        showRestartModal(dispatch, 'To apply the changes, please restart the app.');
        dispatch(pluginsActions.updateInstalledVersion({id, version}));
      }
      dispatch(pluginsActions.removeUpdateItem({id, isUpdated}));
    });
  }, [dispatch, id, title, updateItem]);

  return updateItem ? (
    <Button
      size="sm"
      color={color}
      variant={variant}
      onPress={handleSync}
      isLoading={isUpdating}
      isDisabled={updatingAll}
      startContent={!isUpdating && <DownloadMinimalistic />}>
      {text}
    </Button>
  ) : null;
}
