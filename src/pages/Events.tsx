import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, Search, Filter, SortDesc, SortAsc, MapPin, Clock, Users } from "lucide-react";
import { Event } from "@/types";
import { useNavigate } from "react-router-dom";
import EventCard from "@/components/events/EventCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addHours } from "date-fns";
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
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

type EventFilter = "all" | "published" | "draft" | "upcoming" | "past" | "today";
type SortOption = "name" | "date-asc" | "date-desc";

// Schemat walidacji dla formularza wydarzenia
const eventFormSchema = z.object({
  name: z.string().min(3, "Nazwa wydarzenia musi mieć co najmniej 3 znaki"),
  description: z.string().optional(),
  location: z.string().min(2, "Lokalizacja jest wymagana"),
  startDate: z.date({
    required_error: "Data wydarzenia jest wymagana",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Podaj czas w formacie HH:MM"),
  isPublished: z.boolean().default(false),
  organizerId: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
  category: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const Events = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      startTime: "10:00",
      isPublished: false,
      maxGuests: 100,
      category: "konferencja",
    },
  });
  
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
      startDate: new Date(2024, 3, 5),
      organizerId: "org-1",
      isPublished: true,
    },
    {
      id: "5",
      name: "Spotkanie z Inwestorami",
      description: "Prezentacja strategii rozwoju firmy na kolejne lata.",
      location: "Wirtualne spotkanie online",
      startDate: new Date(),
      organizerId: "org-1",
      isPublished: true,
    },
  ]);

  const onSubmit = (data: EventFormValues) => {
    try {
      // Łączymy datę i czas
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const startDateTime = new Date(data.startDate);
      startDateTime.setHours(hours, minutes, 0);
      
      const newEvent: Event = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        description: data.description || "",
        location: data.location,
        startDate: startDateTime,
        organizerId: "org-1", // Mock ID
        isPublished: data.isPublished,
        maxGuests: data.maxGuests,
        category: data.category,
      };
      
      setEvents([...events, newEvent]);
      toast.success("Wydarzenie zostało pomyślnie utworzone!");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Wystąpił błąd podczas tworzenia wydarzenia. Spróbuj ponownie.");
    }
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
  
  const handleOpenModal = () => {
    setOpen(true);
    form.reset({
      name: "",
      description: "",
      location: "",
      startDate: new Date(),
      startTime: "10:00",
      isPublished: false,
      maxGuests: 100,
      category: "konferencja",
    });
  };

  // Filtrowanie i sortowanie wydarzeń
  const filteredAndSortedEvents = useMemo(() => {
    // Najpierw filtrujemy
    const filtered = events.filter(event => {
      // Filtrowanie według wyszukiwania
      if (searchTerm && !event.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !event.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.location?.toLowerCase().includes(searchTerm.toLowerCase())) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wydarzenia</h1>
          <p className="text-muted-foreground">
            Zarządzaj wydarzeniami i zaproś gości.
          </p>
        </div>
        
        <Button onClick={handleOpenModal} className="animated-button bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nowe wydarzenie
        </Button>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Utwórz nowe wydarzenie</DialogTitle>
              <DialogDescription>
                Wprowadź szczegóły wydarzenia, aby je utworzyć i zarządzać akredytacjami.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa wydarzenia</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Np. Konferencja Prasowa 2025" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ wydarzenia</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz typ wydarzenia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="konferencja">Konferencja prasowa</SelectItem>
                            <SelectItem value="premiera">Premiera</SelectItem>
                            <SelectItem value="targi">Targi/Wystawa</SelectItem>
                            <SelectItem value="warsztat">Warsztat/Szkolenie</SelectItem>
                            <SelectItem value="inne">Inne</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data wydarzenia</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: pl })
                                ) : (
                                  <span>Wybierz datę</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Godzina rozpoczęcia</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="time"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis wydarzenia</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Opisz cel i program wydarzenia"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokalizacja</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-9"
                            placeholder="Np. Centrum Konferencyjne, Warszawa" 
                            {...field} 
                            />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maksymalna liczba gości</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-9"
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Limit uczestników, których możesz zaprosić na wydarzenie
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Opublikuj od razu</FormLabel>
                        <FormDescription>
                          Wydarzenie będzie natychmiast widoczne dla gości
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)} type="button">
                    Anuluj
                  </Button>
                  <Button type="submit">Utwórz wydarzenie</Button>
                </DialogFooter>
              </form>
            </Form>
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
                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtruj
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
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
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 dark:bg-slate-900/50 rounded-xl shadow-sm border p-8">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Brak wydarzeń</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {searchTerm ? 
              "Nie znaleziono wydarzeń pasujących do twojego wyszukiwania." : 
              "Nie masz żadnych wydarzeń. Utwórz nowe wydarzenie, aby rozpocząć."}
          </p>
          <Button className="mt-4 animated-button" onClick={handleOpenModal}>
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
  );
};

export default Events;
