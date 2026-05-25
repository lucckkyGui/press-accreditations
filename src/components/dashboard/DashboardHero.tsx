/**
 * DashboardHero.tsx — powitanie + meta dnia + akcje.
 *
 * Use case: top of /dashboard.
 *
 * Props są opcjonalne — komponent sam zrobi sensowne fallbacki.
 *
 * Wzorzec wizualny: artboard "Dashboard · real-time" z mockupu.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Plus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveEventLike {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

interface DashboardHeroProps {
  userName?: string;
  activeEvent?: ActiveEventLike | null;
  upcomingEvent?: ActiveEventLike | null;
  pendingCount?: number;
}

const WEEKDAY = ["NIEDZIELA", "PONIEDZIAŁEK", "WTOREK", "ŚRODA", "CZWARTEK", "PIĄTEK", "SOBOTA"];
const MONTH = ["STYCZNIA", "LUTEGO", "MARCA", "KWIETNIA", "MAJA", "CZERWCA", "LIPCA", "SIERPNIA", "WRZEŚNIA", "PAŹDZIERNIKA", "LISTOPADA", "GRUDNIA"];

function formatToday(d = new Date()) {
  return `${WEEKDAY[d.getDay()]} · ${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDelta(targetIso: string) {
  const t = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = t - now;
  if (diff < 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d} ${d === 1 ? "dzień" : d < 5 ? "dni" : "dni"} ${h % 24} godz`;
  }
  return `${h} godz ${m.toString().padStart(2, "0")} min`;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  userName = "tam",
  activeEvent,
  upcomingEvent,
  pendingCount = 0,
}) => {
  const heroEvent = activeEvent ?? upcomingEvent ?? null;
  const isLive = !!activeEvent;
  const delta = heroEvent ? formatDelta(heroEvent.start_date) : null;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="mono text-[11px] tracking-wider text-muted-foreground">
            {formatToday()}
          </span>
          {isLive && (
            <span className="chip chip-ok">
              <span className="chip-dot pulse-live" />
              <span className="mono">LIVE</span>
            </span>
          )}
        </div>

        <h1 className="display text-3xl md:text-4xl m-0">
          Dzień dobry, {userName}
        </h1>

        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          {heroEvent ? (
            <>
              <span className="text-foreground font-medium">{heroEvent.title}</span>{" "}
              {isLive ? (
                <>jest w trakcie. </>
              ) : delta ? (
                <>startuje za <span className="text-foreground">{delta}</span>. </>
              ) : (
                <>jest w kalendarzu. </>
              )}
              {pendingCount > 0 && (
                <>
                  Zostało <span className="text-warning">{pendingCount} {pendingCount === 1 ? "akredytacja" : pendingCount < 5 ? "akredytacje" : "akredytacji"} do zatwierdzenia</span>.
                </>
              )}
            </>
          ) : (
            "Utwórz pierwsze wydarzenie, aby odblokować listę gości, zaproszenia i check-in."
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button asChild variant="outline" className="rounded-md gap-1.5">
          <Link to="/scanner">
            <QrCode className="h-3.5 w-3.5" />
            Skaner QR
            <span className="kbd ml-1">S</span>
          </Link>
        </Button>
        <Button asChild className="rounded-md gap-1.5 bg-foreground text-background hover:bg-foreground/90">
          <Link to="/events?new=1">
            <Plus className="h-3.5 w-3.5" />
            Nowe wydarzenie
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHero;
