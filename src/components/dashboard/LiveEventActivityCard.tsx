/**
 * LiveEventActivityCard.tsx — bohaterska karta z aktywnym eventem.
 *
 * Wzorzec wizualny: artboard "Dashboard · real-time" prawa-środkowa karta.
 *
 * Composes:
 *   - LIVE chip
 *   - 4 mini-KPI w jednym pasku
 *   - Activity feed (last 8-9 scans / approvals / denials)
 *
 * Jeśli brak aktywnego eventu — renderuje empty state.
 */

import React from "react";
import { ArrowRight } from "lucide-react";

export interface ActivityFeedItem {
  ts: string;                                  // "16:42:18"
  kind: "checkin" | "denied" | "approved" | "queue";
  message: string;
  meta?: string;
}

interface ActiveEventLike {
  id: string;
  title: string;
  location?: string | null;
}

interface LiveEventActivityCardProps {
  event?: ActiveEventLike | null;
  accreditationsApproved?: number;
  accreditationsCapacity?: number;
  checkedIn?: number;
  inQueue?: number;
  denials?: number;
  feed?: ActivityFeedItem[];
  onOpenEvent?: () => void;
}

const KIND_COLOR: Record<ActivityFeedItem["kind"], string> = {
  checkin:  "bg-success",
  denied:   "bg-destructive",
  approved: "bg-primary",
  queue:    "bg-warning",
};

const KIND_LABEL: Record<ActivityFeedItem["kind"], string> = {
  checkin:  "CHECKIN",
  denied:   "DENIED",
  approved: "APPROVED",
  queue:    "QUEUE",
};

const LiveEventActivityCard: React.FC<LiveEventActivityCardProps> = ({
  event,
  accreditationsApproved = 0,
  accreditationsCapacity = 0,
  checkedIn = 0,
  inQueue = 0,
  denials = 0,
  feed = [],
  onOpenEvent,
}) => {
  if (!event) {
    return (
      <div className="card-glow rounded-xl flex flex-col items-center justify-center text-center py-14 px-6">
        <div className="relative w-16 h-16 mb-4 grid place-items-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-accent opacity-15 blur-xl" />
          <div className="relative w-12 h-12 rounded-lg border-2 border-dashed border-border bg-muted/30 grid place-items-center text-muted-foreground">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" />
            </svg>
          </div>
        </div>
        <h3 className="text-base font-semibold text-foreground">Brak aktywnego wydarzenia</h3>
        <p className="serif-italic text-sm text-muted-foreground mt-1">ale to się zaraz zmieni.</p>
        <p className="text-[12px] text-muted-foreground mt-2 max-w-xs">
          Gdy event się rozpocznie, zobaczysz tutaj feed check-inów i odrzuceń w czasie rzeczywistym.
        </p>
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border flex items-center gap-3">
        <span className="chip chip-ok">
          <span className="chip-dot pulse-live" />
          <span className="mono">LIVE</span>
        </span>
        <div className="text-[13.5px] font-medium text-foreground truncate">{event.title}</div>
        {event.location && (
          <div className="mono text-[11px] text-muted-foreground truncate">· {event.location}</div>
        )}
        <div className="flex-1" />
        <button
          onClick={onOpenEvent}
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Otwórz <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      {/* KPI strip */}
      <div className="px-4 py-3 border-b border-border grid grid-cols-4 gap-0">
        <Kpi
          label="Akredytowani"
          value={accreditationsApproved.toLocaleString("pl-PL")}
          sub={accreditationsCapacity > 0 ? `/ ${accreditationsCapacity.toLocaleString("pl-PL")}` : undefined}
        />
        <Kpi
          label="Check-in"
          value={checkedIn.toLocaleString("pl-PL")}
          sub={accreditationsApproved ? `${Math.round((checkedIn / accreditationsApproved) * 100)}%` : undefined}
          divider
        />
        <Kpi label="W kolejce" value={inQueue.toLocaleString("pl-PL")} sub="≈ 4 min" divider />
        <Kpi
          label="Odrzucenia"
          value={denials.toLocaleString("pl-PL")}
          sub={checkedIn + denials ? `${((denials / (checkedIn + denials)) * 100).toFixed(1)}%` : "0%"}
          divider
        />
      </div>

      {/* Activity feed header */}
      <div className="px-4 pt-3 pb-1 flex items-center">
        <span className="mono text-[11px] tracking-wider uppercase text-muted-foreground">
          Aktywność · {feed[0]?.ts ?? "—"}
        </span>
        <div className="flex-1" />
        <span className="mono text-[10.5px] text-muted-foreground/70">↻ co 1s</span>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-auto px-4 pb-3 min-h-[260px]">
        {feed.length === 0 ? (
          <div className="text-[12px] text-muted-foreground text-center py-12">
            Czekamy na pierwszy skan…
          </div>
        ) : (
          feed.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[80px_16px_1fr_auto] gap-2.5 items-center py-1.5 border-t border-border/60 first:border-t-0"
            >
              <span className="mono text-[11px] text-muted-foreground tabular-nums">{row.ts}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${KIND_COLOR[row.kind]} shadow-[0_0_8px_currentColor]`} />
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-[13px] font-medium text-foreground truncate">{row.message}</span>
                {row.meta && <span className="text-[12px] text-muted-foreground truncate">{row.meta}</span>}
              </div>
              <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {KIND_LABEL[row.kind]}
              </span>
            </div>
          ))
        )}
      </div>
    </article>
  );
};

function Kpi({
  label,
  value,
  sub,
  divider = false,
}: {
  label: string;
  value: string;
  sub?: string;
  divider?: boolean;
}) {
  return (
    <div className={divider ? "pl-4 border-l border-border/60" : ""}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="mono text-[22px] text-foreground leading-none tracking-tight">{value}</span>
        {sub && <span className="mono text-[11px] text-muted-foreground/70">{sub}</span>}
      </div>
    </div>
  );
}

export default LiveEventActivityCard;
