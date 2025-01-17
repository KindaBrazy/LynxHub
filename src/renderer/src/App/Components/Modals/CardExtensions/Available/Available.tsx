import {Input, Spinner} from '@heroui/react';
import {Empty, List, PaginationProps} from 'antd';
import {useEffect, useState} from 'react';

import {validateGitRepoUrl} from '../../../../../../../cross/CrossUtils';
import {Circle_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {getCardMethod, useAllCards} from '../../../../Modules/ModuleLoader';
import {useModalsState} from '../../../../Redux/AI/ModalsReducer';
import {searchInStrings} from '../../../../Utils/UtilFunctions';
import RenderItem from './RenderItem';

type Props = {
  visible: boolean;
  updateTable: () => void;
  installedExtensions: string[];
};
export type ExtensionsInfo = {
  title: string;
  description: string;
  url: string;
  stars?: number;
};

export default function Available({visible, updateTable, installedExtensions}: Props) {
  const {id} = useModalsState('cardExtensions');
  const [pageSize, setPageSize] = useState<number>(10);
  const [data, setData] = useState<ExtensionsInfo[]>([]);
  const [list, setList] = useState<ExtensionsInfo[]>([]);
  const [searchedData, setSearchedData] = useState<ExtensionsInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const allCards = useAllCards();

  useEffect(() => {
    setSearchedData(
      data.filter(extension => searchInStrings(searchValue, [extension.title, extension.description, extension.url])),
    );
  }, [searchValue, data]);

  useEffect(() => {
    // Remove installed extensions from the list
    const filterInstalled = list.filter(ext => !installedExtensions.includes(ext.url));
    setData(filterInstalled);
  }, [installedExtensions, list]);

  useEffect(() => {
    async function fetchModules() {
      setIsLoading(true);
      try {
        const fetchExtensionList = getCardMethod(allCards, id, 'fetchExtensionList');
        if (fetchExtensionList) {
          const extensions: ExtensionsInfo[] = await fetchExtensionList();
          const filterData = extensions.filter(ext => !!validateGitRepoUrl(ext.url));
          setList(filterData.map(ext => ({...ext, url: validateGitRepoUrl(ext.url)})));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    if (visible) fetchModules();
  }, [visible, allCards]);

  const onPageSizeChange: PaginationProps['onShowSizeChange'] = (_, pageSize) => {
    setPageSize(pageSize);
  };

  if (!visible) return null;
  return (
    <>
      <div className="mb-4 flex w-full justify-center">
        <Input
          classNames={{
            inputWrapper: 'dark:bg-black/20 dark:hover:bg-white/5 bg-stone-50 shadow-md overflow-hidden',
          }}
          type="search"
          spellCheck={false}
          className="w-full"
          value={searchValue}
          onValueChange={setSearchValue}
          startContent={<Circle_Icon className="size-5" />}
          placeholder="Search by title, description or url..."
          autoFocus
        />
      </div>
      {isLoading ? (
        <div className="size-full text-center">
          <Spinner label="Loading extensions list..." />
        </div>
      ) : (
        <List
          locale={{
            emptyText: (
              <Empty
                description="Sorry, there are no extensions available to download at the moment.
                 Please check back later!"
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
                  showTotal: total => `Extensions Available: ${total}`,
                }
          }
          split={false}
          itemLayout="vertical"
          dataSource={searchedData}
          renderItem={item => <RenderItem item={item} updateTable={updateTable} />}
        />
      )}
    </>
  );
}
