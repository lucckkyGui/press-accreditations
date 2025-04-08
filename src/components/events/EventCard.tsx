
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Bell, Eye, ArrowRight, Edit } from "lucide-react";
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

  // Określenie statusu wydarzenia (przeszłe, aktualne, nadchodzące)
  const now = new Date();
  const eventDate = new Date(event.startDate);
  let eventStatus = "nadchodzące";
  let statusClass = "bg-blue-100 text-blue-800 border-blue-200";
  
  if (eventDate < now) {
    eventStatus = "przeszłe";
    statusClass = "bg-gray-100 text-gray-800 border-gray-200";
  } else if (Math.abs(eventDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
    eventStatus = "dzisiaj";
    statusClass = "bg-red-100 text-red-800 border-red-200";
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
    <Card className="w-full overflow-hidden group hover:shadow-md transition-all duration-300 border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-1">{event.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {event.isPublished ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                Opublikowane
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100">
                Szkic
              </Badge>
            )}
            <Badge variant="outline" className={`${statusClass} border`}>
              {eventStatus}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-1">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">{format(new Date(event.startDate), "d MMMM yyyy, HH:mm", { locale: pl })}</span>
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
          <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="hover:bg-muted/50 transition-colors">
            <Edit className="h-3.5 w-3.5 mr-1" /> Edytuj
          </Button>
          <Button variant="outline" size="sm" onClick={handleGoToNotifications} className="hover:bg-primary/10">
            <Bell className="h-3.5 w-3.5 mr-1" /> Powiadomienia
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={handleViewDetails} 
          className="bg-primary hover:bg-primary/90 hover:translate-x-0.5 transition-all"
        >
          Szczegóły <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
