import {CardInfoApi, CardInfoCallback, CardInfoDescriptions} from '@lynx_cross/types/plugins/module';
import rendererIpc from '@lynx_shared/ipc';
import filesIpc from '@lynx_shared/ipc/files';
import {moduleApiIpc} from '@lynx_shared/ipc/plugins/module';
import {isEmpty} from 'lodash';
import {useEffect} from 'react';

import {getCardMethod, useAllCardMethods} from '../../../plugins/modules';

export default function useCardInfoApi(
  cardId: string,
  setOpenFolders: (folders: string[] | undefined) => void,
  setCardInfoDescriptions: (descriptions: CardInfoDescriptions) => void,
  dir?: string,
) {
  const allMethods = useAllCardMethods();

  useEffect(() => {
    if (!isEmpty(cardId)) {
      const api: CardInfoApi = {
        installationFolder: dir,
        ipc: {
          on(channel: string, listener: any): () => void {
            return window.electron.ipcRenderer.on(channel, listener);
          },
          send(channel: string, ...args: any[]) {
            return window.electron.ipcRenderer.send(channel, ...args);
          },
          invoke(channel: string, ...args: any[]): Promise<any> {
            return window.electron.ipcRenderer.invoke(channel, ...args);
          },
        },
        storage: {
          get: (key: string) => rendererIpc.storage.getCustom(key),
          set: (key: string, data: any) => rendererIpc.storage.setCustom(key, data),
        },
        getFolderSize: (dir: string) => filesIpc.calcFolderSize(dir),
        getFolderCreationTime: (dir: string) => moduleApiIpc.getFolderCreationTime(dir),
        getLastPulledDate: (dir: string) => moduleApiIpc.getLastPulledDate(dir),
        getCurrentReleaseTag: (dir: string) => moduleApiIpc.getCurrentReleaseTag(dir),
      };

      const callBack: CardInfoCallback = {setOpenFolders, setDescription: setCardInfoDescriptions};

      try {
        getCardMethod(allMethods, cardId, 'cardInfo')?.(api, callBack);
      } catch (error) {
        console.error('Failed to execute cardInfo method:', error);
      }
    }
  }, [cardId, dir, allMethods]);
}
