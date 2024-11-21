import {ExtensionMainApi, MainExtensionUtils} from '../Managements/Plugin/Extensions/ExtensionTypes';
import StorageManager from '../Managements/Storage/StorageManager';
import {listenForChannels} from './Methods/IpcChannels';

let storeManager: StorageManager | undefined = undefined;

async function onAppReady() {
  console.log('Extension App Ready: ', storeManager?.getData('cards').installedCards);
}

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  storeManager = utils.storageManager;

  lynxApi.listenForChannels(listenForChannels);

  lynxApi.onAppReady(onAppReady);
}
