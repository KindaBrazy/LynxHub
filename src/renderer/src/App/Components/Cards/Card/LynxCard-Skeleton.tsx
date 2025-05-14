import {Card, Skeleton} from '@heroui/react';

export default function LynxCardSkeleton() {
  return (
    <Card radius="lg" className="relative w-[17rem] h-[22rem] overflow-hidden">
      {/* Header image skeleton */}
      <Skeleton className="absolute top-0 left-0 right-0 h-24 z-0">
        <div className="h-24 w-full bg-default-300" />
      </Skeleton>

      {/* Options button */}
      <div className="absolute top-2 left-2 z-10">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
          <div className="size-4" />
        </div>
      </div>

      {/* Avatar skeleton */}
      <div className="relative flex flex-col items-center pt-12 z-10">
        <Skeleton className="rounded-full">
          <div className="h-16 w-16 rounded-full bg-default-300" />
        </Skeleton>
      </div>

      {/* Title skeleton */}
      <div className="flex flex-col items-center px-4 pt-3">
        <Skeleton className="rounded-lg w-3/4">
          <div className="h-6 rounded-lg bg-default-300" />
        </Skeleton>
      </div>

      {/* Description skeleton */}
      <div className="flex flex-col items-center px-4 pt-3">
        <Skeleton className="rounded-lg w-full">
          <div className="h-4 rounded-lg bg-default-200" />
        </Skeleton>
        <Skeleton className="rounded-lg w-4/5 mt-2">
          <div className="h-4 rounded-lg bg-default-200" />
        </Skeleton>
      </div>

      {/* Stats skeleton */}
      <div className="flex justify-center gap-8 px-4 pt-4">
        <div className="flex flex-col items-center">
          <Skeleton className="rounded-lg">
            <div className="h-5 w-10 rounded-lg bg-default-300" />
          </Skeleton>
          <Skeleton className="rounded-lg mt-1">
            <div className="h-4 w-12 rounded-lg bg-default-200" />
          </Skeleton>
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="rounded-lg">
            <div className="h-5 w-10 rounded-lg bg-default-300" />
          </Skeleton>
          <Skeleton className="rounded-lg mt-1">
            <div className="h-4 w-12 rounded-lg bg-default-200" />
          </Skeleton>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
        <Skeleton className="w-full rounded-lg">
          <div className="h-10 w-full rounded-lg bg-default-300" />
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-10 w-10 rounded-lg bg-default-300" />
        </Skeleton>
      </div>
    </Card>
  );
}
