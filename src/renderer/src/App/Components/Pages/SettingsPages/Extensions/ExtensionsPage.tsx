import {createContext, memo, useContext, useEffect, useMemo, useState} from 'react';

import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {InstalledPlugin, PluginAvailableItem} from '../../../../../../../cross/plugin/PluginTypes';
import {useUserState} from '../../../../Redux/Reducer/UserReducer';
import rendererIpc from '../../../../RendererIpc';
import Page from '../../Page';
import ExtensionList from './ExtensionList';
import {createExtensionStore, ExtensionPageStore} from './ExtensionPageStore';
import {ExtensionPageState} from './ExtensionPageTypes';
import ExtensionPreview from './ExtensionPreview';

const ExtensionPageContext = createContext<ExtensionPageStore | null>(null);

type Props = {show: boolean};
const ExtensionsPage = memo(({show}: Props) => {
  const [selectedExtension, setSelectedExtension] = useState<PluginAvailableItem | undefined>(undefined);
  const [installed, setInstalled] = useState<InstalledPlugin[]>([]);
  const [unloaded, setUnloaded] = useState<SkippedPlugins[]>([]);
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    rendererIpc.plugins.getInstalledPlugins().then(installedList => {
      setInstalled(installedList.filter(item => item.metadata.type === 'extension'));
    });
    rendererIpc.plugins.checkForUpdates(updateChannel);
    rendererIpc.plugins.getSkippedPlugins().then(result => setUnloaded(result));
  }, [updateChannel]);

  const storeValue = useMemo(() => createExtensionStore(), []);

  return (
    <ExtensionPageContext.Provider value={storeValue}>
      <Page show={show} className="gap-x-6">
        <ExtensionList
          unloaded={unloaded}
          installed={installed}
          selectedExt={selectedExtension}
          setSelectedExt={setSelectedExtension}
        />
        <ExtensionPreview installed={installed} setInstalled={setInstalled} selectedExt={selectedExtension} />
      </Page>
    </ExtensionPageContext.Provider>
  );
});

export const useExtensionPageStore = <T,>(selector: (state: ExtensionPageState) => T): T => {
  const store = useContext(ExtensionPageContext);
  if (!store) throw new Error('Missing CardStoreContext.Provider');
  return store(selector);
};

export default ExtensionsPage;
