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

  const {linkPreviewManager, moduleManager, extensionManager} = classHolder;

  moduleManager?.listenForChannels();
  extensionManager?.listenForChannels();

  listenPlugins();

  listenContextMenu();
  if (linkPreviewManager) linkPreviewManager.listenForChannels();

  listenStatics();
}
