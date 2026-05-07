import {Card, Skeleton} from '@heroui/react';
import {memo} from 'react';

/**
 * Skeleton loader for the Dashboard page.
 * Displays a placeholder structure while content is loading.
 */
const DashboardSkeleton = memo(() => {
  return (
    <div className="flex flex-col gap-y-4">
      {/* First Section */}
      <SectionSkeleton itemCount={3} />

      {/* Second Section */}
      <SectionSkeleton itemCount={5} />

      {/* Third Section */}
      <SectionSkeleton itemCount={4} />
    </div>
  );
});

DashboardSkeleton.displayName = 'DashboardSkeleton';

/** Skeleton for a settings section card with header and items */
const SectionSkeleton = memo(({itemCount}: {itemCount: number}) => {
  return (
    <Card className="w-full" variant="secondary">
      {/* Section Header */}
      <Card.Header className="flex flex-row items-center justify-center gap-x-2">
        <Skeleton className="size-5 rounded-lg" />
        <Skeleton className="w-32 h-5 rounded-lg" />
      </Card.Header>

      {/* Section Body with Setting Items */}
      <Card.Content className="flex flex-col gap-y-3">
        {Array.from({length: itemCount}).map((_, index) => (
          <ItemSkeleton key={index} />
        ))}
      </Card.Content>
    </Card>
  );
});

SectionSkeleton.displayName = 'SectionSkeleton';

/** Skeleton for a single setting item with title, description, and toggle */
const ItemSkeleton = memo(() => {
  return (
    <div
      className={
        'inline-flex w-full max-w-full flex-row-reverse items-center justify-between' +
        ' gap-2 rounded-lg border-2 border-transparent bg-surface-secondary' +
        ' px-4 py-2.5 transition duration-300 hover:bg-surface'
      }>
      {/* Right side: Toggle Switch */}
      <Skeleton className="h-3.5 w-10 shrink-0 rounded-full" />

      {/* Left side: Title and Description */}
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-3.5 w-48 rounded-lg" />
        <Skeleton className="h-3 w-full max-w-2xl rounded-lg" />
      </div>
    </div>
  );
});

ItemSkeleton.displayName = 'ItemSkeleton';

export default DashboardSkeleton;
