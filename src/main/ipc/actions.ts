import {actionChannels} from '@lynx_common/consts/ipcChannels/actions';
import {logAction} from '@lynx_main/utils/actionLogger';

import lynxIpc from './ipcWrapper';

export default function listenActions() {
  actionsIpc.on.logAction(payload => {
    logAction(payload.category, payload.message, payload.level, payload.payload);
  });
}

export const actionsIpc = {
  on: {
    logAction: (callback: (payload: {category: string; message: string; level: string; payload?: any}) => void) =>
      lynxIpc.on(actionChannels.logAction, callback),
  },
};
