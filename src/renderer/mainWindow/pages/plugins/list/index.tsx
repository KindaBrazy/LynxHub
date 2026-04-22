import {Button, Card, ProgressBar, SearchField, Skeleton} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import LynxScroll from '@lynx/components/LynxScroll';
import {pluginsActions, usePluginsState} from '@lynx/redux/reducers/plugins';
import {AppDispatch} from '@lynx/redux/store';
import {searchInStrings, showRestartModal} from '@lynx/utils';
import {Circle_Icon} from '@lynx_assets/icons';
import {PluginPage_Icon} from '@lynx_assets/icons/pages';
import {PluginFilter} from '@lynx_common/types/plugins';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import {Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {useCallback, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {topToast} from '../../../layouts/ToastProviders';
import {PluginListItem} from './Items';
import {FilterMenu, useFetchExtensions, useFilteredList, useSortedList} from './utils';

/**
 * Main component for the plugin list view.
 * Displays a searchable, filterable list of available extensions and modules.
 */
export default function PluginList() {
  const [selectedFilters, setSelectedFilters] = useState<PluginFilter>('all');
  const [searchValue, setSearchValue] = useState<string>('');

  const installed = usePluginsState('installedList');
  const installedID = useMemo(() => installed.map(item => item.id), [installed]);

  const {list, loading, refreshing} = useFetchExtensions();

  const sortedList = useSortedList(list, installedID);
  const filteredList = useFilteredList(sortedList, selectedFilters, installedID);

  const resultList = useMemo(() => {
    if (isEmpty(searchValue)) {
      return filteredList;
    }
    return filteredList.filter(item =>
      searchInStrings(searchValue, [item.metadata.title, item.metadata.description, item.url]),
    );
  }, [searchValue, filteredList]);

  const emptyText = useMemo(() => {
    return (
      <EmptyStateCard
        icon={
          <div className="rounded-full bg-foreground-100/80 p-3 text-foreground-500">
            <Circle_Icon className="size-5" />
          </div>
        }
        title={
          isEmpty(searchValue)
            ? 'It looks like there are no plugin available right now.'
            : `Couldn't find any plugins matching your search.`
        }
        description={
          isEmpty(searchValue) ? (
            <p className="text-sm text-foreground-500">
              This could be temporary. Please try again later or check your internet connection.
            </p>
          ) : (
            <p className="text-sm text-foreground-500">Try refining your search terms or checking for typos.</p>
          )
        }
      />
    );
  }, [searchValue]);

  return (
    <Card
      className={
        `absolute inset-y-4 sm:w-76 lg:w-[24rem] 2xl:w-120` +
        ` flex shrink-0 flex-col overflow-hidden transition-[width] duration-500`
      }
      variant="secondary">
      {refreshing && (
        <ProgressBar size="sm" aria-label="Loading list" className="absolute -top-1 inset-x-0" isIndeterminate>
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      )}

      <Card.Header>
        <div className="flex w-full flex-col gap-y-4">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex gap-x-2 items-center">
              <PluginPage_Icon className="size-5" />
              <span>Plugins</span>
            </div>
            <SyncAllButton />
          </div>
          <div className="flex flex-row items-center gap-x-2">
            <SearchField name="search" value={searchValue} onChange={setSearchValue} fullWidth>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search for Plugins..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <FilterMenu selectedKeys={selectedFilters} setSelectedKeys={setSelectedFilters} />
          </div>
        </div>
      </Card.Header>

      <Card.Content>
        <LynxScroll className="size-full space-y-2 px-3 pt-2">
          {loading ? (
            <div className="flex flex-col">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="h-36 w-full space-y-1 p-2">
                    <Skeleton className="h-10 w-full rounded-xl bg-surface/50" />
                    <Skeleton className="h-20 w-full rounded-xl bg-surface/50" />
                  </div>
                ))}
            </div>
          ) : isEmpty(resultList) ? (
            emptyText
          ) : (
            <div className="flex flex-col gap-y-2 pb-4">
              {resultList.map(item => (
                <PluginListItem item={item} installed={installed} key={`${item.metadata.id}_list_item`} />
              ))}
            </div>
          )}
        </LynxScroll>
      </Card.Content>
    </Card>
  );
}

/**
 * Button component to trigger syncing of all available updates for installed plugins.
 */
function SyncAllButton() {
  const dispatch = useDispatch<AppDispatch>();

  const syncList = usePluginsState('syncList');
  const updatingAll = usePluginsState('updatingAll');

  const syncAll = useCallback(() => {
    dispatch(pluginsActions.manageSet({key: 'updating', id: syncList.map(item => item.id), operation: 'add'}));
    dispatch(pluginsActions.setUpdatingAll(true));

    pluginsIpc
      .syncAll(syncList.map(item => ({id: item.id, commit: item.commit})))
      .then(synced => {
        if (!isEmpty(synced)) {
          topToast.success(`${synced.length} of ${syncList.length} plugins synced successfully!`);
          showRestartModal(dispatch, 'To apply the changes, please restart the app.');

          const updatedList = syncList
            .filter(item => synced.includes(item.id))
            .map(item => ({version: item.version, id: item.id}));

          dispatch(pluginsActions.updateInstalledVersion(updatedList));
        }
      })
      .catch(() => topToast.danger('Failed to sync plugins. Please try again later.'))
      .finally(() => {
        dispatch(pluginsActions.manageSet({key: 'updating', id: syncList.map(item => item.id), operation: 'remove'}));
        dispatch(pluginsActions.setUpdatingAll(false)); // Fixed logical error in the original code, should be false when finally
      });
  }, [dispatch, syncList]);

  if (isEmpty(syncList)) return null;

  return (
    <Button size="sm" onPress={syncAll} isPending={updatingAll}>
      {!updatingAll && <Refresh />}
      {updatingAll ? 'Syncing...' : `Sync All (${syncList.length})`}
    </Button>
  );
}
