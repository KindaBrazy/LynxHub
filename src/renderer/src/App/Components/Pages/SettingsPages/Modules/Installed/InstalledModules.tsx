import {Input} from '@nextui-org/react';
import {Empty, List, PaginationProps} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {Circle_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {useAppState} from '../../../../../Redux/App/AppReducer';
import rendererIpc from '../../../../../RendererIpc';
import {searchInStrings} from '../../../../../Utils/UtilFunctions';
import RenderItem from './RenderItem';

type Props = {
  setInstalledModules: Dispatch<SetStateAction<string[]>>;
  updatingAll: boolean;
};

/** List of installed modules */
export default function InstalledModules({setInstalledModules, updatingAll}: Props) {
  const [pageSize, setPageSize] = useState<number>(6);
  const [data, setData] = useState<ModulesInfo[]>([]);
  const [searchedData, setSearchedData] = useState<ModulesInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  const isDarkMode = useAppState('darkMode');

  useEffect(() => {
    setSearchedData(data.filter(module => searchInStrings(searchValue, [module.title, module.description])));
  }, [searchValue, data]);

  const removedModule = useCallback(
    (id: string) => {
      setData(prevState => prevState.filter(data => data.id !== id));
    },
    [setData],
  );

  useEffect(() => {
    rendererIpc.module.getInstalledModulesInfo().then(result => {
      setData(result);
      setInstalledModules(result.map(module => module.id));
    });
  }, []);

  const onShowSizeChange: PaginationProps['onShowSizeChange'] = (_, pageSize) => {
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
          startContent={<Circle_Icon className="size-5" />}
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
                description="No modules installed yet. Head to the download tab to get started!"
              />
            ),
          }}
          pagination={
            searchedData.length <= pageSize
              ? false
              : {
                  onShowSizeChange,
                  align: 'center',
                  pageSize: pageSize,
                  showTotal: total => `Installed modules: ${total}`,
                }
          }
          split={false}
          itemLayout="vertical"
          dataSource={searchedData}
          renderItem={item => <RenderItem item={item} updatingAll={updatingAll} removedModule={removedModule} />}
        />
      </OverlayScrollbarsComponent>
    </>
  );
}
