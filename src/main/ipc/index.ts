import classHolder from '../core/class_holder';
import listenApplication from './application';
import listenContextMenu from './context_menu';
import listenFiles from './files';
import listenGit from './git';
import listenModules, {listenModuleApi} from './plugins/modules';
import listenPlugins from './plugins/plugins';
import listenPty from './pty';
import listenStatics from './statics';
import listenStorage, {listenStorageUtils} from './storage';
import listenUtils from './utils';

function listenManagers() {
  const {linkPreviewManager, moduleManager, extensionManager} = classHolder;

  const managers = [
    {name: 'moduleManager', instance: moduleManager},
    {name: 'extensionManager', instance: extensionManager},
    {name: 'linkPreviewManager', instance: linkPreviewManager},
  ];

  const missing = managers.filter(m => !m.instance).map(m => m.name);
  if (missing.length > 0) {
    console.error(`Can't listen to ipc channels, undefined managers: ${missing.join(', ')}`);
  }

  managers.forEach(m => m.instance?.listenForChannels());
}

export function listenToIpcChannels() {
  listenStorage();
  listenStorageUtils();

  listenApplication();
  listenFiles();

  listenGit();
  listenUtils();
  listenPty();

  listenModules();
  listenModuleApi();

  listenManagers();

  listenPlugins();
  listenContextMenu();

  listenStatics();
}
