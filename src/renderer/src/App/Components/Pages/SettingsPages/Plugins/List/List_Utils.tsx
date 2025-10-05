import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {isEmpty, isNil} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {PluginFilter, PluginItem} from '../../../../../../../../cross/plugin/PluginTypes';
import {FilterDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useUserState} from '../../../../../Redux/Reducer/UserReducer';
import rendererIpc from '../../../../../RendererIpc';

export function useFetchExtensions(setList: Dispatch<SetStateAction<PluginItem[]>>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    async function fetchExtensionsList() {
      setLoading(true);
      try {
        const plugins = await rendererIpc.plugins.getList(updateChannel);

        if (!isEmpty(plugins)) setList(plugins);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    setRefreshing(true);
    rendererIpc.statics.pull().finally(() => fetchExtensionsList().finally(() => setRefreshing(false)));

    fetchExtensionsList();
  }, []);

  return {loading, refreshing};
}

export function useFilteredList(
  list: PluginItem[],
  selectedFilters: PluginFilter,
  setSelectedExt: Dispatch<SetStateAction<PluginItem | undefined>>,
  installed: string[],
) {
  const filteredList = useMemo(() => {
    if (selectedFilters === 'all' || selectedFilters.size === 3) return list;

    const isInstalledActive = selectedFilters.has('installed');
    const isModuleActive = selectedFilters.has('modules');
    const isExtensionActive = selectedFilters.has('extensions');

    return list.filter(item => {
      const isInstalled = installed.includes(item.metadata.id);
      const isModule = item.metadata.type === 'module';
      const isExtension = item.metadata.type === 'extension';

      return (isInstalledActive && isInstalled) || (isModuleActive && isModule) || (isExtensionActive && isExtension);
    });
  }, [list, selectedFilters, installed]);

  useEffect(() => {
    setSelectedExt(prevState => {
      if (isEmpty(filteredList)) {
        return undefined;
      }
      if (isNil(prevState)) {
        return filteredList[0];
      }
      if (!filteredList.some(item => item.metadata.id === prevState.metadata.id)) {
        return filteredList[0];
      }
      return prevState;
    });
  }, [filteredList]);

  return filteredList;
}

export function useSortedList(list: PluginItem[], installed: string[]) {
  return useMemo(
    () =>
      [...list].sort((a, b) => {
        const aInstalled = installed.includes(a.metadata.id);
        const bInstalled = installed.includes(b.metadata.id);

        if (aInstalled && !bInstalled) return -1;
        if (!aInstalled && bInstalled) return 1;
        return 0;
      }),
    [list, installed],
  );
}

export function useFilterMenu(selectedKeys: PluginFilter, setSelectedKeys: Dispatch<SetStateAction<PluginFilter>>) {
  return useCallback(() => {
    return (
      <>
        <Dropdown size="sm" closeOnSelect={false} className="border !border-foreground/15">
          <DropdownTrigger>
            <Button variant="flat" isIconOnly>
              <FilterDuo_Icon className="size-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            variant="faded"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            // @ts-ignore-next-line
            onSelectionChange={setSelectedKeys}>
            <DropdownSection title="Filter">
              <DropdownItem key="installed" className="cursor-default">
                Installed
              </DropdownItem>
              <DropdownItem key="modules" className="cursor-default">
                Modules
              </DropdownItem>
              <DropdownItem key="extensions" className="cursor-default">
                Extensions
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </>
    );
  }, [selectedKeys]);
}
