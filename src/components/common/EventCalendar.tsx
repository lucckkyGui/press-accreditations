
import React, { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types";
import { pl } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

type EventCalendarProps = {
  events: Event[];
};

export const EventCalendar: React.FC<EventCalendarProps> = ({ events }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Znajdź wydarzenia dla wybranej daty
  const eventsForSelectedDate = selectedDate
    ? events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return isSameDay(eventDate, selectedDate);
      })
    : [];

  // Znajdź daty, w których odbywają się wydarzenia
  const eventDates = events.map((event) => new Date(event.startDate));

  // Przejdź do szczegółów wydarzenia
  const goToEventDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" /> Kalendarz wydarzeń
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              // Sprawdź, czy w danym dniu są wydarzenia
              const hasEventsOnDay =
                date &&
                events.some((event) => {
                  const eventDate = new Date(event.startDate);
                  return isSameDay(eventDate, date);
                });

              if (hasEventsOnDay) {
                setIsDialogOpen(true);
              }
            }}
            locale={pl}
            modifiers={{
              eventDay: eventDates,
            }}
            modifiersStyles={{
              eventDay: {
                fontWeight: "bold",
                backgroundColor: "rgba(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
                borderRadius: "0",
              },
            }}
            className="rounded-md border"
          />

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Wydarzenia w dniu{" "}
                {selectedDate && format(selectedDate, "dd MMMM yyyy", { locale: pl })}
              </DialogTitle>
              <DialogDescription>
                Lista wydarzeń zaplanowanych na wybrany dzień.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "HH:mm")}
                      </div>
                      {event.location && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {event.location}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => goToEventDetails(event.id)}
                    >
                      Szczegóły
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  Brak wydarzeń w wybranym dniu
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
