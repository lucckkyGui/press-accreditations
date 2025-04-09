
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center flex-wrap gap-2">
          <span>Statystyki obecności</span>
          <span className="text-sm font-normal text-muted-foreground">
            Łącznie: {total} osób
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Obecni</span>
            </div>
            <span className="font-medium">{checkedIn} / {total} ({checkedInPercent}%)</span>
          </div>
          <Progress value={checkedInPercent} className="h-2 bg-muted" />
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              <span>Potwierdzeni</span>
            </div>
            <span className="font-medium">{confirmed} / {total} ({confirmedPercent}%)</span>
          </div>
          <Progress value={confirmedPercent} className="h-2 bg-muted" />
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
              <span>Zaproszeni</span>
            </div>
            <span className="font-medium">{invited} / {total} ({invitedPercent}%)</span>
          </div>
          <Progress value={invitedPercent} className="h-2 bg-muted" />
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span>Odrzuceni</span>
            </div>
            <span className="font-medium">{declined} / {total} ({declinedPercent}%)</span>
          </div>
          <Progress value={declinedPercent} className="h-2 bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
};

export default EventAttendanceStats;
