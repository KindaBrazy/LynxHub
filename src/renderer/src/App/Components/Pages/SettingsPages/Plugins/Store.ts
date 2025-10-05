import {isArray} from 'lodash';
import {create} from 'zustand';

import {ExtensionPageState} from './Types';

export const createExtensionStore = () => {
  return create<ExtensionPageState>(set => ({
    unInstalling: new Set<string>([]),
    updating: new Set<string>([]),
    installing: new Set<string>([]),

    selectedPlugin: undefined,
    setSelectedPlugin: selectedPlugin => set({selectedPlugin}),

    updatingAll: false,
    setUpdatingAll: updatingAll => set({updatingAll}),

    manageSet: (key, id, operation) => {
      if (!id) return;
      set(state => {
        // Create a new set from the current state to avoid direct mutation
        const newSet = new Set(state[key]);
        if (operation === 'add') {
          if (isArray(id)) {
            id.forEach(id => newSet.add(id));
          } else {
            newSet.add(id);
          }
        } else {
          if (isArray(id)) {
            id.forEach(id => newSet.delete(id));
          } else {
            newSet.delete(id);
          }
        }
        // Return the updated state object
        return {[key]: newSet};
      });
    },
  }));
};

// We will use this type for our React Context
export type Store = ReturnType<typeof createExtensionStore>;
