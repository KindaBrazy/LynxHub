import {LoadedCardData} from '@lynx_module/types';
import {create} from 'zustand';

import {validateGitRepoUrl} from '../../../../../cross/CrossUtils';
import {DiscordRunningAI} from '../../../../../cross/IpcChannelAndTypes';

// Define the state and actions
export interface CardState {
  title: string;
  id: string;
  description: string;
  repoUrl: string;
  bgUrl: string;
  extensionsDir?: string;
  haveArguments: boolean;
  type: DiscordRunningAI['type'];

  installed: boolean;
  menuIsOpen: boolean;

  checkingForUpdate: boolean;

  setMenuIsOpen: (isOpen: boolean) => void;
  setCheckingForUpdate: (isChecking: boolean) => void;
}

// Create a reusable function to generate a store
export const createCardStore = (initialData: LoadedCardData & {isInstalled: boolean; hasArguments: boolean}) => {
  return create<CardState>(set => ({
    // Static Info from props
    title: initialData.title,
    id: initialData.id,
    description: initialData.description,
    repoUrl: validateGitRepoUrl(initialData.repoUrl),
    bgUrl: initialData.bgUrl,
    extensionsDir: initialData.extensionsDir,
    haveArguments: initialData.hasArguments,
    type: initialData.type,

    // Component State
    menuIsOpen: false,
    checkingForUpdate: false,
    installed: initialData.isInstalled,

    // Actions that modify the state
    setMenuIsOpen: isOpen => set({menuIsOpen: isOpen}),
    setCheckingForUpdate: isChecking => set({checkingForUpdate: isChecking}),
  }));
};

// We will use this type for our React Context
export type CardStore = ReturnType<typeof createCardStore>;
