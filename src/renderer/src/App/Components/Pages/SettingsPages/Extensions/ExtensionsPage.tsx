import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {settingsActions} from '../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import Page from '../../Page';
import ExtensionList from './ExtensionList';
import ExtensionPreview from './ExtensionPreview';

export const extensionsRoutePath: string = '/extensionPage';
export type InstalledExt = {id: string; version?: string};

export default function ExtensionsPage() {
  const [selectedExtension, setSelectedExtension] = useState<Extension_ListData | undefined>(undefined);
  const [installed, setInstalled] = useState<InstalledExt[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    rendererIpc.extension.getInstalledExtensionsInfo().then(result => {
      setInstalled(
        result.map(item => {
          const {id, version} = item;
          return {id, version};
        }),
      );
    });
    rendererIpc.module.anyUpdateAvailable().then(value => {
      dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value}));
    });
  }, []);

  return (
    <Page className="flex flex-row gap-x-6 relative">
      <ExtensionList installed={installed} selectedExt={selectedExtension} setSelectedExt={setSelectedExtension} />
      <ExtensionPreview installed={installed} setInstalled={setInstalled} selectedExt={selectedExtension} />
    </Page>
  );
}
