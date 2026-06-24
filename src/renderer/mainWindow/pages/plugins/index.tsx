import {pluginsActions} from '@lynx/redux/reducers/plugins';
import {useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {getRendererFailures} from '../../plugins/failures';
import PageView from '../Page';
import List from './list';
import Preview from './preview';

/**
 * Custom hook to initialize the plugins page state by fetching installed
 * and unloaded lists, and checking for sync updates.
 */
function useInitializePlugins() {
  const dispatch = useDispatch<AppDispatch>();
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    pluginsIpc.getInstalledList().then(items => {
      dispatch(pluginsActions.setPluginsState({key: 'installedList', value: items}));
    });

    pluginsIpc.checkForSync(updateChannel);

    pluginsIpc.getUnloadedList().then(items => {
      const allFailures = [...items, ...getRendererFailures()];
      // De-duplicate by ID in case
      const uniqueFailures = allFailures.filter((item, index, self) => self.findIndex(f => f.id === item.id) === index);
      dispatch(pluginsActions.setPluginsState({key: 'unloadedList', value: uniqueFailures}));
    });
  }, [dispatch, updateChannel]);
}

/**
 * The main entry point for the Plugins page.
 * Manages the layout for the plugin list and plugin preview components.
 */
const PluginsPage = memo(() => {
  useInitializePlugins();

  return (
    <PageView className="gap-x-6">
      <List />
      <Preview />
    </PageView>
  );
});

PluginsPage.displayName = 'PluginsPage';

export default PluginsPage;
