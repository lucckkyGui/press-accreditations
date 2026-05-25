
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Activity {
  id: string;
  guestName: string;
  avatarUrl?: string;
  action: string;
  time: string;
  zone?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Ostatnia aktywność</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.avatarUrl} />
              <AvatarFallback>
                {activity.guestName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{activity.guestName}</p>
              <p className="text-xs text-muted-foreground">
                {activity.action}
                {activity.zone && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-xs rounded-full 
                    ${
                      activity.zone === "vip" 
                        ? "bg-amber-100 text-amber-700"
                        : activity.zone === "press"
                        ? "bg-blue-100 text-blue-700" 
                        : activity.zone === "staff"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {activity.zone}
                  </span>
                )}
              </p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {activity.time}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
