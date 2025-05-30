import {isEmpty} from 'lodash';
import {useEffect} from 'react';

import {getCardMethod, useAllCards} from '../../../Modules/ModuleLoader';
import {CardInfoApi, CardInfoCallback, CardInfoDescriptions} from '../../../Modules/types';
import rendererIpc from '../../../RendererIpc';

export default function useCardInfoApi(
  cardId: string,
  setOpenFolders: (folders: string[] | undefined) => void,
  setCardInfoDescriptions: (descriptions: CardInfoDescriptions) => void,
  dir?: string,
) {
  const allCards = useAllCards();

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
        getFolderSize: (dir: string) => rendererIpc.file.calcFolderSize(dir),
        getFolderCreationTime: (dir: string) => rendererIpc.moduleApi.getFolderCreationTime(dir),
        getLastPulledDate: (dir: string) => rendererIpc.moduleApi.getLastPulledDate(dir),
        getCurrentReleaseTag: (dir: string) => rendererIpc.moduleApi.getCurrentReleaseTag(dir),
      };

      const callBack: CardInfoCallback = {setOpenFolders, setDescription: setCardInfoDescriptions};

      getCardMethod(allCards, cardId, 'cardInfo')?.(api, callBack);
    }
  }, [cardId, dir, allCards]);
}
