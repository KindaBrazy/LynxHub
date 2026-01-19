import {ReactNode} from 'react';

export type NavHistory = {
  canGoBack: boolean;
  canGoForward: boolean;
};

export type NavBtnProps = {icon?: ReactNode; onPress?: () => void; className?: string; isDisabled?: boolean};
