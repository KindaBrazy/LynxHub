import {Avatar, Button, Chip} from '@heroui/react';
import {extractGitUrl} from '@lynx_common/utils';
import gitIpc from '@lynx_shared/ipc/git';
import {Star} from '@solar-icons/react-perf/Bold';
import {Home2} from '@solar-icons/react-perf/BoldDuotone';
import {capitalize} from 'lodash';
import {memo, useCallback, useState} from 'react';
import Highlighter from 'react-highlight-words';
import {useDispatch} from 'react-redux';

import {modalActions} from '../../../../../redux/reducers/modals';
import {useTabsState} from '../../../../../redux/reducers/tabs';
import {AppDispatch} from '../../../../../redux/store';
import {formatNumber} from '../../../../../utils';
import {lynxTopToast} from '../../../../../utils/hooks';
import {ExtensionsInfo} from '../types';

type Props = {
  item: ExtensionsInfo;
  updateTable: () => void;
  dir: string;
  searchValue: string;
};

/** Render available modules to install. */
const RenderItem = memo(({item, updateTable, dir, searchValue}: Props) => {
  const [installing, setInstalling] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  const {owner, repo, avatarUrl} = extractGitUrl(item.url);

  const install = useCallback(() => {
    setInstalling(true);
    gitIpc
      .cloneShallowPromise({
        url: item.url || '',
        directory: `${dir}/${repo || ''}`,
        singleBranch: true,
        depth: 1,
      })
      .then(() => {
        lynxTopToast(dispatch).success('Extension installed successfully.');
        updateTable();
      })
      .catch(() => {
        lynxTopToast(dispatch).error('Error installing extension');
      })
      .finally(() => {
        setInstalling(false);
      });
  }, [item.url, dir, repo, dispatch, updateTable]);

  const homePage = useCallback(() => {
    dispatch(modalActions.openReadme({url: item.url, title: item.title, tabID: activeTab}));
  }, [dispatch, item.url, item.title, activeTab]);

  return (
    <div
      className={
        'mb-2 flex w-full flex-row items-center justify-between rounded-lg border-2 bg-content2 px-4 py-3 ' +
        'border-transparent transition duration-300 hover:border-default-200 hover:bg-content3 hover:shadow-md'
      }>
      <div className="flex min-w-0 flex-1 flex-row items-center gap-4">
        <Avatar src={avatarUrl} size="lg" isBordered className="shrink-0" />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-large font-semibold hover:underline">
              <Highlighter
                className="inline-block"
                highlightTag="span"
                textToHighlight={item.title}
                highlightClassName="bg-warning/70 rounded-sm px-0.5"
                searchWords={searchValue.split(' ')}
                autoEscape={true}
              />
            </a>
            <Chip size="sm" variant="flat" color="default">
              {capitalize(owner)}
            </Chip>
            {item.stars && (
              <Chip
                size="sm"
                variant="flat"
                color="warning"
                startContent={<Star className={item.stars >= 1000 ? 'text-yellow-500' : 'text-yellow-600'} size={14} />}>
                {formatNumber(item.stars)}
              </Chip>
            )}
          </div>
          <div className="truncate text-small text-default-500">
            <Highlighter
              className="inline-block"
              highlightTag="span"
              highlightClassName="bg-warning/50 rounded-sm px-0.5"
              searchWords={searchValue.split(' ')}
              textToHighlight={item.description || ''}
              autoEscape={true}
            />
          </div>
        </div>
      </div>

      <div className="ml-4 flex shrink-0 flex-row items-center gap-2">
        <Button
          size="sm"
          variant="flat"
          color="success"
          onPress={install}
          isLoading={installing}
          isDisabled={installing}>
          {!installing && 'Install'}
        </Button>
        <Button size="sm" variant="light" onPress={homePage} isIconOnly>
          <Home2 className="size-5 text-default-500" />
        </Button>
      </div>
    </div>
  );
});

export default RenderItem;
