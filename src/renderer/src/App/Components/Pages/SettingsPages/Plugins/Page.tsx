import {createContext, memo, useContext, useEffect, useMemo, useState} from 'react';

import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {InstalledPlugin, PluginItem} from '../../../../../../../cross/plugin/PluginTypes';
import {useUserState} from '../../../../Redux/Reducer/UserReducer';
import rendererIpc from '../../../../RendererIpc';
import PageView from '../../Page';
import List from './List/List';
import Preview from './Preview/Preview';
import {createExtensionStore, Store} from './Store';
import {ExtensionPageState} from './Types';

const ExtensionPageContext = createContext<Store | null>(null);

type Props = {show: boolean};
const Page = memo(({show}: Props) => {
  const [selectedExtension, setSelectedExtension] = useState<PluginItem | undefined>(undefined);
  const [installed, setInstalled] = useState<InstalledPlugin[]>([]);
  const [unloaded, setUnloaded] = useState<SkippedPlugins[]>([]);
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    rendererIpc.plugins.getInstalledPlugins().then(setInstalled);
    rendererIpc.plugins.checkForUpdates(updateChannel);
    rendererIpc.plugins.getSkippedPlugins().then(result => setUnloaded(result));
  }, [updateChannel]);

  const storeValue = useMemo(() => createExtensionStore(), []);

  return (
    <ExtensionPageContext.Provider value={storeValue}>
      <PageView show={show} className="gap-x-6">
        <List
          unloaded={unloaded}
          installed={installed}
          selectedExt={selectedExtension}
          setSelectedExt={setSelectedExtension}
        />
        <Preview installed={installed} setInstalled={setInstalled} selectedExt={selectedExtension} />
      </PageView>
    </ExtensionPageContext.Provider>
  );
});

export const useExtensionPageStore = <T,>(selector: (state: ExtensionPageState) => T): T => {
  const store = useContext(ExtensionPageContext);
  if (!store) throw new Error('Missing CardStoreContext.Provider');
  return store(selector);
};

export default Page;
