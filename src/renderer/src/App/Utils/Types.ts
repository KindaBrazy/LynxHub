import {DropdownItemProps} from '@nextui-org/react';

export type DropDownSectionType = {
  key: string;
  title?: string;
  showDivider?: boolean;
  items: DropdownItemProps[];
};

export type UpdatingCard = {id: string; devName: string; title: string};
export type UpdatingCards = UpdatingCard[];

export type RunningCard = {
  isRunning: boolean;
  id: string;
  address: string;
  currentView: 'browser' | 'terminal';
  browserId: string;
};
