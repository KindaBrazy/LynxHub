import {memo, useEffect, useState} from 'react';

import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {InstalledPlugin} from '../../../../../../../cross/plugin/PluginTypes';
import {useUserState} from '../../../../Redux/Reducer/UserReducer';
import rendererIpc from '../../../../RendererIpc';
import PageView from '../../Page';
import List from './List/List';
import Preview from './Preview/Preview';

type Props = {show: boolean};
const Page = memo(({show}: Props) => {
  const [installed, setInstalled] = useState<InstalledPlugin[]>([]);
  const [unloaded, setUnloaded] = useState<SkippedPlugins[]>([]);
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    rendererIpc.plugins.getInstalled().then(setInstalled);
    rendererIpc.plugins.checkForUpdates(updateChannel);
    rendererIpc.plugins.getSkipped().then(result => setUnloaded(result));
  }, [updateChannel]);

  return (
    <PageView show={show} className="gap-x-6">
      <List unloaded={unloaded} installed={installed} />
      <Preview installed={installed} setInstalled={setInstalled} />
    </PageView>
  );
});

export default Page;
