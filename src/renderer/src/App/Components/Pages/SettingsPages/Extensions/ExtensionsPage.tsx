import {createContext, memo, useContext, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {settingsActions} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import Page from '../../Page';
import ExtensionList from './ExtensionList';
import {createExtensionStore, ExtensionPageStore} from './ExtensionPageStore';
import {ExtensionPageState} from './ExtensionPageTypes';
import ExtensionPreview from './ExtensionPreview';

export type InstalledExt = {dir: string; id: string; version?: string};

type Props = {show: boolean};

const ExtensionPageContext = createContext<ExtensionPageStore | null>(null);

const ExtensionsPage = memo(({show}: Props) => {
  const [selectedExtension, setSelectedExtension] = useState<Extension_ListData | undefined>(undefined);
  const [installed, setInstalled] = useState<InstalledExt[]>([]);
  const [unloaded, setUnloaded] = useState<SkippedPlugins[]>([]);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    rendererIpc.extension.getInstalledExtensionsInfo().then(result => {
      setInstalled(
        result.map(item => {
          const {id, version} = item.info;
          return {id, version, dir: item.dir};
        }),
      );
    });
    rendererIpc.extension.updateAvailableList().then(value => {
      dispatch(settingsActions.setSettingsState({key: 'extensionsUpdateAvailable', value}));
    });
    rendererIpc.extension.getSkipped().then(result => setUnloaded(result));
  }, []);

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
