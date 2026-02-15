import classHolder from '@lynx_main/managers/classHolder';

import listenApplication from './application';
import listenContextMenu from './contextMenu';
import listenFiles from './files';
import listenGit from './git';
import listenModules, {listenModuleApi} from './plugins/modules';
import listenPlugins from './plugins/plugins';
import listenPty from './pty';
import listenStatics from './statics';
import listenStorage, {listenStorageUtils} from './storage';
import listenUtils from './utils';

async function listenManagers() {
  try {
    const [moduleManager, extensionManager, linkPreviewManager] = await Promise.all([
      classHolder.waitForClass('moduleManager'),
      classHolder.waitForClass('extensionManager'),
      classHolder.waitForClass('linkPreviewManager'),
    ]);

    moduleManager.listenForChannels();
    extensionManager.listenForChannels();
    linkPreviewManager.listenForChannels();
  } catch (err) {
    console.error('Failed to initialize managers for IPC channels:', err?.message || err);
  }
}

export async function listenToIpcChannels() {
  listenStorage();
  listenStorageUtils();

  await listenApplication();
  listenFiles();

  listenGit();
  listenUtils();
  listenPty();

  await listenModules();
  listenModuleApi();

  await listenManagers();

  await listenPlugins();
  await listenContextMenu();

  await listenStatics();
}
