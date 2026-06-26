import {userImagesChannels} from '@lynx_common/consts/ipcChannels/userImages';

import lynxIpc from './lynxIpc';

const userImagesIpc = {
  /**
   * Prompts user to select image(s) from PC, copies them to app data and returns custom protocol URL(s)
   */
  chooseImage: (options?: {allowMultiple?: boolean}) =>
    lynxIpc.invoke<string | string[] | undefined>(userImagesChannels.chooseImage, options),
};

export default userImagesIpc;
