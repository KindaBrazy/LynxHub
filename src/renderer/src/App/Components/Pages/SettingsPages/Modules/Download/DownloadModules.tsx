import {Input} from '@nextui-org/react';
import {Empty, List, PaginationProps} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useEffect, useState} from 'react';

import {MODULE_CONTAINER} from '../../../../../../../../cross/CrossConstants';
import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../../../../Redux/App/AppReducer';
import {searchInStrings} from '../../../../../Utils/UtilFunctions';
import RenderItem from './RenderItem';

type Props = {
  installedModules: string[];
};

/** Fetch and display the list of available modules for installing */
export default function DownloadModules({installedModules}: Props) {
  const [pageSize, setPageSize] = useState<number>(6);
  const [data, setData] = useState<ModulesInfo[]>([]);
  const [searchedData, setSearchedData] = useState<ModulesInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const isDarkMode = useAppState('darkMode');

  useEffect(() => {
    setSearchedData(data.filter(module => searchInStrings(searchValue, [module.title, module.description])));
  }, [searchValue, data]);

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch(MODULE_CONTAINER);
        const modules = (await response.json()) as ModulesInfo[];
        setData(modules.filter(module => !installedModules.includes(module.id)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchModules();
  }, []);

  const onPageSizeChange: PaginationProps['onShowSizeChange'] = (_, pageSize) => {
    setPageSize(pageSize);
  };

  return (
    <>
      <div className="flex w-full justify-center p-2">
        <Input
          classNames={{
            inputWrapper: 'dark:bg-black/20 dark:hover:bg-white/5 bg-stone-50 shadow-md overflow-hidden',
          }}
          radius="md"
          type="search"
          spellCheck={false}
          className="w-full"
          value={searchValue}
          onValueChange={setSearchValue}
          placeholder="Type to find modules..."
          startContent={getIconByName('Circle', {className: 'size-5'})}
        />
      </div>
      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'scroll',
            clickScroll: true,
            theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
          },
        }}
        className="my-1.5 size-full p-4">
        <List
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Sorry, there are no modules available to download at the moment. Please check back later!"
              />
            ),
          }}
          pagination={
            searchedData.length <= pageSize
              ? false
              : {
                  onShowSizeChange: onPageSizeChange,
                  align: 'center',
                  pageSize: pageSize,
                  showTotal: total => `Installed modules: ${total}`,
                }
          }
          split={false}
          loading={isLoading}
          itemLayout="vertical"
          dataSource={searchedData}
          renderItem={item => <RenderItem item={item} />}
        />
      </OverlayScrollbarsComponent>
    </>
  );
}