import {CardState} from '@lynx_common/types';
import {LoadedCardData} from '@lynx_common/types/plugins/modules';
import {validateGitRepoUrl} from '@lynx_common/utils';
import {create} from 'zustand';

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
    type: initialData.type || 'unknown',

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
