import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
  showIcon?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  lines = 3,
  showHeader = true,
  showIcon = true,
}) => (
  <Card className={cn("rounded-2xl border-border", className)}>
    {showHeader && (
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        {showIcon && <Skeleton className="h-10 w-10 rounded-xl shrink-0" />}
      </CardHeader>
    )}
    <CardContent className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${85 - i * 12}%` }} />
      ))}
    </CardContent>
  </Card>
);

interface SkeletonStatCardProps {
  className?: string;
}

export const SkeletonStatCard: React.FC<SkeletonStatCardProps> = ({ className }) => (
  <Card className={cn("overflow-hidden rounded-2xl border-border", className)}>
    <CardContent className="p-5">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      </div>
    </CardContent>
  </Card>
);

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => (
  <div className={cn("space-y-3", className)}>
    <div className="flex gap-4 pb-2 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 py-2">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonCard;
