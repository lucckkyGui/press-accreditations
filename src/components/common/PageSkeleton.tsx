import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard, SkeletonStatCard, SkeletonTable } from "./SkeletonCard";

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <SkeletonCard lines={5} />
      <SkeletonCard lines={5} />
    </div>
  </div>
);

export const EventsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-40 rounded-xl" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-11 flex-1 max-w-sm rounded-xl" />
      <Skeleton className="h-9 w-24 rounded-xl" />
      <Skeleton className="h-9 w-24 rounded-xl" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} lines={4} />
      ))}
    </div>
  </div>
);

export const GuestsSkeleton = () => (
  <div className="space-y-6">
    <SkeletonCard lines={1} showIcon={false} />
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
    <SkeletonTable rows={8} columns={6} />
  </div>
);

export const GenericPageSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <SkeletonCard lines={6} />
  </div>
);
