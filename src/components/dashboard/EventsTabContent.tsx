import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, QrCode, Eye, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventData {
  id: string;
  title: string;
  location: string | null;
  start_date: string;
  end_date: string;
  is_published: boolean | null;
}

interface EventsTabContentProps {
  eventsData: EventData[];
  eventsLoading: boolean;
}

const EventsTabContent: React.FC<EventsTabContentProps> = ({ eventsData, eventsLoading }) => {
  const navigate = useNavigate();
  const now = new Date();
  
  const activeEvents = eventsData.filter(e => 
    new Date(e.start_date) <= now && new Date(e.end_date) >= now
  );
  const upcomingEvents = eventsData.filter(e => new Date(e.start_date) > now);

  return (
    <div className="space-y-6">
      {activeEvents.length > 0 && (
        <Card className="border-0 rounded-2xl bg-success/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <CardTitle className="text-lg text-success font-semibold">Aktywne wydarzenia</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-success/20">
                  <div>
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate('/scanner')} className="rounded-lg">
                      <QrCode className="h-4 w-4 mr-1" /> Skanuj
                    </Button>
                    <Button size="sm" onClick={() => navigate('/events')} className="rounded-lg">
                      <Eye className="h-4 w-4 mr-1" /> Szczegóły
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Nadchodzące wydarzenia</CardTitle>
            <CardDescription className="mt-1">Twoje zaplanowane wydarzenia</CardDescription>
          </div>
          <Button onClick={() => navigate('/events')} className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" /> Dodaj
          </Button>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary/40" />
              </div>
              <p className="font-medium text-foreground">Brak nadchodzących wydarzeń</p>
              <p className="text-sm mt-1 mb-4">Utwórz swoje pierwsze wydarzenie</p>
              <Button className="rounded-xl" onClick={() => navigate('/events')}>
                <Plus className="h-4 w-4 mr-1.5" /> Utwórz wydarzenie
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className="text-center p-2.5 bg-primary/10 rounded-xl min-w-[60px]">
                      <div className="text-lg font-bold text-primary leading-none">
                        {new Date(event.start_date).getDate()}
                      </div>
                      <div className="text-[11px] text-primary/70 mt-1 font-medium uppercase">
                        {new Date(event.start_date).toLocaleDateString('pl-PL', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.location || 'Brak lokalizacji'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={event.is_published ? "default" : "secondary"} className="rounded-lg">
                      {event.is_published ? "Opublikowane" : "Szkic"}
                    </Badge>
                    <Button size="sm" variant="ghost" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsTabContent;
