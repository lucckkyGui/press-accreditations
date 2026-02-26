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
      endDate: new Date(2025, 3, 15, 18, 0),
      organizerId: "org-1",
      organizationId: "org-1",
      isPublished: true,
      createdAt: new Date(2024, 11, 1),
      updatedAt: new Date(2024, 11, 15),
      createdBy: "user-1"
    },
    {
      id: "2",
      name: "Premiera Produktu ABC",
      description: "Oficjalne uruchomienie nowego produktu ABC na rynku polskim.",
      location: "Hotel Grand, Kraków",
      startDate: new Date(2025, 4, 22),
      endDate: new Date(2025, 4, 22, 20, 0),
      organizerId: "org-1",
      organizationId: "org-1",
      isPublished: true,
      createdAt: new Date(2024, 11, 5),
      updatedAt: new Date(2024, 11, 20),
      createdBy: "user-1"
    },
    {
      id: "3",
      name: "Targi Innowacji 2025",
      description: "Prezentacja najnowszych technologii i trendów w branży.",
      location: "Expo Center, Poznań",
      startDate: new Date(2025, 5, 10),
      endDate: new Date(2025, 5, 12, 17, 0),
      organizerId: "org-1",
      organizationId: "org-1",
      isPublished: false,
      createdAt: new Date(2024, 11, 10),
      updatedAt: new Date(2024, 11, 25),
      createdBy: "user-1"
    },
    {
      id: "4",
      name: "Konferencja Dziennikarska",
      description: "Spotkanie z dziennikarzami i prezentacja wyników kwartalnych.",
      location: "Biuro Główne, Warszawa",
      startDate: new Date(2024, 3, 5),
      endDate: new Date(2024, 3, 5, 16, 0),
      organizerId: "org-1",
      organizationId: "org-1",
      isPublished: true,
      createdAt: new Date(2024, 2, 1),
      updatedAt: new Date(2024, 2, 15),
      createdBy: "user-1"
    },
    {
      id: "5",
      name: "Spotkanie z Inwestorami",
      description: "Prezentacja strategii rozwoju firmy na kolejne lata.",
      location: "Wirtualne spotkanie online",
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
      organizerId: "org-1",
      organizationId: "org-1",
      isPublished: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdBy: "user-1"
    },
  ]);

  const onSubmit = (data: EventFormValues) => {
    try {
      // Łączymy datę i czas
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const startDateTime = new Date(data.startDate);
      startDateTime.setHours(hours, minutes, 0);
      
      // End date is 2 hours after start by default
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 2);
      
      const newEvent: Event = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        description: data.description || "",
        location: data.location,
        startDate: startDateTime,
        endDate: endDateTime,
        organizerId: "org-1", // Mock ID
        organizationId: "org-1", // Mock ID
        isPublished: data.isPublished,
        maxGuests: data.maxGuests,
        category: data.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "user-1" // Mock user ID
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Wydarzenia</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Zarządzaj wydarzeniami i zaproś gości.
          </p>
        </div>
        
        <Button onClick={handleOpenModal} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 transition-all font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Nowe wydarzenie
        </Button>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl border-0 shadow-xl">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/60 p-4 bg-primary/5">
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
                
                <DialogFooter className="pt-3 border-t border-border/40">
                  <Button variant="outline" onClick={() => setOpen(false)} type="button" className="rounded-xl">
                    Anuluj
                  </Button>
                  <Button type="submit" className="rounded-xl shadow-md shadow-primary/10">Utwórz wydarzenie</Button>
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
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("all")}
                    className={activeFilter === "all" ? "bg-primary/10 text-primary" : ""}
                  >
                  Wszystkie ({eventCounts.all})
                </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("published")}
                    className={activeFilter === "published" ? "bg-primary/10 text-primary" : ""}
                  >
                  Opublikowane ({eventCounts.published})
                </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("draft")}
                    className={activeFilter === "draft" ? "bg-primary/10 text-primary" : ""}
                  >
                  Szkice ({eventCounts.draft})
                </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("upcoming")}
                    className={activeFilter === "upcoming" ? "bg-primary/10 text-primary" : ""}
                  >
                  Nadchodzące ({eventCounts.upcoming})
                </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("today")}
                    className={activeFilter === "today" ? "bg-primary/10 text-primary" : ""}
                  >
                  Dzisiaj ({eventCounts.today})
                </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveFilter("past")}
                    className={activeFilter === "past" ? "bg-primary/10 text-primary" : ""}
                  >
                  Przeszłe ({eventCounts.past})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
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
                  className={sortBy === "name" ? "bg-primary/10 text-primary" : ""}
                >
                  Po nazwie
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("date-desc")}
                  className={sortBy === "date-desc" ? "bg-primary/10 text-primary" : ""}
                >
                  Od najnowszych
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("date-asc")}
                  className={sortBy === "date-asc" ? "bg-primary/10 text-primary" : ""}
                >
                  Od najstarszych
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Wyświetlanie aktywnego filtra */}
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-1 ml-2 text-primary hover:bg-primary/10 rounded-lg" 
              onClick={() => setActiveFilter("all")}
            >
              ×
            </Button>
          </div>
        )}
      </div>
      
      {filteredAndSortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl shadow-soft border border-border/40 p-8">
          <div className="rounded-2xl bg-primary/10 p-5 mb-5">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Brak wydarzeń</h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            {searchTerm ? 
              "Nie znaleziono wydarzeń pasujących do twojego wyszukiwania." : 
              "Nie masz żadnych wydarzeń. Utwórz nowe wydarzenie, aby rozpocząć."}
          </p>
          <Button className="mt-5 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/15 font-semibold" onClick={handleOpenModal}>
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
