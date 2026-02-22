import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {pluginsActions} from '@lynx/redux/reducers/plugins';
import {useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {PluginFilter, PluginItem} from '@lynx_common/types/plugins';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import staticsIpc from '@lynx_shared/ipc/statics';
import {Filter} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Custom hook to fetch the list of available plugins (extensions and modules).
 * Handles both the initial load and pulling the latest updates from remote statics.
 *
 * @returns Object containing the plugin list, loading state, and refreshing state.
 */
export function useFetchExtensions() {
  const [list, setList] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    let isMounted = true;

    async function fetchExtensionsList() {
      if (isMounted) setLoading(true);
      try {
        const plugins = await pluginsIpc.getList(updateChannel);
        if (isMounted && !isEmpty(plugins)) {
          setList(plugins);
        }
      } catch (e) {
        console.error('Failed to fetch extensions:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (isMounted) setRefreshing(true);

    // Pull the latest statics before fetching the list
    staticsIpc.pull().finally(() => {
      fetchExtensionsList().finally(() => {
        if (isMounted) setRefreshing(false);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [updateChannel]);

  return {list, loading, refreshing};
}

/**
 * Custom hook to filter the list of plugins based on the selected filter strategy.
 * Also handles a side effect to set the selected plugin when the filtered list changes.
 *
 * @param list - The raw plugin list.
 * @param selectedFilters - The set of currently active filters.
 * @param installed - Array of installed plugin IDs.
 * @returns The filtered array of PluginItem objects.
 */
export function useFilteredList(list: PluginItem[], selectedFilters: PluginFilter, installed: string[]) {
  const dispatch = useDispatch<AppDispatch>();

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

  // Set default selection when filtered list changes
  useEffect(() => {
    const selected = isEmpty(filteredList) ? undefined : filteredList.find(item => item.isCompatible);
    dispatch(pluginsActions.setSelectedPlugin(selected));
  }, [filteredList, dispatch]);

  return filteredList;
}

/**
 * Custom hook to sort the plugin list so installed plugins appear first.
 *
 * @param list - The raw plugin list.
 * @param installed - Array of installed plugin IDs.
 * @returns The sorted array of PluginItem objects.
 */
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

/** Props for the FilterMenu component. */
interface FilterMenuProps {
  /** The currently selected keys (Set or 'all') */
  selectedKeys: PluginFilter;
  /** State setter for selected keys */
  setSelectedKeys: Dispatch<SetStateAction<PluginFilter>>;
}

/**
 * A dropdown menu component for selecting plugin filters (Installed, Modules, Extensions).
 */
export function FilterMenu({selectedKeys, setSelectedKeys}: FilterMenuProps) {
  return (
    <Dropdown size="sm" closeOnSelect={false} className="border border-foreground/15!">
      <DropdownTrigger>
        <Button variant="flat" isIconOnly>
          <Filter className="size-4" />
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
  );
}
