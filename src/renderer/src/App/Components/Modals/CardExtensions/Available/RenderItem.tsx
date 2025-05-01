import {Button} from '@heroui/react';
import {Avatar, List, message, Tag, Typography} from 'antd';
import {capitalize} from 'lodash';
import {useCallback, useState} from 'react';
import Highlighter from 'react-highlight-words';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {Home_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {Star_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons3';
import {modalActions} from '../../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {formatNumber} from '../../../../Utils/UtilFunctions';
import {ExtensionsInfo} from './Available';

type Props = {
  item: ExtensionsInfo;
  updateTable: () => void;
  dir: string;
  searchValue: string;
};

/** Render available modules to install. */
export default function RenderItem({item, updateTable, dir, searchValue}: Props) {
  const [installing, setInstalling] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

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

  const homePage = () => {
    dispatch(modalActions.openReadme({url: item.url, title: item.title, tabID: activeTab}));
  };

  return (
    <>
      <List.Item
        className={
          'mb-2 h-20 rounded-lg border-2 bg-gray-50 !px-2 transition duration-300 hover:bg-gray-200 ' +
          'border-transparent hover:border-white hover:shadow-lg dark:bg-black/15' +
          ' dark:hover:border-black dark:hover:bg-black/25'
        }
        extra={
          <div className="flex h-full flex-row items-center justify-center gap-x-1 text-gray-500">
            <Button variant="light" color="success" onPress={install} isLoading={installing} isDisabled={installing}>
              {!installing && 'Install'}
            </Button>
            <Button size="sm" variant="light" onPress={homePage} isIconOnly>
              <Home_Icon />
            </Button>
          </div>
        }
        key={item.title}>
        <List.Item.Meta
          description={
            <Typography.Text ellipsis={{tooltip: true}} className="text-gray-500 dark:text-gray-400">
              <Highlighter
                className="flex"
                highlightTag="div"
                highlightClassName="bg-warning/50"
                searchWords={searchValue.split(' ')}
                textToHighlight={item.description || ''}
              />
            </Typography.Text>
          }
          title={
            <div className="flex flex-row space-x-1">
              <Typography.Link
                onClick={() => {
                  window.open(item.url);
                }}
                className="mr-2">
                <Highlighter
                  className="flex"
                  highlightTag="div"
                  textToHighlight={item.title}
                  highlightClassName="bg-warning/70"
                  searchWords={searchValue.split(' ')}
                />
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
