import modulesChannels, {moduleApiChannels} from '@lynx_common/consts/ipcChannels/module';
import {MainHT} from '@lynx_common/types/ipc';
import {InstalledCard} from '@lynx_common/types/storage';
import GitManager from '@lynx_main/git';
import classHolder from '@lynx_main/managers/classHolder';
import {getDirCreationDate} from '@lynx_main/utils';

import lynxIpc from '../ipcWrapper';
import {sendToMain} from '../sender';

export default async function listenModules() {
  const moduleManager = await classHolder.waitForClass('moduleManager');

  // Checks if card has available updates
  modulesIpc.handle.cardUpdateAvailable((card, updateType) => moduleManager?.checkCardUpdate(card, updateType));

  // Uninstalls card by ID
  modulesIpc.handle.uninstallCardByID(id => moduleManager?.uninstallCardByID(id));

  // Checks for updates on multiple cards at intervals
  modulesIpc.on.checkCardsUpdateInterval(updateType => moduleManager?.cardsUpdateInterval(updateType));
}

export function listenModuleApi() {
  // Gets folder creation date
  moduleApiIpc.handle.getFolderCreationTime(dir => getDirCreationDate(dir));

  // Gets last Git pull date for repository
  moduleApiIpc.handle.getLastPulledDate(dir => GitManager.getLastPulledDate(dir));

  // Gets current Git release tag
  moduleApiIpc.handle.getCurrentReleaseTag(dir => GitManager.getCurrentReleaseTag(dir));
}

export const modulesIpc = {
  send: {
    onCardsUpdateAvailable: (cards: string[]) => sendToMain(modulesChannels.onCardsUpdateAvailable, cards),
  },
  on: {
    checkCardsUpdateInterval: (callback: (updateType: {id: string; type: 'git' | 'stepper'}[]) => void) =>
      lynxIpc.on(modulesChannels.checkCardsUpdateInterval, callback),
  },
  handle: {
    cardUpdateAvailable: (
      callback: (card: InstalledCard, updateType: 'git' | 'stepper' | undefined) => MainHT<boolean | undefined>,
    ) => lynxIpc.handle(modulesChannels.cardUpdateAvailable, callback),
    uninstallCardByID: (callback: (id: string) => MainHT<void>) =>
      lynxIpc.handle(modulesChannels.uninstallCardByID, callback),
  },
};

export const moduleApiIpc = {
  handle: {
    getFolderCreationTime: (callback: (dir: string) => MainHT<string>) =>
      lynxIpc.handle(moduleApiChannels.getFolderCreationTime, callback),
    getLastPulledDate: (callback: (dir: string) => MainHT<string>) =>
      lynxIpc.handle(moduleApiChannels.getLastPulledDate, callback),
    getCurrentReleaseTag: (callback: (dir: string) => MainHT<string>) =>
      lynxIpc.handle(moduleApiChannels.getCurrentReleaseTag, callback),
  },
};
