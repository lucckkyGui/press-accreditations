
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { Event } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: Event;
  guestCount?: number;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
}

const EventCard = ({ event, guestCount = 0, onView, onEdit }: EventCardProps) => {
  const navigate = useNavigate();
  
  const timeToEvent = formatDistanceToNow(new Date(event.startDate), {
    addSuffix: true,
    locale: pl,
  });

  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };
  
  const handleGoToNotifications = () => {
    navigate(`/notifications/${event.id}`);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <CardTitle className="text-xl">{event.name}</CardTitle>
          {event.isPublished ? (
            <Badge>Opublikowane</Badge>
          ) : (
            <Badge variant="outline">Szkic</Badge>
          )}
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
          Szczegóły
        </Button>
        <Button variant="secondary" size="sm" onClick={handleGoToNotifications}>
          Powiadomienia
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
