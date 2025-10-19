import {create} from 'zustand';

import {CardState} from '../../../../../cross/CrossTypes';
import {validateGitRepoUrl} from '../../../../../cross/CrossUtils';
import {LoadedCardData} from '../../../../../cross/plugin/ModuleTypes';

// Create a reusable function to generate a store
export const createCardStore = (initialData: LoadedCardData & {isInstalled: boolean; hasArguments: boolean}) => {
  return create<CardState>(set => ({
    // Static Info from props
    title: initialData.title,
    id: initialData.id,
    description: initialData.description,
    repoUrl: validateGitRepoUrl(initialData.repoUrl),
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
