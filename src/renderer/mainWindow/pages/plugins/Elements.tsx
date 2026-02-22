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

/**
 * Props for the UpdateButton component.
 */
interface UpdateButtonProps {
  /** The plugin item for which you want to display the update or downgrade buttons. */
  item: PluginItem;
}

/**
 * Button component that handles syncing a plugin to its remote codebase,
 * either by upgrading or downgrading. Provides UI feedback during the operation.
 */
export function UpdateButton({item}: UpdateButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const syncList = usePluginsState('syncList');
  const isUpdating = useIsUpdatingPlugin(item.metadata.id);
  const updatingAll = usePluginsState('updatingAll');

  const {id, title} = useMemo(() => item.metadata, [item]);

  const {updateItem, isUpgrade, color} = useMemo(() => {
    const updateTarget = syncList.find(available => available.id === id);
    const upgradeState = updateTarget?.type === 'upgrade';
    const buttonColor: ButtonProps['color'] = upgradeState ? 'success' : 'warning';

    return {updateItem: updateTarget, isUpgrade: upgradeState, color: buttonColor};
  }, [syncList, id]);

  const {variant, text} = useMemo(() => {
    const buttonVariant: ButtonProps['variant'] = isUpdating ? 'light' : 'flat';

    // Determine the button text based on update state
    const buttonText = isUpdating
      ? isUpgrade
        ? 'Upgrading...'
        : 'Downgrading...'
      : isUpgrade
        ? 'Upgrade'
        : 'Downgrade';

    return {variant: buttonVariant, text: buttonText};
  }, [isUpdating, isUpgrade]);

  const handleSync = useCallback(() => {
    if (!updateItem) return;

    AddBreadcrumb_Renderer(`Plugin sync: id:${id}`);
    dispatch(pluginsActions.manageSet({key: 'updating', id, operation: 'add'}));

    const {version, commit} = updateItem;

    pluginsIpc.sync(id, commit).then(isUpdated => {
      if (isUpdated) {
        lynxTopToast(dispatch).success(`${title} synced Successfully`);
        showRestartModal(dispatch, 'To apply the changes, please restart the app.');
        dispatch(pluginsActions.updateInstalledVersion({id, version}));
      }
      dispatch(pluginsActions.removeUpdateItem({id, isUpdated}));
    });
  }, [dispatch, id, title, updateItem]);

  if (!updateItem) {
    return null;
  }

  return (
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
  );
}
