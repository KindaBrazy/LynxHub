import React, {ComponentPropsWithoutRef, CSSProperties} from 'react';

/**
 * Props for the Ripple component.
 */
interface RippleProps extends ComponentPropsWithoutRef<'div'> {
  /** Size of the innermost circle in pixels. Default is 210. */
  mainCircleSize?: number;
  /** Opacity of the innermost circle. Default is 0.24. */
  mainCircleOpacity?: number;
  /** Number of concentric circles to render. Default is 8. */
  numCircles?: number;
}

/**
 * Ripple component renders a set of expanding, fading concentric circles.
 * It uses CSS animations for the ripple effect.
 */
export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={[
        'pointer-events-none absolute inset-0 select-none mask-[linear-gradient(to_bottom,white,transparent)]',
        className,
      ].join(' ')}
      {...props}>
      {Array.from({length: numCircles}, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = 'solid';
        return (
          <div
            style={
              {
                '--i': i,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
              } as CSSProperties
            }
            key={i}
            className={`absolute animate-ripple rounded-full border border-black bg-foreground/25 shadow-xl`}
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = 'Ripple';

export type {RippleProps};
