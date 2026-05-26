
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import { Sparkline } from "@/components/ui/sparkline";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  tone?: "success" | "warning" | "info" | "muted";
  sparkline?: number[];
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  className,
  tone = "info",
  sparkline,
}: StatCardProps) => {
  const isNumeric = typeof value === "number";

  const toneClassName = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info:    "bg-info/10 text-info",
    muted:   "bg-muted text-muted-foreground",
  }[tone];

  const indicatorClassName = {
    success: "bg-success",
    warning: "bg-warning",
    info:    "bg-info",
    muted:   "bg-muted-foreground",
  }[tone];

  const sparklineColor = {
    success: "success",
    warning: "warning",
    info:    "info",
    muted:   "primary",
  }[tone] as "success" | "warning" | "info" | "primary";

  return (
    <Card className={cn(
      "overflow-hidden rounded-lg border-border shadow-card transition-shadow duration-200 hover:shadow-card-hover",
      className,
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", indicatorClassName)} />
              <p className="truncate text-[12px] font-medium text-muted-foreground">{title}</p>
            </div>
            <h3 className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
              {isNumeric ? <AnimatedCounter value={value} /> : value}
            </h3>
            {description && (
              <p className="text-[11px] leading-5 text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneClassName)}>
              {icon}
            </div>
            {sparkline && sparkline.length >= 2 && (
              <Sparkline data={sparkline} color={sparklineColor} height={28} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
