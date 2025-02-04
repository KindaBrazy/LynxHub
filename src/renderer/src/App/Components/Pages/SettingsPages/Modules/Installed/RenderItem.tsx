import {Button, ButtonGroup, Chip, Link, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {Avatar, Badge, List, message, Spin} from 'antd';
import {capitalize, isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {Download_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {HomeSmile_Icon, Info_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {Refresh3_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
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
  const [isUninstallConfirmOpen, setIsUninstallConfirmOpen] = useState<boolean>(false);

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
    setIsUninstallConfirmOpen(false);
    rendererIpc.module.uninstallModule(item.id).then(uninstalled => {
      setUninstalling(false);
      if (uninstalled) {
        message.success(`${item.title} has been successfully uninstalled.`);
        dispatch(settingsActions.removeUpdatedModule(item.id));
        dispatch(settingsActions.removeNewModule(item.id));
        dispatch(
          settingsActions.setSettingsState({
            key: 'moduleUpdateAvailable',
            value: moduleUpdateAvailable.filter(m => m !== item.title),
          }),
        );
        removedModule(item.id);
      } else {
        message.error(`An error occurred while uninstalling ${item.title}!`);
      }
    });
  }, [item, moduleUpdateAvailable, dispatch]);

  const update = useCallback(() => {
    setUpdating(true);
    setSpinningText('Updating module, please wait...');
    rendererIpc.module.updateModule(item.id).then(updated => {
      setUpdating(false);
      setSpinningText('');
      if (updated) {
        message.success(`${item.title} has been successfully updated!`);
        dispatch(
          settingsActions.setSettingsState({
            key: 'moduleUpdateAvailable',
            value: moduleUpdateAvailable.filter(m => m !== item.title),
          }),
        );
      } else {
        message.error(`An error occurred while updating ${item.title}.`);
      }
    });
  }, [item, moduleUpdateAvailable]);

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
        <Button
          size="sm"
          variant="light"
          onPress={checkForUpdate}
          className="cursor-default"
          startContent={<Refresh3_Icon />}>
          Check for Updates
        </Button>
      ),
      <Button
        size="sm"
        key="changelog"
        variant="light"
        onPress={showInfo}
        className="cursor-default"
        startContent={<Info_Icon />}>
        ChangeLog
      </Button>,
      <Popover
        className="max-w-64"
        key="uninstall-confirm"
        isOpen={isUninstallConfirmOpen}
        onOpenChange={setIsUninstallConfirmOpen}
        showArrow>
        <PopoverTrigger>
          <Button
            size="sm"
            color="danger"
            variant="light"
            isLoading={uninstalling}
            className="cursor-default"
            startContent={<Trash_Icon />}>
            Uninstall
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-3">
          <span className="font-semibold">
            Are you sure you want to <span className="font-bold">Uninstall {item.title}</span>?
          </span>
          <ButtonGroup fullWidth>
            <Button size="sm" variant="flat" color="danger" onPress={uninstall}>
              Yes
            </Button>
            <Button
              size="sm"
              variant="flat"
              className="cursor-default"
              onPress={() => setIsUninstallConfirmOpen(false)}>
              No
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>,
    ];
  }, [updateAvailable, isUninstallConfirmOpen]);

  const showInfo = useCallback(() => {
    setIsDetailsOpen(true);
  }, []);

  const openHomePage = useCallback(() => {
    dispatch(modalActions.openReadme({url: item.repoUrl, title: item.title}));
  }, [dispatch, item]);

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
          placement="start"
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
                <div className="flex items-center justify-between">
                  <div className="gap-x-2 flex">
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
                  <div>
                    <Button size="sm" variant="light" className="z-20" onPress={openHomePage} isIconOnly>
                      <HomeSmile_Icon className="size-3.5" />
                    </Button>
                  </div>
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
