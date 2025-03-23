export type UpdatingCard = {id: string; devName: string; title: string};
export type UpdatingCards = UpdatingCard[];

export type RunningCard = {
  id: string;
  tabId: string;
  webUIAddress: string;
  customAddress: string;
  startTime: string;
  currentView: 'browser' | 'terminal';
};
