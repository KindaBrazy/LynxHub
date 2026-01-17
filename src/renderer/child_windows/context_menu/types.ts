import {Dispatch, ReactNode, SetStateAction} from 'react';

import {MenuTypes} from './consts';

export type SetWidthSize = Dispatch<SetStateAction<'sm' | 'md' | 'lg'>>;

export type CommonProps = {
  setWidthSize: SetWidthSize;
  setSelectedLayout: Dispatch<SetStateAction<MenuTypes>>;
  show: boolean;
};

export type NavHistory = {
  canGoBack: boolean;
  canGoForward: boolean;
};

export type NavBtnProps = {icon?: ReactNode; onPress?: () => void; className?: string; isDisabled?: boolean};
