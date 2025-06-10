import {Input} from '@heroui/react';
import {Empty, List, PaginationProps} from 'antd';
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {Circle_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../../Redux/Reducer/SettingsReducer';
import rendererIpc from '../../../../../RendererIpc';
import {searchInStrings} from '../../../../../Utils/UtilFunctions';
import LynxScroll from '../../../../Reusable/LynxScroll';
import RenderItem from './RenderItem';

type Props = {
  installedModules: string[];
  setInstalledModules: Dispatch<SetStateAction<string[]>>;
};

/** Fetch and display the list of available modules for installing */
export default function DownloadModules({installedModules, setInstalledModules}: Props) {
  const newModules = useSettingsState('newModules');
  const [pageSize, setPageSize] = useState<number>(6);
  const [data, setData] = useState<ModulesInfo[]>([]);
  const [searchedData, setSearchedData] = useState<ModulesInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const addModule = useCallback(
    (id: string) => {
      setInstalledModules(prevState => [...prevState, id]);
    },
    [setData],
  );

  useEffect(() => {
    setSearchedData(data.filter(module => searchInStrings(searchValue, [module.title, module.description])));
  }, [searchValue, data]);

  useEffect(() => {
    async function fetchModules() {
      try {
        const modules = await rendererIpc.statics.getModules();
        setData(modules.filter(module => !installedModules.includes(module.id)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchModules();
  }, [newModules]);

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
          locale={{
            emptyText: (
              <Empty
                description="There are no modules available at the moment,
                 but be sure to check back later for new additions!"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
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
          renderItem={item => <RenderItem item={item} addModule={addModule} />}
        />
      </LynxScroll>
    </>
  );
}
