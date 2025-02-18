import {makeAutoObservable} from 'mobx';
import {createContext, useContext} from 'react';

import {validateGitRepoUrl} from '../../../../../cross/CrossUtils';
import {DiscordRunningAI} from '../../../../../cross/IpcChannelAndTypes';
import {CardData} from '../../Modules/types';

export const CardContext = createContext<CardsDataManager | null>(null);

/** MobX state manager for cards */
export class CardsDataManager {
  /* ----------------------------- Card Information's ----------------------------- */

  title: string = '';
  id: string = '';
  description: string = '';
  repoUrl: string = '';
  bgUrl: string = '';
  extensionsDir?: string;
  haveArguments: boolean;
  type: DiscordRunningAI['type'] = undefined;

  /* ----------------------------- Card States ----------------------------- */

  installed: boolean = false;
  menuIsOpen: boolean = false;

  checkingForUpdate: boolean = false;

  /* ----------------------------- Constructor ----------------------------- */

  constructor(data: CardData, isInstalled: boolean) {
    this.title = data.title;
    this.id = data.id;
    this.description = data.description;
    this.repoUrl = validateGitRepoUrl(data.repoUrl);
    this.bgUrl = data.bgUrl;
    this.extensionsDir = data.extensionsDir;
    this.type = data.type;
    this.haveArguments = !!data.arguments;

    this.installed = isInstalled;

    makeAutoObservable(this);
  }

  /* ----------------------------- States ----------------------------- */

  setMenuIsOpen = (menuIsOpen: boolean) => {
    this.menuIsOpen = menuIsOpen;
  };

  setCheckingForUpdate = (checking: boolean) => {
    this.checkingForUpdate = checking;
  };
}

export const useCardData = () => useContext(CardContext) as CardsDataManager;
