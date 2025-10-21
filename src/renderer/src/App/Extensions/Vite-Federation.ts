import {__federation_method_getRemote, __federation_method_setRemote} from '__federation__';
import {captureException} from '@sentry/electron/renderer';
import {compact} from 'lodash';

import {isDev} from '../../../../cross/CrossUtils';
import {ExtensionImport_Renderer} from '../../../../cross/plugin/ExtensionTypes_Renderer';
import rendererIpc from '../RendererIpc';
import extensionLoader from './ExtensionLoader';

type RemotesConfig = {
  format?: 'esm' | 'systemjs' | 'var';
  from?: 'vite' | 'webpack';
  url: string;
};
type SetRemoteModule = (remotesName: string, remotesConfig: RemotesConfig) => void;
type GetRemoteModule = (remoteName: string, componentName: string) => Promise<ExtensionImport_Renderer>;

const setRemote: SetRemoteModule = __federation_method_setRemote;
const getRemote: GetRemoteModule = __federation_method_getRemote;

export async function loadExtensions() {
  let importedExtensions: (ExtensionImport_Renderer | null)[];
  let extensionIds: string[];

  if (isDev()) {
    const extension = await import('../../../../../extension/src/renderer/Extension');
    importedExtensions = [extension];
    extensionIds = ['dev-extension'];
  } else {
    const pluginAddresses = await rendererIpc.plugins.getAddresses();
    const extensionAddresses = pluginAddresses
      .filter(item => item.type === 'extension')
      .map(({address}) => `${address}/scripts/renderer/rendererEntry.mjs`);

    extensionIds = compact(
      extensionAddresses.map(url => {
        const match = url.match(/:\/\/[^/]+\/([^/]+)\/scripts/);
        return match ? match[1] : null;
      }),
    );

    extensionAddresses.forEach((url, index) => setRemote(extensionIds[index], {format: 'esm', from: 'vite', url}));

    importedExtensions = await Promise.all(
      extensionIds.map(folderName => {
        try {
          return getRemote(folderName, 'Extension');
        } catch (e) {
          console.error('Failed to load extension renderer entry: ', folderName, 'Error: ', e);
          captureException(e);
          return null;
        }
      }),
    );
  }

  const extensionsWithIds = compact(importedExtensions).map((module, index) => ({
    id: extensionIds[index],
    module,
  }));

  extensionLoader(extensionsWithIds);
}
