import {actionChannels} from '@lynx_common/consts/ipcChannels/actions';

import lynxIpc from './lynxIpc';

const actionsIpc = {
  logAction: (payload: {category: string; message: string; level: string; payload?: any}): void =>
    lynxIpc.send(actionChannels.logAction, payload),
};

export default actionsIpc;
