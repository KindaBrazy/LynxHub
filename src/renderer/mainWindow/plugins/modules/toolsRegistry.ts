import {ComponentType, ReactNode} from 'react';

export interface RegisteredToolsCard {
  id: string;
  title: string;
  description: string;
  icon?: string | ReactNode;
  onPress?: () => void;
  component?: ComponentType;
  where?: string;
}

const registry = new Map<string, RegisteredToolsCard>();
const listeners = new Set<() => void>();
let cachedList: RegisteredToolsCard[] = [];

export const toolsCardRegistry = {
  register(card: RegisteredToolsCard) {
    registry.set(card.id, card);
    cachedList = Array.from(registry.values());
    this.notify();
  },
  get(id: string): RegisteredToolsCard | undefined {
    return registry.get(id);
  },
  getAll(): RegisteredToolsCard[] {
    return cachedList;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  notify() {
    for (const listener of listeners) {
      listener();
    }
  },
};
