import {Input} from '@heroui/react';
import {Empty, List, PaginationProps} from 'antd';
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {SkippedPlugins} from '../../../../../../../../cross/IpcChannelAndTypes';
import {Circle_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../../RendererIpc';
import {searchInStrings} from '../../../../../Utils/UtilFunctions';
import LynxScroll from '../../../../Reusable/LynxScroll';
import RenderItem from './RenderItem';

type Props = {
  setInstalledModules: Dispatch<SetStateAction<string[]>>;
  updatingAll: boolean;
};

/** List of installed modules */
export default function InstalledModules({setInstalledModules, updatingAll}: Props) {
  const [pageSize, setPageSize] = useState<number>(6);
  const [data, setData] = useState<{dir: string; info: ModulesInfo}[]>([]);
  const [searchedData, setSearchedData] = useState<{dir: string; info: ModulesInfo}[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [unloaded, setUnloaded] = useState<SkippedPlugins[]>([]);

  useEffect(() => {
    setSearchedData(data.filter(module => searchInStrings(searchValue, [module.info.title, module.info.description])));
  }, [searchValue, data]);

  const removedModule = useCallback(
    (id: string) => {
      setData(prevState => prevState.filter(data => data.info.id !== id));
      setInstalledModules(prevState => prevState.filter(data => data !== id));
    },
    [setData],
  );

  useEffect(() => {
    rendererIpc.module.getInstalledModulesInfo().then(result => {
      setData(result);
      setInstalledModules(result.map(module => module.info.id));
    });
    rendererIpc.module.getSkipped().then(result => setUnloaded(result));
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
          type="search"
          spellCheck="false"
          className="w-full"
          value={searchValue}
          onValueChange={setSearchValue}
          placeholder="Type to find modules..."
          startContent={<Circle_Icon className="size-5" />}
        />
      </div>
      <LynxScroll className="my-1.5 size-full p-4">
        <List
          renderItem={item => (
            <RenderItem itemData={item} unloaded={unloaded} updatingAll={updatingAll} removedModule={removedModule} />
          )}
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
        />
      </LynxScroll>
    </>
  );
}
