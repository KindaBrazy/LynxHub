import {useState} from 'react';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import Page from '../../Page';
import ExtensionList from './ExtensionList';
import ExtensionPreview from './ExtensionPreview';

export const extensionsRoutePath: string = '/extensionPage';

export default function ExtensionsPage() {
  const [selectedExtension, setSelectedExtension] = useState<Extension_ListData | undefined>(undefined);

  return (
    <Page className="flex flex-row gap-x-6 relative">
      <ExtensionList selectedExt={selectedExtension} setSelectedExt={setSelectedExtension} />
      <ExtensionPreview selectedExt={selectedExtension} />
    </Page>
  );
}
