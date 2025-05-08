
import React from "react";
import { MockEvent } from "@/services/events/mockEventsService";
import AccreditationEventCard from "./AccreditationEventCard";

interface EventsGridProps {
  events: MockEvent[];
  currentLanguage: string;
  noEventsMessage: string;
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

const EventsGrid = ({ events, currentLanguage, noEventsMessage, translations }: EventsGridProps) => {
  if (events.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-muted-foreground">{noEventsMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <AccreditationEventCard 
          key={event.id} 
          event={event} 
          currentLanguage={currentLanguage}
          translations={translations}
        />
      ))}
    </div>
  );
};

export default EventsGrid;
