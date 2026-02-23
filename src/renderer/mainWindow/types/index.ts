import type {ReactNode} from 'react';

/**
 * Metadata for a card that is currently being updated.
 */
export type UpdatingCard = {id: string; devName: string; title: string};

/**
 * Collection of cards that are currently being updated.
 */
export type UpdatingCards = UpdatingCard[];

/**
 * Runtime session state for a launched card instance.
 */
export type RunningCard = {
  id: string;
  tabId: string;
  webUIAddress: string;
  customAddress: string;
  currentAddress: string;
  startTime: string;
  currentView: 'browser' | 'terminal';
  type: 'browser' | 'terminal' | 'both';
  isEmptyRunning: boolean;
  browserTitle: string;
};

/**
 * Navigation entry used by the main window dock.
 */
export type NavItem = {
  title: string;
  icon: ReactNode;
  badge?: ReactNode | boolean;
  path: string;
};
