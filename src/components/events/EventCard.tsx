
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Bell, Eye } from "lucide-react";
import { Event } from "@/types";
import { formatDistanceToNow } from "date-fns";
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

  // Określenie statusu wydarzenia (przeszłe, aktualne, nadchodzące)
  const now = new Date();
  const eventDate = new Date(event.startDate);
  let eventStatus = "nadchodzące";
  if (eventDate < now) {
    eventStatus = "przeszłe";
  } else if (Math.abs(eventDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
    eventStatus = "aktualne";
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(event.id);
    }
  };
  
  const handleGoToNotifications = () => {
    if (onGoToNotifications) {
      onGoToNotifications(event.id);
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <CardTitle className="text-xl">{event.name}</CardTitle>
          <div className="flex gap-2">
            {event.isPublished ? (
              <Badge>Opublikowane</Badge>
            ) : (
              <Badge variant="outline">Szkic</Badge>
            )}
            {eventStatus === "przeszłe" && (
              <Badge variant="secondary">Zakończone</Badge>
            )}
            {eventStatus === "aktualne" && (
              <Badge variant="destructive">Dzisiaj</Badge>
            )}
          </div>
        </div>
        <CardDescription className="truncate">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(event.startDate).toLocaleDateString()} ({timeToEvent})</span>
          </div>
          {event.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{guestCount} gości</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
          Edytuj
        </Button>
        <Button size="sm" onClick={handleViewDetails}>
          <Eye className="h-4 w-4 mr-1" /> Szczegóły
        </Button>
        <Button variant="secondary" size="sm" onClick={handleGoToNotifications}>
          <Bell className="h-4 w-4 mr-1" /> Powiadomienia
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
