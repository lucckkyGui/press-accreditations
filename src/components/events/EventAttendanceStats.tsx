
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EventAttendanceStatsProps {
  total: number;
  checkedIn: number;
  confirmed: number;
  invited: number;
  declined: number;
}

const EventAttendanceStats = ({
  total,
  checkedIn,
  confirmed,
  invited,
  declined,
}: EventAttendanceStatsProps) => {
  // Obliczanie procentów
  const checkedInPercent = Math.round((checkedIn / total) * 100) || 0;
  const confirmedPercent = Math.round((confirmed / total) * 100) || 0;
  const invitedPercent = Math.round((invited / total) * 100) || 0;
  const declinedPercent = Math.round((declined / total) * 100) || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Statystyki obecności</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Obecni</span>
            <span className="font-medium">{checkedIn} / {total} ({checkedInPercent}%)</span>
          </div>
          <Progress value={checkedInPercent} className="h-2 bg-muted" />
          <div className="h-1 w-full bg-green-500 rounded-full" style={{ width: `${checkedInPercent}%` }} />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Potwierdzeni</span>
            <span className="font-medium">{confirmed} / {total} ({confirmedPercent}%)</span>
          </div>
          <Progress value={confirmedPercent} className="h-2 bg-muted" />
          <div className="h-1 w-full bg-blue-500 rounded-full" style={{ width: `${confirmedPercent}%` }} />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Zaproszeni</span>
            <span className="font-medium">{invited} / {total} ({invitedPercent}%)</span>
          </div>
          <Progress value={invitedPercent} className="h-2 bg-muted" />
          <div className="h-1 w-full bg-amber-500 rounded-full" style={{ width: `${invitedPercent}%` }} />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Odrzuceni</span>
            <span className="font-medium">{declined} / {total} ({declinedPercent}%)</span>
          </div>
          <Progress value={declinedPercent} className="h-2 bg-muted" />
          <div className="h-1 w-full bg-red-500 rounded-full" style={{ width: `${declinedPercent}%` }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default EventAttendanceStats;
