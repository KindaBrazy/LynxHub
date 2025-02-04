import {Button, Chip, Link} from '@heroui/react';
import {Avatar, Badge, List, message, Popconfirm, Spin} from 'antd';
import {capitalize, isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {Download_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {settingsActions, useSettingsState} from '../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useCachedImageUrl} from '../../../../../Utils/LocalStorage';
import ModuleInfo from '../ModuleInfo';

type Props = {item: ModulesInfo; updatingAll: boolean; removedModule: (id: string) => void};

/** Render installed modules with options to update or uninstall, etc. */
export default function RenderItem({item, updatingAll, removedModule}: Props) {
  const updatedModules = useSettingsState('updatedModules');
  const moduleUpdateAvailable = useSettingsState('moduleUpdateAvailable');
  const newModules = useSettingsState('newModules');
  const dispatch = useDispatch<AppDispatch>();

  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [uninstalling, setUninstalling] = useState<boolean>(false);
  const [spinningText, setSpinningText] = useState<string>('');

  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const avatarSrc = useCachedImageUrl(`${item.title}_module_avatar`, item.logoUrl || '');

  useEffect(() => {
    if (moduleUpdateAvailable.includes(item.title)) {
      setUpdateAvailable(true);
    }
  }, [moduleUpdateAvailable, item]);

  useEffect(() => {
    if (updatingAll) {
      setSpinningText('Checking and updating, please wait...');
    } else {
      setSpinningText('');
    }
  }, [updatingAll]);

  const checkForUpdate = useCallback(() => {
    setSpinningText('Checking for updates...');
    rendererIpc.module.isUpdateAvailable(item.id).then(result => {
      setUpdateAvailable(result);
      setSpinningText('');
    });
  }, [item]);

  const uninstall = useCallback(() => {
    setUninstalling(true);
    rendererIpc.module.uninstallModule(item.id).then(uninstalled => {
      setUninstalling(false);
      if (uninstalled) {
        message.success(`${item.title} has been successfully uninstalled.`);
        dispatch(settingsActions.removeUpdatedModule(item.id));
        dispatch(settingsActions.removeNewModule(item.id));
        dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value: false}));
        removedModule(item.id);
      } else {
        message.error(`An error occurred while uninstalling ${item.title}!`);
      }
    });
  }, [item, dispatch]);

  const update = useCallback(() => {
    setUpdating(true);
    setSpinningText('Updating module, please wait...');
    rendererIpc.module.updateModule(item.id).then(updated => {
      setUpdating(false);
      setSpinningText('');
      if (updated) {
        message.success(`${item.title} has been successfully updated!`);
        dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value: false}));
      } else {
        message.error(`An error occurred while updating ${item.title}.`);
      }
    });
  }, [item]);

  const actions = useCallback(() => {
    return [
      updateAvailable ? (
        <Button
          size="sm"
          variant="flat"
          color="success"
          onPress={update}
          isLoading={updating}
          startContent={<Download_Icon />}>
          {!updating && 'Update'}
        </Button>
      ) : (
        <Button size="sm" variant="light" onPress={checkForUpdate} className="cursor-default">
          Check for Updates
        </Button>
      ),
      <Button size="sm" key="changelog" variant="light" onPress={showInfo} className="cursor-default">
        ChangeLog
      </Button>,
      <Popconfirm
        okType="danger"
        okText="Uninstall"
        cancelText="Cancel"
        onConfirm={uninstall}
        key="uninstall_confirm"
        title="Are you sure you want to uninstall?"
        okButtonProps={{type: 'primary', className: 'cursor-default'}}
        cancelButtonProps={{type: 'primary', className: 'cursor-default'}}>
        <Button size="sm" color="danger" variant="light" isLoading={uninstalling} className="cursor-default">
          Uninstall
        </Button>
      </Popconfirm>,
    ];
  }, [updateAvailable]);

  const showInfo = useCallback(() => {
    setIsDetailsOpen(true);
  }, []);

  return (
    <>
      <ModuleInfo item={item} isOpen={isDetailsOpen} setIsOpen={setIsDetailsOpen} />
      <Spin tip={spinningText} spinning={!isEmpty(spinningText)}>
        <Badge.Ribbon
          className={
            `z-10 ${
              (newModules.includes(item.id) || updatedModules.includes(item.id)) && isEmpty(spinningText)
                ? 'opacity-100'
                : 'opacity-0'
            } ` + `transition duration-500`
          }
          placement="end"
          text={updatedModules.includes(item.id) ? 'Updated' : 'New'}
          color={updatedModules.includes(item.id) ? 'green' : 'cyan'}>
          <List.Item
            className={
              'mb-2 rounded-lg border-2 bg-gray-50 !px-2 transition duration-300 hover:bg-gray-200 ' +
              'border-transparent shadow-sm hover:border-white hover:shadow-lg dark:bg-black/15' +
              ' dark:hover:border-black dark:hover:bg-black/25'
            }
            key={item.title}
            actions={actions()}
            classNames={{actions: 'flex'}}>
            <List.Item.Meta
              title={
                <div className="gap-x-2 flex items-center">
                  <Link
                    onPress={() => {
                      window.open(item.repoUrl);
                    }}>
                    {item.title}
                  </Link>
                  <Chip size="sm" variant="flat">
                    V{item.version}
                  </Chip>
                  <Chip size="sm" variant="flat">
                    {capitalize(extractGitUrl(item.repoUrl).owner)}
                  </Chip>
                  {item.owner && (
                    <Chip size="sm" variant="flat" color="success">
                      Owner
                    </Chip>
                  )}
                </div>
              }
              className="!items-center"
              description={item.description}
              avatar={item.logoUrl && <Avatar size={59} src={avatarSrc} />}
            />
          </List.Item>
        </Badge.Ribbon>
      </Spin>
    </>
  );
}
