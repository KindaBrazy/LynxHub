import {useEffect, useState} from 'react';

import {Extension_ListData, ExtensionsInfo} from '../../../../../../../cross/CrossTypes';
import rendererIpc from '../../../../RendererIpc';
import Page from '../../Page';
import ExtensionList from './ExtensionList';
import ExtensionPreview from './ExtensionPreview';

export const extensionsRoutePath: string = '/extensionPage';

export default function ExtensionsPage() {
  const [selectedExtension, setSelectedExtension] = useState<Extension_ListData | undefined>(undefined);
  const [installed, setInstalled] = useState<ExtensionsInfo[]>([]);

  useEffect(() => {
    rendererIpc.extension.getInstalledExtensionsInfo().then(result => {
      setInstalled(result);
      console.log(result);
    });
  }, []);

  return (
    <Page className="flex flex-row gap-x-6 relative">
      <ExtensionList installed={installed} selectedExt={selectedExtension} setSelectedExt={setSelectedExtension} />
      <ExtensionPreview installed={installed} selectedExt={selectedExtension} />
    </Page>
  );
}
