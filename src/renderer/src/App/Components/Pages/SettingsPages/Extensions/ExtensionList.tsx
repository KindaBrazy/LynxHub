import {Button, Divider, Input, Progress, Skeleton} from '@heroui/react';
import {Empty, List} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {Circle_Icon, Refresh3_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {settingsActions, useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {searchInStrings} from '../../../../Utils/UtilFunctions';
import {lynxTopToast} from '../../../../Utils/UtilHooks';
import LynxScroll from '../../../Reusable/LynxScroll';
import {useFetchExtensions, useFilteredList, useFilterMenu, useRenderList, useSortedList} from './ExtensionList_Utils';
import {InstalledExt, useExtensionPageStore} from './ExtensionsPage';

export type ExtFilter = Set<'installed' | Extension_ListData['tag']> | 'all';

type Props = {
  selectedExt: Extension_ListData | undefined;
  setSelectedExt: Dispatch<SetStateAction<Extension_ListData | undefined>>;
  installed: InstalledExt[];
  unloaded: SkippedPlugins[];
};

export default function ExtensionList({selectedExt, setSelectedExt, installed, unloaded}: Props) {
  const updateAvailable = useSettingsState('extensionsUpdateAvailable');
  const [selectedFilters, setSelectedFilters] = useState<ExtFilter>('all');
  const [list, setList] = useState<Extension_ListData[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [updatingAll, setUpdatingAll] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const installedID = useMemo(() => installed.map(item => item.id), [installed]);

  const manageSet = useExtensionPageStore(state => state.manageSet);

  const {loading, refreshing} = useFetchExtensions(setList);

  const sortedList = useSortedList(list, installedID);
  const filteredList = useFilteredList(sortedList, selectedFilters, setSelectedExt, installedID);
  const searchList = useMemo(
    () =>
      sortedList.filter(item =>
        searchInStrings(searchValue, [item.title, item.description, item.url, item.tag, item.developer]),
      ),
    [sortedList, searchValue],
  );

  const resultList = useMemo(
    () => (isEmpty(searchValue) ? filteredList : searchList),
    [searchValue, filteredList, searchList],
  );

  const filterMenu = useFilterMenu(selectedFilters, setSelectedFilters);
  const renderList = useRenderList(selectedExt, setSelectedExt, loading, installed, unloaded);

  const emptyText = useMemo(() => {
    return (
      <Empty
        description={
          <div className="flex flex-col items-center justify-center text-center">
            {isEmpty(searchValue) ? (
              <>
                <p className="text-gray-300 mb-2">It looks like there are no extensions available right now.</p>
                <p className="text-gray-500">
                  This could be temporary. Please try again later or check your internet connection.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-2">We couldn&#39;t find any extensions matching your search.</p>
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
    manageSet('updating', updateAvailable, 'add');
    setUpdatingAll(true);
    rendererIpc.extension
      .updateAllExtensions()
      .then(() => {
        lynxTopToast(dispatch).success('Extensions updated successfully!');
        dispatch(settingsActions.setSettingsState({key: 'extensionsUpdateAvailable', value: []}));
      })
      .catch(() => lynxTopToast(dispatch).error('Failed to update extensions. Please try again later.'))
      .finally(() => {
        manageSet('updating', updateAvailable, 'remove');
        setUpdatingAll(false);
      });
  };

  return (
    <div
      className={
        'absolute inset-y-2 border border-foreground-100 shadow-small sm:w-[19rem] lg:w-[24rem] 2xl:w-[30rem]' +
        ' overflow-hidden shrink-0 transition-[width] duration-500 bg-white dark:bg-LynxRaisinBlack rounded-xl'
      }>
      {refreshing && <Progress size="sm" color="secondary" aria-label="Refreshing Item" isIndeterminate />}
      <div className="flex w-full flex-col p-4 gap-y-4 shadow-small">
        <div className="flex w-full justify-between flex-row items-center">
          <span className="font-semibold text-xl">Extensions</span>
          {!isEmpty(updateAvailable) && (
            <Button
              size="sm"
              color="success"
              onPress={updateAll}
              isLoading={updatingAll}
              startContent={!updatingAll && <Refresh3_Icon />}>
              {updatingAll ? 'Updating...' : `Update All (${updateAvailable.length})`}
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

      <LynxScroll className="inset-0 absolute !top-32 py-2 px-3">
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
        ) : (
          <List
            size="small"
            locale={{emptyText}}
            className="size-full"
            itemLayout="horizontal"
            dataSource={resultList}
            renderItem={item => renderList(item, updatingAll)}
          />
        )}
      </LynxScroll>
    </div>
  );
}
