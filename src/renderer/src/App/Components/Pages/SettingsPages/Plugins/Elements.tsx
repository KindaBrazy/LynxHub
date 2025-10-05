import {Button} from '@heroui/react';
import {Modal} from 'antd';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {PluginAvailableItem} from '../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {Download_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {isLinuxPortable, lynxTopToast} from '../../../../Utils/UtilHooks';
import {useExtensionPageStore} from './Page';

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

type UpdateButtonProps = {item: PluginAvailableItem; selectedItem: PluginAvailableItem | undefined};
export function UpdateButton({item, selectedItem}: UpdateButtonProps) {
  const updateAvailable = useSettingsState('pluginUpdateAvailableList');
  const updating = useExtensionPageStore(state => state.updating);
  const manageSet = useExtensionPageStore(state => state.manageSet);
  const dispatch = useDispatch<AppDispatch>();

  const updatingAll = useExtensionPageStore(state => state.updatingAll);

  const update = useCallback(
    (id: string, title: string) => {
      AddBreadcrumb_Renderer(`Extension update: id:${id}`);
      manageSet('updating', selectedItem?.metadata.id, 'add');
      rendererIpc.plugins.updatePlugin(id).then(updated => {
        if (updated) {
          lynxTopToast(dispatch).success(`${title} updated Successfully`);
          ShowRestartModal('To apply the updates to the extension, please restart the app.');
        }
        manageSet('updating', selectedItem?.metadata.id, 'remove');
      });
    },
    [selectedItem],
  );

  const isUpdating = updating.has(item.metadata.id);

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
