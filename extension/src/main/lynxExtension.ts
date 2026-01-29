import {EMenuItem, ExtensionMainApi, MainExtensionUtils} from '@lynx_main/plugins/extensions/types';
import StorageManager from '@lynx_main/storage/helper';

import {listenForChannels} from './Methods/IpcChannels';

let storeManager: StorageManager | undefined = undefined;

async function onAppReady() {
  console.log('Extension onAppReady storeManager: ', storeManager?.getData('cards').installedCards);
}

function trayMenu_AddItem(): {item: EMenuItem; index: number} {
  return {item: {label: 'Extension Test', type: 'checkbox'}, index: 3};
}

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  return;

  utils.getStorageManager().then(storageManager => {
    storeManager = storageManager;
  });

  lynxApi.trayMenu_AddItem(trayMenu_AddItem);
  lynxApi.listenForChannels(listenForChannels);

  lynxApi.onAppReady(onAppReady);
}
