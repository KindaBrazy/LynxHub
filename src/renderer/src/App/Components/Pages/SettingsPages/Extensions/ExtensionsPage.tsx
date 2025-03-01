import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {settingsActions} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import Page from '../../Page';
import ExtensionList from './ExtensionList';
import ExtensionPreview from './ExtensionPreview';

export const extensionsPageID: string = 'extensionPage';
export type InstalledExt = {dir: string; id: string; version?: string};

export default function ExtensionsPage() {
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

  return (
    <Page className="flex flex-row gap-x-6 relative">
      <ExtensionList
        unloaded={unloaded}
        installed={installed}
        selectedExt={selectedExtension}
        setSelectedExt={setSelectedExtension}
      />
      <ExtensionPreview installed={installed} setInstalled={setInstalled} selectedExt={selectedExtension} />
    </Page>
  );
}
