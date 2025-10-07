import {Button, Divider, Input, Progress, Skeleton} from '@heroui/react';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {PluginFilter, PluginItem} from '../../../../../../../../cross/plugin/PluginTypes';
import {Circle_Icon, RefreshDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {pluginsActions, usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {searchInStrings} from '../../../../../Utils/UtilFunctions';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import LynxScroll from '../../../../Reusable/LynxScroll';
import {List_Item} from './List_Item';
import {useFetchExtensions, useFilteredList, useFilterMenu, useSortedList} from './List_Utils';

export default function List() {
  const syncList = usePluginsState('syncList');
  const [selectedFilters, setSelectedFilters] = useState<PluginFilter>('all');
  const [list, setList] = useState<PluginItem[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  const updatingAll = usePluginsState('updatingAll');
  const installed = usePluginsState('installed');

  const installedID = useMemo(() => installed.map(item => item.metadata.id), [installed]);

  const {loading, refreshing} = useFetchExtensions(setList);

  const sortedList = useSortedList(list, installedID);
  const filteredList = useFilteredList(sortedList, selectedFilters, installedID);
  const searchList = useMemo(
    () =>
      sortedList.filter(item =>
        searchInStrings(searchValue, [item.metadata.title, item.metadata.description, item.url]),
      ),
    [sortedList, searchValue],
  );

  const resultList = useMemo(
    () => (isEmpty(searchValue) ? filteredList : searchList),
    [searchValue, filteredList, searchList],
  );

  const filterMenu = useFilterMenu(selectedFilters, setSelectedFilters);

  const emptyText = useMemo(() => {
    return (
      <Empty
        description={
          <div className="flex flex-col items-center justify-center text-center">
            {isEmpty(searchValue) ? (
              <>
                <p className="text-gray-300 mb-2">It looks like there are no plugin available right now.</p>
                <p className="text-gray-500">
                  This could be temporary. Please try again later or check your internet connection.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-2">We couldn't find any extensions matching your search.</p>
                <p className="text-gray-500">Try refining your search terms or checking for typos.</p>
              </>
            )}
          </div>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }, [searchValue]);

  const updateAll = () => {
    dispatch(pluginsActions.manageSet({key: 'updating', id: syncList.map(item => item.id), operation: 'add'}));
    dispatch(pluginsActions.setUpdatingAll(true));
    rendererIpc.plugins
      .syncAll()
      .then(() => {
        lynxTopToast(dispatch).success('Extensions updated successfully!');
      })
      .catch(() => lynxTopToast(dispatch).error('Failed to update extensions. Please try again later.'))
      .finally(() => {
        dispatch(pluginsActions.manageSet({key: 'updating', id: syncList.map(item => item.id), operation: 'remove'}));
        dispatch(pluginsActions.setUpdatingAll(true));
      });
  };

  return (
    <div
      className={
        'absolute inset-y-2 border border-foreground-100 shadow-small sm:w-[19rem] lg:w-[24rem] 2xl:w-[30rem]' +
        ' overflow-hidden shrink-0 transition-[width] duration-500 bg-white dark:bg-LynxRaisinBlack rounded-xl' +
        ' flex flex-col'
      }>
      {refreshing && <Progress size="sm" color="secondary" aria-label="Refreshing Item" isIndeterminate />}
      <div className="flex w-full flex-col p-4 gap-y-4 shadow-small">
        <div className="flex w-full justify-between flex-row items-center">
          <span className="font-semibold text-xl">Extensions</span>
          {!isEmpty(syncList) && (
            <Button
              size="sm"
              color="success"
              onPress={updateAll}
              isLoading={updatingAll}
              startContent={!updatingAll && <RefreshDuo_Icon />}>
              {updatingAll ? 'Syncing...' : `Sync All (${syncList.length})`}
            </Button>
          )}
        </div>
        <div className="flex flex-row items-center gap-x-2">
          <Input
            type="search"
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search extensions..."
            startContent={<Circle_Icon className="size-4" />}
          />
          {filterMenu()}
        </div>
      </div>

      <Divider />

      <LynxScroll className="pt-2 px-3 size-full space-y-2">
        {loading ? (
          <div className="flex flex-col">
            {Array(3)
              .fill(null)
              .map((_, index) => {
                return (
                  <div key={index} className="w-full h-36 p-2 space-y-1">
                    <Skeleton className="w-full h-10 rounded-lg" />
                    <Skeleton className="w-full h-20 rounded-xl" />
                  </div>
                );
              })}
          </div>
        ) : isEmpty(resultList) ? (
          emptyText
        ) : (
          <div className="flex flex-col gap-y-2 pb-4">
            {resultList.map(item => (
              <List_Item item={item} installed={installed} key={`${item.metadata.id}_list_item`} />
            ))}
          </div>
        )}
      </LynxScroll>
    </div>
  );
}
