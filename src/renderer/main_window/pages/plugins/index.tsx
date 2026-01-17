import {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import rendererIpc from '../../ipc';
import {pluginsActions} from '../../redux/reducers/plugins';
import {useUserState} from '../../redux/reducers/user';
import {AppDispatch} from '../../redux/store';
import PageView from '../Page';
import List from './list';
import Preview from './preview';

type Props = {show: boolean};
const Index = memo(({show}: Props) => {
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

export default Index;
