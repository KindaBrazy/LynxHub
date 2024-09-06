import {Button} from '@nextui-org/react';
import {Avatar, Badge, Descriptions, List, message, Modal, Popconfirm, Spin, Tag, Typography} from 'antd';
import {capitalize, isEmpty} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {extractGitHubUrl} from '../../../../../../../../cross/CrossUtils';
import {useAppState} from '../../../../../Redux/App/AppReducer';
import {settingsActions, useSettingsState} from '../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useCachedImageUrl} from '../../../../../Utils/LocalStorage';

type Props = {item: ModulesInfo; updatingAll: boolean; removedModule: (id: string) => void};

/** Render installed modules with options to update or uninstall, etc. */
export default function RenderItem({item, updatingAll, removedModule}: Props) {
  const isDarkMode = useAppState('darkMode');
  const updatedModules = useSettingsState('updatedModules');
  const newModules = useSettingsState('newModules');
  const dispatch = useDispatch<AppDispatch>();

  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [uninstalling, setUninstalling] = useState<boolean>(false);
  const [spinningText, setSpinningText] = useState<string>('');

  const avatarSrc = useCachedImageUrl(`${item.title}_module_avatar`, item.logoUrl || '');

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
  }, [item.id]);

  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  const uninstall = useCallback(() => {
    setUninstalling(true);
    rendererIpc.module.uninstallModule(item.id).then(uninstalled => {
      setUninstalling(false);
      if (uninstalled) {
        message.success(`${item.title} has been successfully uninstalled.`);
        dispatch(settingsActions.removeUpdatedModule(item.id));
        dispatch(settingsActions.removeNewModule(item.id));
        removedModule(item.id);
      } else {
        message.error(`An error occurred while uninstalling ${item.title}!`);
      }
    });
  }, [item.id, item.title, dispatch]);

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
  }, [item.id, item.title]);

  const actions = useCallback(() => {
    const result = [
      <Popconfirm
        okType="danger"
        okText="Uninstall"
        cancelText="Cancel"
        onConfirm={uninstall}
        title="Are you sure you want to uninstall?"
        okButtonProps={{type: 'primary', className: 'cursor-default'}}
        cancelButtonProps={{type: 'primary', className: 'cursor-default'}}>
        <Button size="sm" color="danger" variant="light" isLoading={uninstalling} className="cursor-default">
          Uninstall
        </Button>
      </Popconfirm>,
    ];

    result.push(
      updateAvailable ? (
        <Button
          size="sm"
          variant="light"
          color="success"
          onPress={update}
          isLoading={updating}
          className="cursor-default">
          {!updating && 'Update'}
        </Button>
      ) : (
        <Button size="sm" variant="light" onPress={checkForUpdate} className="cursor-default">
          Check for Updates
        </Button>
      ),
    );

    return result;
  }, [updateAvailable]);

  const showInfo = useCallback(() => {
    Modal.info({
      content: (
        <div className="space-y-4">
          <span className="font-bold">{item.title}</span>
          <Descriptions column={1} size="small" layout="horizontal" bordered>
            <Descriptions.Item label="Version">{item.version}</Descriptions.Item>
            <Descriptions.Item label="Changes" className="whitespace-pre-line">
              <OverlayScrollbarsComponent
                options={{
                  overflow: {x: 'hidden', y: 'scroll'},
                  scrollbars: {
                    autoHide: 'scroll',
                    clickScroll: true,
                    theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
                  },
                }}
                className="max-h-32">
                {item.changeLog}
              </OverlayScrollbarsComponent>
            </Descriptions.Item>
            <Descriptions.Item label="Updated">{item.updateDate}</Descriptions.Item>
            <Descriptions.Item label="Published">{item.publishDate}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
      centered: true,
      maskClosable: true,
      okButtonProps: {className: 'cursor-default'},
      rootClassName: 'scrollbar-hide',
      styles: {mask: {top: '2.5rem'}},
      wrapClassName: 'mt-10',
    });
  }, [isDarkMode, item]);

  return (
    <>
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
            extra={
              <div className="flex h-full flex-col items-center justify-center space-y-1 px-1 text-foreground-500">
                <Typography.Text className="text-xs text-foreground-500">V{item.version}</Typography.Text>
                <Button
                  size="sm"
                  variant="light"
                  onPress={showInfo}
                  className="cursor-default dark:text-gray-300"
                  fullWidth>
                  Details
                </Button>
              </div>
            }
            key={item.title}
            actions={actions()}>
            <List.Item.Meta
              description={
                <Typography.Text ellipsis={{tooltip: true}} className="text-gray-500 dark:text-gray-400">
                  {item.description}
                </Typography.Text>
              }
              title={
                <div className="space-x-2">
                  <Typography.Link
                    onClick={() => {
                      window.open(item.repoUrl);
                    }}>
                    {item.title}
                  </Typography.Link>
                  <Tag bordered={false}>{capitalize(extractGitHubUrl(item.repoUrl).owner)}</Tag>
                </div>
              }
              avatar={item.logoUrl && <Avatar size={59} src={avatarSrc} />}
            />
          </List.Item>
        </Badge.Ribbon>
      </Spin>
    </>
  );
}
