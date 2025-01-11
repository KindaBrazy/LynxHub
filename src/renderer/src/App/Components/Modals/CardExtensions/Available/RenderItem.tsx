import {Button} from '@nextui-org/react';
import {Avatar, List, message, Tag, Typography} from 'antd';
import {capitalize} from 'lodash';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {Star_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons3';
import {useModalsState} from '../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {formatNumber} from '../../../../Utils/UtilFunctions';
import {ExtensionsInfo} from './Available';

type Props = {
  item: ExtensionsInfo;
  updateTable: () => void;
};

/** Render available modules to install. */
export default function RenderItem({item, updateTable}: Props) {
  const [installing, setInstalling] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const {dir} = useModalsState('cardExtensions');

  const install = useCallback(() => {
    setInstalling(true);
    rendererIpc.git
      .cloneShallowPromise(`${item.url}` || '', `${dir}/${extractGitUrl(item.url).repo || ''}`, true, 1)
      .then(() => {
        message.success('Extension installed successfully.');
        updateTable();
      })
      .catch(() => {
        message.error('Error: Unable to clone the extension.');
      })
      .finally(() => {
        setInstalling(false);
      });
  }, [item.url, item.title, dispatch]);

  return (
    <>
      <List.Item
        className={
          'mb-2 h-20 rounded-lg border-2 bg-gray-50 !px-2 transition duration-300 hover:bg-gray-200 ' +
          'border-transparent hover:border-white hover:shadow-lg dark:bg-black/15' +
          ' dark:hover:border-black dark:hover:bg-black/25'
        }
        extra={
          <div className="flex h-full flex-col items-center justify-center space-y-1 px-1 text-gray-500">
            <Button variant="light" color="success" onPress={install} isLoading={installing} isDisabled={installing}>
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
            <div className="flex flex-row space-x-1">
              <Typography.Link
                onClick={() => {
                  window.open(item.url);
                }}
                className="mr-2">
                {item.title}
              </Typography.Link>
              <Tag bordered={false}>{capitalize(extractGitUrl(item.url).owner)}</Tag>
              {item.stars && (
                <Tag bordered={false} className="flex flex-row items-center justify-center gap-x-1">
                  <Star_Icon className={item.stars >= 1000 ? 'fill-yellow-400' : 'fill-yellow-200'} />
                  {formatNumber(item.stars)}
                </Tag>
              )}
            </div>
          }
          avatar={<Avatar size={54} src={`https://github.com/${extractGitUrl(item.url).owner}.png`} />}
        />
      </List.Item>
    </>
  );
}
