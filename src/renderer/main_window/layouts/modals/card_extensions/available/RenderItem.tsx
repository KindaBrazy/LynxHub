import {Button} from '@heroui/react';
import {extractGitUrl} from '@lynx_cross/utils';
import {Avatar, List, Tag, Typography} from 'antd';
import {capitalize} from 'lodash';
import {useCallback, useState} from 'react';
import Highlighter from 'react-highlight-words';
import {useDispatch} from 'react-redux';

import {Home_Icon, Star_Icon} from '../../../../../shared/assets/icons';
import {lynxTopToast} from '../../../../hooks/utils';
import rendererIpc from '../../../../ipc';
import {modalActions} from '../../../../redux/reducers/modals';
import {useTabsState} from '../../../../redux/reducers/tabs';
import {AppDispatch} from '../../../../redux/store';
import {formatNumber} from '../../../../utils';
import {ExtensionsInfo} from './index';

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
      .cloneShallowPromise({
        url: item.url || '',
        directory: `${dir}/${extractGitUrl(item.url).repo || ''}`,
        singleBranch: true,
        depth: 1,
      })
      .then(() => {
        lynxTopToast(dispatch).success('Extension installed successfully.');
        updateTable();
      })
      .catch(() => {
        lynxTopToast(dispatch).error('Convert default export to named');
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
          'mb-2 h-20 rounded-lg border-2 bg-gray-50 px-2! transition duration-300 hover:bg-gray-200 ' +
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
              <Tag variant="filled">{capitalize(extractGitUrl(item.url).owner)}</Tag>
              {item.stars && (
                <Tag variant="filled" className="flex flex-row items-center justify-center gap-x-1">
                  <Star_Icon className={item.stars >= 1000 ? 'fill-yellow-400' : 'fill-yellow-200'} />
                  {formatNumber(item.stars)}
                </Tag>
              )}
            </div>
          }
          avatar={<Avatar size={54} src={extractGitUrl(item.url).avatarUrl} />}
        />
      </List.Item>
    </>
  );
}
