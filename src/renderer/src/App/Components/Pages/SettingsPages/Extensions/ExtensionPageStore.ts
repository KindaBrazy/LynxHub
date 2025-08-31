import {create} from 'zustand';

import {ExtensionPageState} from './ExtensionPageTypes';

export const createExtensionStore = () => {
  return create<ExtensionPageState>((set, get) => ({
    unInstalling: new Set<string>([]),
    updating: new Set<string>([]),
    installing: new Set<string>([]),

    getHasId: (key, id) => (id ? get()[key].has(id) : false),

    manageSet: (key, id, operation) => {
      if (!id) return;
      set(state => {
        // Create a new set from the current state to avoid direct mutation
        const newSet = new Set(state[key]);
        if (operation === 'add') {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        // Return the updated state object
        return {[key]: newSet};
      });
    },
  }));
};

// We will use this type for our React Context
export type ExtensionPageStore = ReturnType<typeof createExtensionStore>;
