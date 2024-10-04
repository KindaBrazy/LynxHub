import {Button} from '@nextui-org/react';
import {Avatar, Descriptions, List, message, Modal, Tag, Typography} from 'antd';
import {capitalize} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {useAppState} from '../../../../../Redux/App/AppReducer';
import {settingsActions} from '../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';

type Props = {
  item: ModulesInfo;
};

/** Render available modules to install. */
export default function RenderItem({item}: Props) {
  const isDarkMode = useAppState('darkMode');
  const [installing, setInstalling] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const install = useCallback(() => {
    setInstalling(true);
    rendererIpc.module.installModule(item.repoUrl).then(result => {
      setInstalling(false);
      if (result) {
        message.success(`${item.title} Installed successfully!`);
        dispatch(settingsActions.addNewModule(item.id));
      } else {
        message.error(`Something went wrong while installing ${item.title}.`);
      }
    });
  }, [item.repoUrl, item.title, item.id, dispatch]);

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
      <List.Item
        className={
          'mb-2 rounded-lg border-2 bg-gray-50 !px-2 transition duration-300 hover:bg-gray-200 ' +
          'border-transparent hover:border-white hover:shadow-lg dark:bg-black/15' +
          ' dark:hover:border-black dark:hover:bg-black/25'
        }
        extra={
          <div className="flex h-full flex-col items-center justify-center space-y-1 px-1 text-gray-500">
            <Button
              size="sm"
              variant="light"
              onPress={showInfo}
              className="cursor-default dark:text-gray-300"
              fullWidth>
              Info
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="success"
              onPress={install}
              isLoading={installing}
              isDisabled={installing}
              className="cursor-default">
              {!installing && 'Install'}
            </Button>
          </div>
        }
        key={item.title}>
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
              <Tag bordered={false}>{capitalize(extractGitUrl(item.repoUrl).owner)}</Tag>
              {item.owner && (
                <Tag color="green" bordered={false}>
                  Owner
                </Tag>
              )}
            </div>
          }
          avatar={item.logoUrl && <Avatar size={59} src={item.logoUrl} className="shadow-md" />}
        />
      </List.Item>
    </>
  );
}
