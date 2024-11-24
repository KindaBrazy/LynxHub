import {Input} from '@nextui-org/react';
import {Empty, List} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useState} from 'react';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../../../Redux/App/AppReducer';
import {useFetchExtensions, useFilteredList, useFilterMenu, useRenderList, useSortedList} from './ExtensionList_Utils';

export type ExtFilter = Set<'installed' | Extension_ListData['tag']> | 'all';

type Props = {
  selectedExt: Extension_ListData | undefined;
  setSelectedExt: Dispatch<SetStateAction<Extension_ListData | undefined>>;
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

export default function ExtensionList({selectedExt, setSelectedExt}: Props) {
  const isDarkMode = useAppState('darkMode');

  const [selectedFilters, setSelectedFilters] = useState<ExtFilter>('all');
  const [list, setList] = useState<Extension_ListData[]>([]);
  const [installed] = useState<string[]>(['debug_toolkit', 'code_snippets_manager']);

  const {loading} = useFetchExtensions(setList);

  const sortedList = useSortedList(list, installed);
  const filteredList = useFilteredList(sortedList, selectedFilters, setSelectedExt, installed);

  const filterMenu = useFilterMenu(selectedFilters, setSelectedFilters);
  const renderList = useRenderList(selectedExt, setSelectedExt, loading, installed);

  return (
    <div
      className={
        'absolute inset-y-2 rounded-lg border border-foreground/10 sm:w-64 lg:w-80 2xl:w-96' +
        ' overflow-hidden shrink-0 shadow-small bg-white dark:bg-foreground-100' +
        ' transition-[width] duration-500'
      }>
      <Input
        variant="flat"
        endContent={filterMenu()}
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
          dataSource={filteredList}
        />
      </OverlayScrollbarsComponent>
    </div>
  );
}
