
import React, { useState } from "react";
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
import { CalendarIcon, Plus } from "lucide-react";
import { Event } from "@/types";
import { useNavigate } from "react-router-dom";
import EventCard from "@/components/events/EventCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const Events = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [isPublished, setIsPublished] = useState(false);
  
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
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
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
      </div>
    </MainLayout>
  );
};

export default Events;
