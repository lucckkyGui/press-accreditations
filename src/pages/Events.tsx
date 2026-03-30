import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus, Search, SortAsc, SortDesc, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";

type EventFilter = "all" | "published" | "draft" | "upcoming" | "past" | "today";
type SortOption = "name" | "date-asc" | "date-desc";

const Events = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  const { events, createEvent, isCreating, isEventsLoading } = useEvents();

  const handleCreateEvent = async (data: Partial<Event>) => {
    const response = await createEvent(data);
    if (!response.error) {
      setOpen(false);
    }
  };

  const handleDuplicateEvent = async (event: Event) => {
    const duplicatedData: Partial<Event> = {
      name: `${event.name} (kopia)`,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      maxGuests: event.maxGuests,
      category: event.category,
      isPublished: false,
    };
    const response = await createEvent(duplicatedData);
    if (!response.error) {
      toast({ title: "Wydarzenie zduplikowane", description: `"${event.name}" zostało skopiowane jako szkic.` });
    }
  };

  const handleViewEvent = (event: Event) => {
    navigate(`/events/${event.id}`);
  };

  const handleEditEvent = (event: Event) => {
    navigate(`/events/${event.id}`);
  };

  const handleGoToNotifications = (eventId: string) => {
    navigate(`/notifications/${eventId}`);
  };

  const filteredAndSortedEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (
        searchTerm &&
        !event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      const eventDate = new Date(event.startDate);
      const now = new Date();
      const isToday = eventDate.toDateString() === now.toDateString();
      const isPast = eventDate < now && !isToday;
      const isUpcoming = eventDate > now && !isToday;

      switch (activeFilter) {
        case "published":
          return event.isPublished;
        case "draft":
          return !event.isPublished;
        case "upcoming":
          return isUpcoming;
        case "past":
          return isPast;
        case "today":
          return isToday;
        case "all":
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date-asc":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "date-desc":
        default:
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });
  }, [events, searchTerm, activeFilter, sortBy]);

  const eventCounts = useMemo(() => {
    const counts = {
      all: events.length,
      published: 0,
      draft: 0,
      upcoming: 0,
      past: 0,
      today: 0,
    };

    events.forEach((event) => {
      const eventDate = new Date(event.startDate);
      const now = new Date();
      const isToday = eventDate.toDateString() === now.toDateString();
      const isPast = eventDate < now && !isToday;
      const isUpcoming = eventDate > now && !isToday;

      if (event.isPublished) counts.published++;
      else counts.draft++;

      if (isUpcoming) counts.upcoming++;
      if (isPast) counts.past++;
      if (isToday) counts.today++;
    });

    return counts;
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Wydarzenia</h1>
          <p className="text-muted-foreground text-sm mt-1">Zarządzaj wydarzeniami i zaproś gości.</p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 transition-all font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nowe wydarzenie
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[760px] rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Utwórz nowe wydarzenie</DialogTitle>
              <DialogDescription>
                Wprowadź szczegóły wydarzenia, aby je utworzyć i zarządzać akredytacjami.
              </DialogDescription>
            </DialogHeader>
            <EventForm onSubmit={handleCreateEvent} onCancel={() => setOpen(false)} isSubmitting={isCreating} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Wyszukaj wydarzenia..."
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-primary/40 bg-card transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtruj
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveFilter("all")} className={activeFilter === "all" ? "bg-primary/10 text-primary" : ""}>Wszystkie ({eventCounts.all})</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("published")} className={activeFilter === "published" ? "bg-primary/10 text-primary" : ""}>Opublikowane ({eventCounts.published})</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("draft")} className={activeFilter === "draft" ? "bg-primary/10 text-primary" : ""}>Szkice ({eventCounts.draft})</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("upcoming")} className={activeFilter === "upcoming" ? "bg-primary/10 text-primary" : ""}>Nadchodzące ({eventCounts.upcoming})</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("today")} className={activeFilter === "today" ? "bg-primary/10 text-primary" : ""}>Dzisiaj ({eventCounts.today})</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter("past")} className={activeFilter === "past" ? "bg-primary/10 text-primary" : ""}>Przeszłe ({eventCounts.past})</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
                  {sortBy === "date-desc" ? <SortDesc className="mr-2 h-4 w-4" /> : sortBy === "date-asc" ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
                  Sortuj
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("name")} className={sortBy === "name" ? "bg-primary/10 text-primary" : ""}>Po nazwie</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date-desc")} className={sortBy === "date-desc" ? "bg-primary/10 text-primary" : ""}>Od najnowszych</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date-asc")} className={sortBy === "date-asc" ? "bg-primary/10 text-primary" : ""}>Od najstarszych</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {activeFilter !== "all" && (
          <div className="flex items-center bg-primary/5 rounded-xl px-4 py-2">
            <span className="text-sm text-primary font-medium">
              Filtr:
              {activeFilter === "published" && " Opublikowane"}
              {activeFilter === "draft" && " Szkice"}
              {activeFilter === "upcoming" && " Nadchodzące"}
              {activeFilter === "today" && " Dzisiaj"}
              {activeFilter === "past" && " Przeszłe"}
            </span>
            <Button variant="ghost" size="sm" className="h-auto p-1 ml-2 text-primary hover:bg-primary/10 rounded-lg" onClick={() => setActiveFilter("all")}>×</Button>
          </div>
        )}
      </div>

      {isEventsLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl shadow-soft border border-border/40 p-8">
          <p className="text-muted-foreground text-sm">Ładowanie wydarzeń...</p>
        </div>
      ) : filteredAndSortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl shadow-soft border border-border/40 p-8">
          <div className="rounded-2xl bg-primary/10 p-5 mb-5">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Brak wydarzeń</h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            {searchTerm ? "Nie znaleziono wydarzeń pasujących do twojego wyszukiwania." : "Nie masz żadnych wydarzeń. Utwórz nowe wydarzenie, aby rozpocząć."}
          </p>
          <Button className="mt-5 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/15 font-semibold" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nowe wydarzenie
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onView={handleViewEvent}
              onEdit={handleEditEvent}
              onDuplicate={handleDuplicateEvent}
              onViewDetails={(eventId) => navigate(`/events/${eventId}`)}
              onGoToNotifications={handleGoToNotifications}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
