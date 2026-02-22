import {useAppState} from '@lynx/redux/reducers/app';
import {OverflowBehavior} from 'overlayscrollbars';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {ReactNode} from 'react';

type Props = {
  children?: ReactNode;
  className?: string;
  /**
   * Overflow behavior for x and y axes.
   * Defaults to { x: 'hidden', y: 'scroll' }
   */
  overflow?: Partial<{
    x: OverflowBehavior;
    y: OverflowBehavior;
  }>;
};

/**
 * Custom scrollbar component wrapping OverlayScrollbars.
 * Adapts theme based on app state.
 */
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
