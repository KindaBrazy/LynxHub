import {Skeleton} from '@heroui/react';

const SettingsContentSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="space-y-3">
        <Skeleton className="w-40 h-6 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="w-full h-10 rounded-lg" />
          <Skeleton className="w-5/6 h-4 rounded-lg" />
          <Skeleton className="w-2/3 h-4 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="w-32 h-6 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="w-full h-10 rounded-lg" />
          <Skeleton className="w-full h-10 rounded-lg" />
          <Skeleton className="w-3/4 h-4 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="w-32 h-6 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="w-full h-10 rounded-lg" />
          <Skeleton className="w-full h-10 rounded-lg" />
          <Skeleton className="w-3/4 h-4 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default SettingsContentSkeleton;
