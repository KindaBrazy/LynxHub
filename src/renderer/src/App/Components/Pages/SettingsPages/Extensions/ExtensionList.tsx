import {Input, Skeleton} from '@heroui/react';
import {Empty, List} from 'antd';
import {isEmpty} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useMemo, useState} from 'react';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {Circle_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {useAppState} from '../../../../Redux/App/AppReducer';
import {searchInStrings} from '../../../../Utils/UtilFunctions';
import {useFetchExtensions, useFilteredList, useFilterMenu, useRenderList, useSortedList} from './ExtensionList_Utils';
import {InstalledExt} from './ExtensionsPage';

export type ExtFilter = Set<'installed' | Extension_ListData['tag']> | 'all';

type Props = {
  selectedExt: Extension_ListData | undefined;
  setSelectedExt: Dispatch<SetStateAction<Extension_ListData | undefined>>;
  installed: InstalledExt[];
  unloaded: SkippedPlugins[];
};

export default function ExtensionList({selectedExt, setSelectedExt, installed, unloaded}: Props) {
  const isDarkMode = useAppState('darkMode');

  const [selectedFilters, setSelectedFilters] = useState<ExtFilter>('all');
  const [list, setList] = useState<Extension_ListData[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  const installedID = useMemo(() => installed.map(item => item.id), [installed]);

  const {loading} = useFetchExtensions(setList);

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

  return (
    <div
      className={
        'absolute inset-y-2 rounded-lg border border-foreground/5 sm:w-64 lg:w-80 2xl:w-96' +
        ' overflow-hidden shrink-0 transition-[width] duration-500 bg-white dark:bg-LynxRaisinBlack'
      }>
      <Input
        type="search"
        variant="flat"
        value={searchValue}
        endContent={filterMenu()}
        onValueChange={setSearchValue}
        placeholder="Search for extensions..."
        classNames={{inputWrapper: 'rounded-none pr-0'}}
        startContent={<Circle_Icon className="size-5" />}
      />

      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'scroll',
            clickScroll: true,
            theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
          },
        }}
        className="inset-0 absolute !top-10">
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
            renderItem={renderList}
            itemLayout="horizontal"
            dataSource={resultList}
          />
        )}
      </OverlayScrollbarsComponent>
    </div>
  );
}
