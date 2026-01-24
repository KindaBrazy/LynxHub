import {useAppState} from '@lynx/redux/reducers/app';
import {OverflowBehavior} from 'overlayscrollbars';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {ReactNode} from 'react';

type Props = {
  children?: ReactNode;
  className?: string;
  overflow?: Partial<{
    x: OverflowBehavior;
    y: OverflowBehavior;
  }>;
};
export default function LynxScroll({children, className, overflow = {x: 'hidden', y: 'scroll'}}: Props) {
  const isDarkMode = useAppState('darkMode');

  return (
    <OverlayScrollbarsComponent
      options={{
        overflow,
        scrollbars: {
          autoHide: 'leave',
          theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
        },
      }}
      className={className}>
      {children}
    </OverlayScrollbarsComponent>
  );
}
