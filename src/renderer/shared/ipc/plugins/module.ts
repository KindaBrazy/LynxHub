import modulesChannels, {moduleApiChannels} from '@lynx_common/consts/ipc_channels/module';
import {InstalledCard} from '@lynx_common/types/storage';

import lynxIpc from '../lynxIpc';

const moduleIpc = {
  // Checks if card has available updates
  cardUpdateAvailable: (card: InstalledCard, updateType: 'git' | 'stepper' | undefined) =>
    lynxIpc.invoke<boolean>(modulesChannels.cardUpdateAvailable, card, updateType),

  // Uninstalls card by ID
  uninstallCardByID: (id: string) => lynxIpc.invoke<void>(modulesChannels.uninstallCardByID, id),

  // Checks for updates on multiple cards at intervals
  checkCardsUpdateInterval: (updateType: {id: string; type: 'git' | 'stepper'}[]) =>
    lynxIpc.send(modulesChannels.checkCardsUpdateInterval, updateType),

  // Listens for card update availability events
  onCardsUpdateAvailable: (result: (cards: string[]) => void) =>
    lynxIpc.on(modulesChannels.onCardsUpdateAvailable, result),
};

export const moduleApiIpc = {
  // Gets folder creation date
  getFolderCreationTime: (dir: string) => lynxIpc.invoke<string>(moduleApiChannels.getFolderCreationTime, dir),

  // Gets last Git pull date for repository
  getLastPulledDate: (dir: string) => lynxIpc.invoke<string>(moduleApiChannels.getLastPulledDate, dir),

  // Gets current Git release tag
  getCurrentReleaseTag: (dir: string) => lynxIpc.invoke<string>(moduleApiChannels.getCurrentReleaseTag, dir),
};

export default moduleIpc;
