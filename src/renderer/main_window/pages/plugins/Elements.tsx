import {ButtonProps} from '@heroui/button';
import {Button} from '@heroui/react';
import {PluginItem} from '@lynx_cross/types/plugins';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {Download_Icon} from '../../../shared/assets/icons';
import AddBreadcrumb_Renderer from '../../../shared/sentry/Breadcrumbs';
import {lynxTopToast} from '../../hooks/utils';
import rendererIpc from '../../ipc';
import {pluginsActions, useIsUpdatingPlugin, usePluginsState} from '../../redux/reducers/plugins';
import {AppDispatch} from '../../redux/store';
import {showRestartModal} from '../../utils';

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

    rendererIpc.plugins.sync(id, commit).then(isUpdated => {
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
      startContent={!isUpdating && <Download_Icon />}>
      {text}
    </Button>
  ) : null;
}
