import {useAppState} from '@lynx/redux/reducers/app';
import {OverflowBehavior} from 'overlayscrollbars';
import {OverlayScrollbarsComponent, OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {ReactNode, RefObject} from 'react';

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
  ref?: RefObject<OverlayScrollbarsComponentRef | null>;
};

/**
 * Custom scrollbar component wrapping OverlayScrollbars.
 * Adapts theme based on app state.
 */
export default function LynxScroll({children, className, overflow = {x: 'hidden', y: 'scroll'}, ref}: Props) {
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
      ref={ref}
      className={className}>
      {children}
    </OverlayScrollbarsComponent>
  );
}
