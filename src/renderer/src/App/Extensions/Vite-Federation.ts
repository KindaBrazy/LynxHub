// @ts-ignore-next-line
import {__federation_method_getRemote, __federation_method_setRemote} from '__federation__';
import {compact} from 'lodash';

import {isDev} from '../../../../cross/CrossUtils';
import rendererIpc from '../RendererIpc';
import extensionLoader from './ExtensionLoader';
import {ExtensionImport_Renderer} from './ExtensionTypes_Renderer';

type RemotesConfig = {
  format?: 'esm' | 'systemjs' | 'var';
  from?: 'vite' | 'webpack';
  url: string;
};

type SetRemoteModule = (remotesName: string, remotesConfig: RemotesConfig) => void;

type GetRemoteModule = (remoteName: string, componentName: string) => Promise<ExtensionImport_Renderer>;

export async function loadExtensions() {
  let importedExtensions: ExtensionImport_Renderer[];
  let folderNames: string[];

  if (isDev()) {
    const extension = await import('../../../../../extension/src/renderer/Extension');
    importedExtensions = [extension];
    folderNames = ['dev-extension'];
  } else {
    const extensionDataAddress: string[] = await rendererIpc.extension.getExtensionsData();
    const finalAddress: string[] = extensionDataAddress.map(ext => `${ext}/scripts/renderer/rendererEntry.mjs`);

    folderNames = compact(
      finalAddress.map(url => {
        const match = url.match(/:\/\/[^/]+\/([^/]+)\/scripts/);
        return match ? match[1] : null;
      }),
    );

    finalAddress.forEach((url, index) => {
      setRemote(folderNames[index], {
        format: 'esm',
        from: 'vite',
        url,
      });
    });

    importedExtensions = await Promise.all(folderNames.map(folderName => getRemote(folderName, 'Extension')));
  }

  const extensionsWithIds = importedExtensions.map((module, index) => ({
    id: folderNames[index],
    module,
  }));

  extensionLoader(extensionsWithIds);
}

export const setRemote: SetRemoteModule = __federation_method_setRemote;
export const getRemote: GetRemoteModule = __federation_method_getRemote;
