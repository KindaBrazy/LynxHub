import {userImagesChannels} from '@lynx_common/consts/ipcChannels/userImages';
import {MainHT} from '@lynx_common/types/ipc';
import {getUserImagesManager} from '@lynx_main/managers/userImages';

import lynxIpc from './ipcWrapper';

/**
 * Initializes listeners for user image operations.
 */
export default function listenUserImages() {
  const manager = getUserImagesManager();

  userImagesIpc.handle.chooseImage(options => manager.chooseImage(options));
}

/**
 * IPC interface for user image operations.
 */
export const userImagesIpc = {
  handle: {
    chooseImage: (callback: (options?: {allowMultiple?: boolean}) => MainHT<string | string[] | undefined>) =>
      lynxIpc.handle(userImagesChannels.chooseImage, callback),
  },
};
