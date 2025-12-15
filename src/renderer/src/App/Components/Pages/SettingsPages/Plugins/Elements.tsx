import {ButtonProps} from '@heroui/button';
import {Button} from '@heroui/react';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {PluginItem} from '../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {Download_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {pluginsActions, useIsUpdatingPlugin, usePluginsState} from '../../../../Redux/Reducer/PluginsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {showRestartModal} from '../../../../Utils/RestartModalUtils';
import {lynxTopToast} from '../../../../Utils/UtilHooks';

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
