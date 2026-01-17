import pty from 'node-pty';

import ElectronAppManager from '../../main_window';
import StorageManager from '../../storage/helper';
import ModuleManager from '../modules';
import {MainExtensionUtils} from './types';

export default class ExtensionUtils implements MainExtensionUtils {
  private managerPromises: Map<string, Promise<any>> = new Map();
  private resolvers: Map<string, (manager: any) => void> = new Map();
  public nodePty = pty;

  constructor() {
    const managers = ['storage', 'app', 'module'];
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

  getModuleManager() {
    return this.managerPromises.get('module')!;
  }

  setStorageManager(manager: StorageManager) {
    this.resolvers.get('storage')!(manager);
  }

  setAppManager(manager: ElectronAppManager) {
    this.resolvers.get('app')!(manager);
  }

  setModuleManager(manager: ModuleManager) {
    this.resolvers.get('module')!(manager);
  }
}
