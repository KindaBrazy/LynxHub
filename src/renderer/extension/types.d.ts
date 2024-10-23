import {ComponentProps, ReactNode} from 'react';

export type ElementProps = ComponentProps<'div'>;
type ElementComp = (props: ElementProps) => ReactNode;

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
