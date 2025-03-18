export type UpdatingCard = {id: string; devName: string; title: string};
export type UpdatingCards = UpdatingCard[];

export type RunningCard = {
  id: string;
  tabId: string;
  webUIAddress: string;
  currentView: 'browser' | 'terminal';
};
