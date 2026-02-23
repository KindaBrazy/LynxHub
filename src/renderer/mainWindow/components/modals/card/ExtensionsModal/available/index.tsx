import {Input, Pagination, Spinner} from '@heroui/react';
import {Circle_Icon} from '@lynx_assets/icons';
import {validateGitRepoUrl} from '@lynx_common/utils';
import {Empty} from 'antd';
import {memo, useEffect, useMemo, useState} from 'react';

import {getCardMethod, useAllCardMethods} from '../../../../../plugins/modules';
import {searchInStrings} from '../../../../../utils';
import {ExtensionsInfo} from '../types';
import RenderItem from './RenderItem';

type Props = {
  visible: boolean;
  updateTable: () => void;
  installedExtensions: string[];
  id: string;
  dir: string;
};

const Available = memo(({visible, updateTable, installedExtensions, id, dir}: Props) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState<ExtensionsInfo[]>([]);
  const [list, setList] = useState<ExtensionsInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const allMethods = useAllCardMethods();

  const searchedData = useMemo(() => {
    return data.filter(extension =>
      searchInStrings(searchValue, [extension.title, extension.description, extension.url]),
    );
  }, [searchValue, data]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return searchedData.slice(start, start + pageSize);
  }, [page, pageSize, searchedData]);

  useEffect(() => {
    // Remove installed extensions from the list
    const filterInstalled = list.filter(ext => !installedExtensions.includes(ext.url));
    setData(filterInstalled);
  }, [installedExtensions, list]);

  useEffect(() => {
    async function fetchModules() {
      setIsLoading(true);
      try {
        const fetchExtensionList = getCardMethod(allMethods, id, 'fetchExtensionList');
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
  }, [visible, allMethods, id]);

  if (!visible) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex w-full justify-center">
        <Input
          classNames={{
            inputWrapper: 'dark:bg-black/20 dark:hover:bg-white/5 bg-stone-50 shadow-md overflow-hidden',
          }}
          type="search"
          spellCheck="false"
          className="w-full"
          value={searchValue}
          onValueChange={setSearchValue}
          startContent={<Circle_Icon className="size-5" />}
          placeholder="Search by title, description or url..."
          autoFocus
        />
      </div>

      {isLoading ? (
        <div className="flex size-full items-center justify-center text-center">
          <Spinner label="Loading extensions list..." />
        </div>
      ) : searchedData.length === 0 ? (
        <Empty
          description={
            'There are no extensions available at the moment, but be sure to check back later for new additions!'
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {paginatedData.map(item => (
            <RenderItem dir={dir} item={item} key={item.url} updateTable={updateTable} searchValue={searchValue} />
          ))}

          {searchedData.length > pageSize && (
            <div className="mt-4 flex justify-center">
              <Pagination
                page={page}
                color="secondary"
                onChange={setPage}
                total={Math.ceil(searchedData.length / pageSize)}
                showControls
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default Available;
