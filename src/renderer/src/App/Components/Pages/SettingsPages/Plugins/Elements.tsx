import {Button} from '@heroui/react';
import {Modal} from 'antd';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {PluginItem} from '../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {Download_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {pluginsActions, useIsUpdatingPlugin, usePluginsState} from '../../../../Redux/Reducer/PluginsReducer';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
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
  const updateAvailable = useSettingsState('pluginUpdateAvailableList');

  const selectedPlugin = usePluginsState('selectedPlugin');
  const isUpdating = useIsUpdatingPlugin(item.metadata.id);
  const updatingAll = usePluginsState('updatingAll');

  const update = useCallback(
    (id: string, title: string) => {
      AddBreadcrumb_Renderer(`Plugin update: id:${id}`);
      dispatch(pluginsActions.manageSet({key: 'updating', id: selectedPlugin?.metadata.id, operation: 'add'}));
      rendererIpc.plugins.updatePlugin(id).then(updated => {
        if (updated) {
          lynxTopToast(dispatch).success(`${title} updated Successfully`);
          ShowRestartModal('To apply the updates, please restart the app.');
        }
        dispatch(pluginsActions.manageSet({key: 'updating', id: selectedPlugin?.metadata.id, operation: 'remove'}));
      });
    },
    [selectedPlugin],
  );

  const updateItem = useMemo(
    () => updateAvailable.find(available => available.id === item.metadata.id),
    [updateAvailable, item],
  );

  const isUpdate = updateItem?.type === 'upgrade';

  const variant = isUpdating ? 'light' : 'flat';
  const color = isUpdate ? 'success' : 'warning';
  const text = isUpdating ? (isUpdate ? 'Updating...' : 'Downgrading...') : isUpdate ? 'Update' : 'Downgrade';
  const onPress = () => update(item.metadata.id, item.metadata.title);

  return updateItem ? (
    <Button
      size="sm"
      color={color}
      variant={variant}
      onPress={onPress}
      isLoading={isUpdating}
      isDisabled={updatingAll}
      startContent={!isUpdating && <Download_Icon />}>
      {text}
    </Button>
  ) : null;
}
