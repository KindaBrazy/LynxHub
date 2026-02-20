
import modulesChannels, {moduleApiChannels} from '@lynx_common/consts/ipcChannels/module';
import {MainHT} from '@lynx_common/types/ipc';
import {InstalledCard} from '@lynx_common/types/storage';
import GitManager from '@lynx_main/git';
import classHolder from '@lynx_main/managers/classHolder';
import {getDirCreationDate} from '@lynx_main/utils';

import lynxIpc from '../ipcWrapper';
import {sendToMain} from '../sender';

/**
 * Sets up IPC listeners for module management.
 */
export default async function listenModules() {
  const moduleManager = await classHolder.waitForClass('moduleManager');

  // Checks if card has available updates
  modulesIpc.handle.cardUpdateAvailable((card, updateType) => moduleManager?.checkCardUpdate(card, updateType));

  // Uninstalls card by ID
  modulesIpc.handle.uninstallCardByID(id => moduleManager?.uninstallCardByID(id));

  // Checks for updates on multiple cards at intervals
  modulesIpc.on.checkCardsUpdateInterval(updateType => moduleManager?.cardsUpdateInterval(updateType));
}

/**
 * Sets up IPC listeners for module API operations.
 */
export function listenModuleApi() {
  // Gets folder creation date
  moduleApiIpc.handle.getFolderCreationTime(dir => getDirCreationDate(dir));

  // Gets last Git pull date for repository
  moduleApiIpc.handle.getLastPulledDate(dir => GitManager.getLastPulledDate(dir));

  // Gets current Git release tag
  moduleApiIpc.handle.getCurrentReleaseTag(dir => GitManager.getCurrentReleaseTag(dir));
}

/**
 * IPC interface for module operations.
 */
export const modulesIpc = {
  send: {
    /** Sends an event when card updates are available */
    onCardsUpdateAvailable: (cards: string[]) => sendToMain(modulesChannels.onCardsUpdateAvailable, cards),
  },
  on: {
    /** Listens for interval update checks */
    checkCardsUpdateInterval: (callback: (updateType: {id: string; type: 'git' | 'stepper'}[]) => void) =>
      lynxIpc.on(modulesChannels.checkCardsUpdateInterval, callback),
  },
  handle: {
    /** Handles checking if a single card has an update */
    cardUpdateAvailable: (
      callback: (card: InstalledCard, updateType: 'git' | 'stepper' | undefined) => MainHT<boolean | undefined>,
    ) => lynxIpc.handle(modulesChannels.cardUpdateAvailable, callback),
    /** Handles uninstalling a card by ID */
    uninstallCardByID: (callback: (id: string) => MainHT<void>) =>
      lynxIpc.handle(modulesChannels.uninstallCardByID, callback),
  },
};

/**
 * IPC interface for module API.
 */
export const moduleApiIpc = {
  handle: {
    /** Gets the creation time of a folder */
    getFolderCreationTime: (callback: (dir: string) => MainHT<string>) =>
      lynxIpc.handle(moduleApiChannels.getFolderCreationTime, callback),
    /** Gets the last pull date of a git repository */
    getLastPulledDate: (callback: (dir: string) => MainHT<string>) =>
      lynxIpc.handle(moduleApiChannels.getLastPulledDate, callback),
    /** Gets the current release tag of a git repository */
    getCurrentReleaseTag: (callback: (dir: string) => MainHT<string>) =>
      lynxIpc.handle(moduleApiChannels.getCurrentReleaseTag, callback),
  },
};
