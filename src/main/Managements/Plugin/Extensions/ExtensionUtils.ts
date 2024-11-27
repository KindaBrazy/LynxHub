import DiscordRpcManager from '../../DiscordRpcManager';
import ElectronAppManager from '../../ElectronAppManager';
import StorageManager from '../../Storage/StorageManager';
import ModuleManager from '../ModuleManager';
import {MainExtensionUtils} from './ExtensionTypes_Main';

export default class ExtensionUtils implements MainExtensionUtils {
  private managerPromises: Map<string, Promise<any>> = new Map();
  private resolvers: Map<string, (manager: any) => void> = new Map();

  constructor() {
    const managers = ['storage', 'app', 'discordRpc', 'module'];
    managers.forEach(manager => {
      this.managerPromises.set(
        manager,
        new Promise(resolve => {
          this.resolvers.set(manager, resolve);
        }),
      );
    });
  }

  getStorageManager() {
    return this.managerPromises.get('storage')!;
  }

  getAppManager() {
    return this.managerPromises.get('app')!;
  }

  getDiscordRpcManager() {
    return this.managerPromises.get('discordRpc')!;
  }

  getModuleManager() {
    return this.managerPromises.get('module')!;
  }

  setStorageManager(manager: StorageManager) {
    this.resolvers.get('storage')!(manager);
  }

  setAppManager(manager: ElectronAppManager) {
    this.resolvers.get('app')!(manager);
  }

  setDiscordRpcManager(manager: DiscordRpcManager) {
    this.resolvers.get('discordRpc')!(manager);
  }

  setModuleManager(manager: ModuleManager) {
    this.resolvers.get('module')!(manager);
  }
}
