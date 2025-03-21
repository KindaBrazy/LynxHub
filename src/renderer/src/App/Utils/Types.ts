export type UpdatingCard = {id: string; devName: string; title: string};
export type UpdatingCards = UpdatingCard[];

export type RunningCard = {
  id: string;
  tabId: string;
  webUIAddress: string;
  startTime: Date;
  currentView: 'browser' | 'terminal';
};
