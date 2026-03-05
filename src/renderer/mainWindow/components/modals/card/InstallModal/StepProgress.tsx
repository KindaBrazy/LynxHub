import {cn, Spinner} from '@heroui/react';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {memo, ReactNode, useEffect, useRef} from 'react';

import {useHasScroll} from '../../../../utils/hooks';

type StepItem = {
  key: string | number;
  title: ReactNode;
};

interface StepProgressProps {
  items: StepItem[];
  current: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  titleClassName?: string;
}

function getStatus(index: number, current: number): 'complete' | 'current' | 'upcoming' {
  if (index < current) return 'complete';
  if (index === current) return 'current';
  return 'upcoming';
}

function StepIndicator({status}: {status: 'complete' | 'current' | 'upcoming'}) {
  if (status === 'current') {
    return (
      <div className="flex size-5 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
        <Spinner size="sm" color="primary" />
      </div>
    );
  }

  if (status === 'complete') {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-success/20 text-success">
        <CheckRead className="size-4" />
      </div>
    );
  }

  return <div className="size-5 rounded-full border border-foreground-300 bg-foreground-200/30" />;
}

function StepProgress({items, current, orientation = 'horizontal', className, titleClassName}: StepProgressProps) {
  const {hasScroll, containerRef, setContainerRef} = useHasScroll();
  const currentActiveItem = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const item = currentActiveItem.current;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            if (hasScroll && item && containerRef) {
              const offsetLeft = item.offsetLeft;
              containerRef.scrollTo({behavior: 'smooth', left: offsetLeft});
            }
          }
        });
      },
      {root: containerRef},
    );

    if (item) observer.observe(item);

    return () => observer.disconnect();
  }, [current, hasScroll]);

  if (items.length === 0) return null;

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-3', className)}>
        {items.map((item, index) => {
          const status = getStatus(index, current);

          return (
            <div key={item.key} className="flex items-start gap-3">
              <div className="pt-0.5">
                <StepIndicator status={status} />
              </div>
              <div className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    'truncate text-sm',
                    status === 'complete' && 'text-foreground-500',
                    status === 'current' && 'font-semibold text-foreground-700 dark:text-foreground-200',
                    status === 'upcoming' && 'text-foreground-600',
                    titleClassName,
                  )}>
                  {item.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={setContainerRef} className={cn('overflow-x-scroll scrollbar-hide px-1 py-1', className)}>
      <div className="flex min-w-max items-start">
        {items.map((item, index) => {
          const status = getStatus(index, current);
          const isLast = index === items.length - 1;

          return (
            <div
              ref={node => {
                if (status === 'current') {
                  currentActiveItem.current = node;
                }
              }}
              key={item.key}
              className="flex items-start">
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <StepIndicator status={status} />
                <span
                  className={cn(
                    'truncate text-center text-xs',
                    status === 'complete' && 'text-foreground/40',
                    status === 'current' && 'font-bold text-foreground/85',
                    status === 'upcoming' && 'text-foreground/70',
                    titleClassName,
                  )}
                  title={typeof item.title === 'string' ? item.title : undefined}>
                  {item.title}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mx-2 mt-2.5 h-px w-12 sm:w-20',
                    index < current ? 'bg-success/50' : 'bg-foreground-300/60',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(StepProgress);
