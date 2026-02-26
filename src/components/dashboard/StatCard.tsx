
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  className,
  trend,
}: StatCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-border/60",
      className
    )}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground tracking-wide">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground/80 flex items-center gap-1">
                {trend === "up" && <span className="text-emerald-500">↑</span>}
                {trend === "down" && <span className="text-red-400">↓</span>}
                {description}
              </p>
            )}
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            {icon}
          </div>
        </div>
      </CardContent>
      {/* Bottom accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
};

export default StatCard;
