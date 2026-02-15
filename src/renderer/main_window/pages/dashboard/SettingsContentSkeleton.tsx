import {Card, CardBody, CardHeader, Skeleton} from '@heroui/react';
import {ContainersBg} from '@lynx/utils/commonStyles';

const SettingsContentSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-4">
      {/* First Section */}
      <SettingsSectionSkeleton itemCount={3} />

      {/* Second Section */}
      <SettingsSectionSkeleton itemCount={5} />

      {/* Third Section */}
      <SettingsSectionSkeleton itemCount={4} />
    </div>
  );
};

/** Skeleton for a settings section card with header and items */
const SettingsSectionSkeleton = ({itemCount}: {itemCount: number}) => {
  return (
    <Card className={`w-full ${ContainersBg} border-1 border-foreground-100`}>
      {/* Section Header */}
      <CardHeader className="flex flex-row items-center justify-center gap-x-2">
        <Skeleton className="size-5 rounded-lg" />
        <Skeleton className="w-32 h-5 rounded-lg" />
      </CardHeader>

      {/* Section Body with Setting Items */}
      <CardBody className="flex flex-col gap-y-3">
        {Array.from({length: itemCount}).map((_, index) => (
          <SettingItemSkeleton key={index} />
        ))}
      </CardBody>
    </Card>
  );
};

/** Skeleton for a single setting item with title, description, and toggle */
const SettingItemSkeleton = () => {
  return (
    <div
      className={
        'inline-flex w-full max-w-full flex-row-reverse items-center justify-between' +
        ' gap-2 rounded-lg border-2 border-transparent bg-foreground-100' +
        ' px-4 py-2.5 transition duration-300 hover:bg-foreground-50'
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
};

export default SettingsContentSkeleton;
