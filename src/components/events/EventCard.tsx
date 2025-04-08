
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Bell, Eye, ArrowRight } from "lucide-react";
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
  let statusClass = "bg-blue-100 text-blue-800";
  
  if (eventDate < now) {
    eventStatus = "przeszłe";
    statusClass = "bg-gray-100 text-gray-800";
  } else if (Math.abs(eventDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
    eventStatus = "aktualne";
    statusClass = "bg-red-100 text-red-800";
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
    <Card className="w-full hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary overflow-hidden group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{event.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {event.isPublished ? (
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                Opublikowane
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100">
                Szkic
              </Badge>
            )}
            <Badge className={statusClass}>{eventStatus}</Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-1">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">{new Date(event.startDate).toLocaleDateString()}</span>
            <span className="ml-1 text-xs">({timeToEvent})</span>
          </div>
          {event.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-primary" />
            <span><span className="font-medium">{guestCount}</span> gości</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="hover:bg-muted/50">
            Edytuj
          </Button>
          <Button variant="secondary" size="sm" onClick={handleGoToNotifications} className="hover:bg-secondary/80">
            <Bell className="h-3.5 w-3.5 mr-1" /> Powiadomienia
          </Button>
        </div>
        <Button size="sm" onClick={handleViewDetails} className="hover:gap-2 transition-all">
          Szczegóły <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
