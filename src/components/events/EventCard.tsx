
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Bell, Edit, ArrowRight, Copy } from "lucide-react";
import { Event } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { pl } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  guestCount?: number;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onViewDetails?: (eventId: string) => void;
  onGoToNotifications?: (eventId: string) => void;
}

const EventCard = ({ 
  event, 
  guestCount = 0, 
  onView, 
  onEdit,
  onViewDetails,
  onGoToNotifications
}: EventCardProps) => {
  const timeToEvent = formatDistanceToNow(new Date(event.startDate), {
    addSuffix: true,
    locale: pl,
  });

  const now = new Date();
  const eventDate = new Date(event.startDate);
  let eventStatus = "nadchodzące";
  let statusClass = "bg-info/10 text-info border-info/20";
  
  if (eventDate < now) {
    eventStatus = "przeszłe";
    statusClass = "bg-muted text-muted-foreground border-border";
  } else if (Math.abs(eventDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
    eventStatus = "dzisiaj";
    statusClass = "bg-destructive/10 text-destructive border-destructive/20";
  }

  return (
    <Card className="group w-full overflow-hidden rounded-2xl border-0 bg-card shadow-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Top gradient accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-secondary" />
      
      <CardHeader className="pb-2 pt-5">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold line-clamp-1 text-foreground">{event.name}</CardTitle>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {event.isPublished ? (
              <Badge className="bg-success/10 text-success border-success/20 border text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                Opublikowane
              </Badge>
            ) : (
              <Badge className="bg-warning/10 text-warning border-warning/20 border text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                Szkic
              </Badge>
            )}
            <Badge className={`${statusClass} border text-[10px] font-semibold px-2 py-0.5 rounded-lg`}>
              {eventStatus}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-1.5 text-muted-foreground text-sm">{event.description}</CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center text-muted-foreground">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 mr-2.5 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-medium text-foreground">{format(new Date(event.startDate), "d MMMM yyyy, HH:mm", { locale: pl })}</span>
          </div>
          {event.location && (
            <div className="flex items-center text-muted-foreground">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-secondary/10 mr-2.5 shrink-0">
                <MapPin className="h-3.5 w-3.5 text-secondary" />
              </div>
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10 mr-2.5 shrink-0">
              <Users className="h-3.5 w-3.5 text-accent" />
            </div>
            <span><span className="font-semibold text-foreground">{guestCount}</span> gości</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4 flex flex-wrap gap-2 justify-between border-t border-border/40">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(event)} 
            className="rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors h-8 px-3 text-xs"
          >
            <Edit className="h-3.5 w-3.5 mr-1" /> Edytuj
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onGoToNotifications?.(event.id)} 
            className="rounded-xl text-muted-foreground hover:text-info hover:bg-info/5 transition-colors h-8 px-3 text-xs"
          >
            <Bell className="h-3.5 w-3.5 mr-1" /> Powiadomienia
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={() => onViewDetails?.(event.id)} 
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 transition-all h-8 px-4 text-xs font-semibold"
        >
          Szczegóły <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
