import {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {pluginsActions} from '../../../../Redux/Reducer/PluginsReducer';
import {useUserState} from '../../../../Redux/Reducer/UserReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import PageView from '../../Page';
import List from './List/List';
import Preview from './Preview/Preview';

type Props = {show: boolean};
const Page = memo(({show}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    rendererIpc.plugins.getInstalledList().then(items => {
      dispatch(pluginsActions.setPluginsState({key: 'installedList', value: items}));
    });
    rendererIpc.plugins.checkForSync(updateChannel);
    rendererIpc.plugins.getUnloadedList().then(items => {
      dispatch(pluginsActions.setPluginsState({key: 'unloadedList', value: items}));
    });
  }, [updateChannel]);

  return (
    <PageView show={show} className="gap-x-6">
      <List />
      <Preview />
    </PageView>
  );
});

export default Page;
