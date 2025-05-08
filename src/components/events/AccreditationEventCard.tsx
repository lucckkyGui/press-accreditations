
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Tag, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FormattedDate from "./FormattedDate";
import { MockEvent } from "@/services/events/mockEventsService";

interface AccreditationEventCardProps {
  event: MockEvent;
  currentLanguage: string;
  translations: {
    duration: string;
    days: string;
    attendees: string;
    deadline: string;
    registrationOpen: string;
    registrationClosed: string;
    requestForm: string;
  };
}

const AccreditationEventCard: React.FC<AccreditationEventCardProps> = ({ 
  event, 
  currentLanguage,
  translations
}) => {
  const navigate = useNavigate();

  // Calculate event duration in days
  const duration = Math.ceil(
    (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2">
          {currentLanguage === 'en' ? event.title : event.titlePl}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="line-clamp-1">{currentLanguage === 'en' ? event.location : event.locationPl}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <FormattedDate date={event.startDate} language={currentLanguage} />
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{translations.duration}: {duration} {translations.days}</span>
          </div>
          
          {event.attendees && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{event.attendees} {translations.attendees}</span>
            </div>
          )}
          
          <p className="text-sm line-clamp-2">
            {currentLanguage === 'en' ? event.description : event.descriptionPl}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {event.featured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {currentLanguage === 'en' ? "Featured" : "Wyróżnione"}
              </Badge>
            )}
            {event.type && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {event.type}
              </Badge>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            {event.registrationOpen ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {translations.registrationOpen}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {translations.registrationClosed}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {translations.deadline}: <FormattedDate date={event.deadline} language={currentLanguage} />
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="default"
          className="w-full"
          onClick={() => navigate(`/accreditation-request/${event.id}`)}
          disabled={!event.registrationOpen}
        >
          {translations.requestForm}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccreditationEventCard;
