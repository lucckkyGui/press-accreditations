import React from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  color?: "primary" | "success" | "warning" | "destructive" | "info";
  height?: number;
}

const colorMap = {
  primary:     "hsl(var(--primary))",
  success:     "hsl(var(--success))",
  warning:     "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  info:        "hsl(var(--info))",
};

const Sparkline = ({
  data,
  className,
  color = "primary",
  height = 32,
}: SparklineProps) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + ((max - v) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const stroke = colorMap[color];
  const fillId = `spark-fill-${color}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`${points.join(" ")} ${width - pad},${height} ${pad},${height}`}
        fill={`url(#${fillId})`}
      />
      {/* Line */}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {(() => {
        const last = points[points.length - 1].split(",");
        return (
          <circle
            cx={last[0]}
            cy={last[1]}
            r="2"
            fill={stroke}
          />
        );
      })()}
    </svg>
  );
};

export { Sparkline };
