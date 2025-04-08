
import React, { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, Search, Filter, SortDesc, SortAsc } from "lucide-react";
import { Event } from "@/types";
import { useNavigate } from "react-router-dom";
import EventCard from "@/components/events/EventCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type EventFilter = "all" | "published" | "draft" | "upcoming" | "past" | "today";
type SortOption = "name" | "date-asc" | "date-desc";

const Events = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [isPublished, setIsPublished] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  
  // Mock events dla MVP
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      name: "Konferencja Prasowa 2025",
      description: "Doroczna konferencja prasowa firmy XYZ prezentująca nowe produkty i plany na przyszły rok.",
      location: "Centrum Konferencyjne, Warszawa",
      startDate: new Date(2025, 3, 15),
      organizerId: "org-1",
      isPublished: true,
    },
    {
      id: "2",
      name: "Premiera Produktu ABC",
      description: "Oficjalne uruchomienie nowego produktu ABC na rynku polskim.",
      location: "Hotel Grand, Kraków",
      startDate: new Date(2025, 4, 22),
      organizerId: "org-1",
      isPublished: true,
    },
    {
      id: "3",
      name: "Targi Innowacji 2025",
      description: "Prezentacja najnowszych technologii i trendów w branży.",
      location: "Expo Center, Poznań",
      startDate: new Date(2025, 5, 10),
      organizerId: "org-1",
      isPublished: false,
    },
    {
      id: "4",
      name: "Konferencja Dziennikarska",
      description: "Spotkanie z dziennikarzami i prezentacja wyników kwartalnych.",
      location: "Biuro Główne, Warszawa",
      startDate: new Date(2024, 3, 5), // Wydarzenie przeszłe
      organizerId: "org-1",
      isPublished: true,
    },
    {
      id: "5",
      name: "Spotkanie z Inwestorami",
      description: "Prezentacja strategii rozwoju firmy na kolejne lata.",
      location: "Wirtualne spotkanie online",
      startDate: new Date(), // Wydarzenie dzisiejsze
      organizerId: "org-1",
      isPublished: true,
    },
  ]);

  const handleCreateEvent = () => {
    if (!name || !date) return;
    
    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      location,
      startDate: date,
      organizerId: "org-1", // Mock organizerId
      isPublished,
    };
    
    setEvents([...events, newEvent]);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setLocation("");
    setDate(undefined);
    setIsPublished(false);
  };

  const handleViewEvent = (event: Event) => {
    // W rzeczywistej aplikacji przekierowałoby do strony szczegółów wydarzenia
    console.log("Viewing event:", event);
  };

  const handleEditEvent = (event: Event) => {
    // W rzeczywistej aplikacji przekierowałoby do edycji wydarzenia
    console.log("Editing event:", event);
  };

  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  const handleGoToNotifications = (eventId: string) => {
    navigate(`/notifications/${eventId}`);
  };

  // Filtrowanie i sortowanie wydarzeń
  const filteredAndSortedEvents = useMemo(() => {
    // Najpierw filtrujemy
    const filtered = events.filter(event => {
      // Filtrowanie według wyszukiwania
      if (searchTerm && !event.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !event.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      const eventDate = new Date(event.startDate);
      const now = new Date();
      const isToday = eventDate.toDateString() === now.toDateString();
      const isPast = eventDate < now && !isToday;
      const isUpcoming = eventDate > now && !isToday;
      
      // Filtrowanie według stanu
      switch(activeFilter) {
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
    
    // Następnie sortujemy
    return filtered.sort((a, b) => {
      switch(sortBy) {
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

  // Licznik dla różnych kategorii wydarzeń
  const eventCounts = useMemo(() => {
    const counts = {
      all: events.length,
      published: 0,
      draft: 0,
      upcoming: 0,
      past: 0,
      today: 0
    };
    
    events.forEach(event => {
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
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wydarzenia</h1>
            <p className="text-muted-foreground">
              Zarządzaj wydarzeniami i zaproś gości.
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nowe wydarzenie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Utwórz nowe wydarzenie</DialogTitle>
                <DialogDescription>
                  Wprowadź podstawowe informacje o wydarzeniu
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa wydarzenia</Label>
                  <Input
                    id="name"
                    placeholder="Np. Konferencja Prasowa 2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    placeholder="Krótki opis wydarzenia"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Lokalizacja</Label>
                  <Input
                    id="location"
                    placeholder="Np. Centrum Konferencyjne, Warszawa"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data wydarzenia</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: pl }) : "Wybierz datę"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publish"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="publish">Opublikuj od razu</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleCreateEvent}>Utwórz wydarzenie</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 w-full sm:max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Wyszukaj wydarzenia..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtruj
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("all")}
                    className={activeFilter === "all" ? "bg-secondary" : ""}
                  >
                    Wszystkie ({eventCounts.all})
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("published")}
                    className={activeFilter === "published" ? "bg-secondary" : ""}
                  >
                    Opublikowane ({eventCounts.published})
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("draft")}
                    className={activeFilter === "draft" ? "bg-secondary" : ""}
                  >
                    Szkice ({eventCounts.draft})
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("upcoming")}
                    className={activeFilter === "upcoming" ? "bg-secondary" : ""}
                  >
                    Nadchodzące ({eventCounts.upcoming})
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("today")}
                    className={activeFilter === "today" ? "bg-secondary" : ""}
                  >
                    Dzisiaj ({eventCounts.today})
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("past")}
                    className={activeFilter === "past" ? "bg-secondary" : ""}
                  >
                    Przeszłe ({eventCounts.past})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortBy === "date-desc" ? 
                      <SortDesc className="mr-2 h-4 w-4" /> : 
                      sortBy === "date-asc" ? 
                      <SortAsc className="mr-2 h-4 w-4" /> : 
                      <SortDesc className="mr-2 h-4 w-4" />
                    }
                    Sortuj
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setSortBy("name")}
                    className={sortBy === "name" ? "bg-secondary" : ""}
                  >
                    Po nazwie
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("date-desc")}
                    className={sortBy === "date-desc" ? "bg-secondary" : ""}
                  >
                    Od najnowszych
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("date-asc")}
                    className={sortBy === "date-asc" ? "bg-secondary" : ""}
                  >
                    Od najstarszych
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Wyświetlanie aktywnego filtra */}
          {activeFilter !== "all" && (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">
                Filtr aktywny: 
                {activeFilter === "published" && " Opublikowane"}
                {activeFilter === "draft" && " Szkice"}
                {activeFilter === "upcoming" && " Nadchodzące"}
                {activeFilter === "today" && " Dzisiaj"}
                {activeFilter === "past" && " Przeszłe"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1 ml-2" 
                onClick={() => setActiveFilter("all")}
              >
                ×
              </Button>
            </div>
          )}
        </div>
        
        {filteredAndSortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Brak wydarzeń</h3>
            <p className="text-muted-foreground mt-2">
              {searchTerm ? 
                "Nie znaleziono wydarzeń pasujących do twojego wyszukiwania." : 
                "Nie masz żadnych wydarzeń. Utwórz nowe wydarzenie, aby rozpocząć."}
            </p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
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
                guestCount={Math.floor(Math.random() * 100) + 20}
                onView={handleViewEvent}
                onEdit={handleEditEvent}
                onViewDetails={handleViewDetails}
                onGoToNotifications={handleGoToNotifications}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
