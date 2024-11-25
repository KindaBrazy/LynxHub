import {Input} from '@nextui-org/react';
import {Empty, List} from 'antd';
import {isEmpty} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useMemo, useState} from 'react';

import {Extension_ListData, ExtensionsInfo} from '../../../../../../../cross/CrossTypes';
import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../../../Redux/App/AppReducer';
import {searchInStrings} from '../../../../Utils/UtilFunctions';
import {useFetchExtensions, useFilteredList, useFilterMenu, useRenderList, useSortedList} from './ExtensionList_Utils';

export type ExtFilter = Set<'installed' | Extension_ListData['tag']> | 'all';

type Props = {
  selectedExt: Extension_ListData | undefined;
  setSelectedExt: Dispatch<SetStateAction<Extension_ListData | undefined>>;
  installed: ExtensionsInfo[];
};

const emptyText = (
  <Empty
    description={
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-gray-500 mb-2">Currently, no extensions are available.</p>
        <p className="text-gray-400">Please check back later for updates!</p>
      </div>
    }
    image={Empty.PRESENTED_IMAGE_SIMPLE}
  />
);

export default function ExtensionList({selectedExt, setSelectedExt, installed}: Props) {
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
  const renderList = useRenderList(selectedExt, setSelectedExt, loading, installedID);

  return (
    <div
      className={
        'absolute inset-y-2 rounded-lg border border-foreground/10 sm:w-64 lg:w-80 2xl:w-96' +
        ' overflow-hidden shrink-0 shadow-small bg-white dark:bg-foreground-100' +
        ' transition-[width] duration-500'
      }>
      <Input
        type="search"
        variant="flat"
        value={searchValue}
        endContent={filterMenu()}
        onValueChange={setSearchValue}
        placeholder="Search for extensions..."
        startContent={getIconByName('Circle', {className: 'size-5'})}
        classNames={{inputWrapper: 'bg-foreground-200 rounded-none pr-0'}}
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
        <List
          size="small"
          locale={{emptyText}}
          className="size-full"
          renderItem={renderList}
          itemLayout="horizontal"
          dataSource={resultList}
        />
      </OverlayScrollbarsComponent>
    </div>
  );
}
