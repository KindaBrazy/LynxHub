export type UpdatingCard = {id: string; devName: string; title: string};
export type UpdatingCards = UpdatingCard[];

export type RunningCard = {
  isRunning: boolean;
  id: string;
  address: string;
  currentView: 'browser' | 'terminal';
  browserId: string;
};
