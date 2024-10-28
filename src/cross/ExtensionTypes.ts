import {ComponentProps, ReactNode} from 'react';

export type ElementProps = ComponentProps<'div'>;
export type ElementComp = (props: ElementProps) => ReactNode;

export type ContainerElements = {
  start: ElementComp[];
  center: ElementComp[];
  end: ElementComp[];
};

export type StatusBarComponent = {
  Container?: (elements: ContainerElements) => ReactNode;
  Start?: ElementComp;
  Center?: ElementComp;
  End?: ElementComp;
};

export type TitleBarComponent = {
  AddStart?: ElementComp;

  ReplaceCenter?: ElementComp;
  AddCenter?: ElementComp;

  ReplaceEnd?: ElementComp;
  AddEnd?: ElementComp;
};
