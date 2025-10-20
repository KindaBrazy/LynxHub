import {ReactNode} from 'react';

export type UpdatingCard = {id: string; devName: string; title: string};
export type UpdatingCards = UpdatingCard[];

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

export type HeroToastPlacement =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left'
  | 'top-center';

export type NavItem = {
  title: string;
  icon: ReactNode;
  onClick?: () => void;
  badge?: ReactNode | boolean;
  path: string;
};
