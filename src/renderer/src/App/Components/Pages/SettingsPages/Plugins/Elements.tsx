import {ButtonProps} from '@heroui/button';
import {Button} from '@heroui/react';
import {Modal} from 'antd';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {PluginItem} from '../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {Download_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {pluginsActions, useIsUpdatingPlugin, usePluginsState} from '../../../../Redux/Reducer/PluginsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {isLinuxPortable, lynxTopToast} from '../../../../Utils/UtilHooks';

export function ShowRestartModal(message: string) {
  const later = Modal.destroyAll;

  const restart = () => {
    Modal.destroyAll();
    rendererIpc.win.changeWinState('restart');
  };

  const close = () => {
    Modal.destroyAll();
    rendererIpc.win.changeWinState('close');
  };

  Modal.warning({
    title: 'Restart Required',
    content: message,
    footer: (
      <div className="mt-6 flex w-full flex-row justify-between">
        <Button size="sm" variant="flat" color="warning" onPress={later}>
          Restart Later
        </Button>
        <Button size="sm" color="success" onPress={isLinuxPortable ? close : restart}>
          {isLinuxPortable ? 'Exit Now' : 'Restart Now'}
        </Button>
      </div>
    ),
    centered: true,
    maskClosable: false,
    rootClassName: 'scrollbar-hide',
    styles: {mask: {top: '2.5rem'}},
    wrapClassName: 'mt-10',
  });
}

type UpdateButtonProps = {item: PluginItem};
export function UpdateButton({item}: UpdateButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const syncList = usePluginsState('syncList');

  const selectedPlugin = usePluginsState('selectedPlugin');
  const isUpdating = useIsUpdatingPlugin(item.metadata.id);
  const updatingAll = usePluginsState('updatingAll');

  const handleSync = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin sync: id:${item.metadata.id}`);
    dispatch(pluginsActions.manageSet({key: 'updating', id: selectedPlugin?.metadata.id, operation: 'add'}));
    rendererIpc.plugins.update(item.metadata.id).then(isUpdated => {
      if (isUpdated) {
        lynxTopToast(dispatch).success(`${item.metadata.title} synced Successfully`);
        ShowRestartModal('To apply the changes, please restart the app.');
      }
      dispatch(pluginsActions.removeUpdateItem({id: selectedPlugin?.metadata.id, isUpdated}));
    });
  }, [selectedPlugin, item]);

  const {updateItem, isUpdate, color} = useMemo(() => {
    const updateItem = syncList.find(available => available.id === item.metadata.id);
    const isUpdate = updateItem?.type === 'upgrade';
    const color: ButtonProps['color'] = isUpdate ? 'success' : 'warning';

    return {updateItem, isUpdate, color};
  }, [syncList, item]);

  const {variant, text} = useMemo(() => {
    const variant: ButtonProps['variant'] = isUpdating ? 'light' : 'flat';
    const text = isUpdating ? (isUpdate ? 'Updating...' : 'Downgrading...') : isUpdate ? 'Update' : 'Downgrade';

    return {variant, text};
  }, [isUpdating, isUpdate]);

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
