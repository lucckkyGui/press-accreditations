
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, MapPin, Users, Bell } from "lucide-react";
import { Event, Guest } from "@/types";
import GuestTable from "@/components/guests/GuestTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import EventAttendanceStats from "@/components/events/EventAttendanceStats";
import EventExport from "@/components/events/EventExport";
import GuestDetails from "@/components/guests/GuestDetails";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQRGuest, setCurrentQRGuest] = useState<Guest | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [guestDetailsOpen, setGuestDetailsOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  
  // Symulacja pobierania danych dla MVP
  useEffect(() => {
    // W rzeczywistej aplikacji tutaj byłoby zapytanie do API
    setTimeout(() => {
      const mockEvent = {
        id: eventId || "1",
        name: "Konferencja Prasowa 2025",
        description: "Doroczna konferencja prasowa firmy XYZ prezentująca nowe produkty i plany na przyszły rok.",
        location: "Centrum Konferencyjne, Warszawa",
        startDate: new Date(2025, 3, 15),
        organizerId: "org-1",
        isPublished: true,
      };
      
      const mockGuests = [
        {
          id: "1",
          firstName: "Jan",
          lastName: "Kowalski",
          email: "jan.kowalski@example.com",
          company: "ABC Corp",
          phone: "+48123456789",
          zone: "vip" as const,
          status: "confirmed" as const,
          emailStatus: "opened" as const,
          qrCode: "mock-qr-code-1",
          invitationSentAt: new Date(2023, 3, 1),
          invitationOpenedAt: new Date(2023, 3, 2),
        },
        {
          id: "2",
          firstName: "Anna",
          lastName: "Nowak",
          email: "anna.nowak@example.com",
          company: "XYZ Media",
          zone: "press" as const,
          status: "invited" as const,
          emailStatus: "sent" as const,
          qrCode: "mock-qr-code-2",
          invitationSentAt: new Date(2023, 3, 1),
        },
        {
          id: "3",
          firstName: "Piotr",
          lastName: "Wiśniewski",
          email: "piotr.wisniewski@example.com",
          company: "Event Staff",
          zone: "staff" as const,
          status: "checked-in" as const,
          emailStatus: "opened" as const,
          qrCode: "mock-qr-code-3",
          invitationSentAt: new Date(2023, 3, 1),
          invitationOpenedAt: new Date(2023, 3, 1),
          checkedInAt: new Date(2023, 3, 10, 9, 30),
        },
        {
          id: "4",
          firstName: "Marta",
          lastName: "Zielińska",
          email: "marta.zielinska@example.com",
          company: "",
          zone: "general" as const,
          status: "declined" as const,
          emailStatus: "failed" as const,
          qrCode: "mock-qr-code-4",
          invitationSentAt: new Date(2023, 3, 1),
        },
        {
          id: "5",
          firstName: "Tomasz",
          lastName: "Nowicki",
          email: "tomasz.nowicki@example.com",
          company: "Tech Review",
          zone: "press" as const,
          status: "invited" as const,
          emailStatus: "sent" as const,
          qrCode: "mock-qr-code-5",
          invitationSentAt: new Date(2023, 3, 5),
        },
      ];
      
      setEvent(mockEvent);
      setGuests(mockGuests);
      setLoading(false);
    }, 1000);
  }, [eventId]);

  const handleViewQR = (guest: Guest) => {
    setCurrentQRGuest(guest);
    setQrDialogOpen(true);
  };

  const handleEditGuest = (guest: Guest) => {
    // W rzeczywistej aplikacji tutaj byłoby otwieranie formularza edycji
    toast.info("Funkcja edycji gościa będzie dostępna w pełnej wersji");
  };

  const handleDeleteGuest = (guest: Guest) => {
    if (window.confirm(`Czy na pewno chcesz usunąć gościa ${guest.firstName} ${guest.lastName}?`)) {
      setGuests(guests.filter((g) => g.id !== guest.id));
      toast.success("Gość został usunięty");
    }
  };

  const handleResendInvite = (guest: Guest) => {
    toast.success(`Zaproszenie wysłane ponownie do ${guest.firstName} ${guest.lastName}`);
    // W rzeczywistej aplikacji tutaj byłaby logika ponownej wysyłki
  };

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setGuestDetailsOpen(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Wydarzenie nie zostało znalezione</h1>
          <Button onClick={() => navigate('/events')}>Powrót do listy wydarzeń</Button>
        </div>
      </MainLayout>
    );
  }

  const checkedInCount = guests.filter(guest => guest.status === "checked-in").length;
  const confirmedCount = guests.filter(guest => guest.status === "confirmed").length;
  const invitedCount = guests.filter(guest => guest.status === "invited").length;
  const declinedCount = guests.filter(guest => guest.status === "declined").length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
              {event.isPublished ? (
                <Badge>Opublikowane</Badge>
              ) : (
                <Badge variant="outline">Szkic</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {event.description}
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate('/invitation-editor')}>
              Edytuj zaproszenia
            </Button>
            <Button variant="outline" onClick={() => navigate(`/notifications/${eventId}`)}>
              <Bell className="mr-2 h-4 w-4" />
              Powiadomienia
            </Button>
            <Button onClick={() => navigate('/scanner')}>
              Skanuj gości
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Szczegóły wydarzenia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(event.startDate).toLocaleDateString()}</span>
              </div>
              {event.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2" />
                <span>{guests.length} gości zaproszonych</span>
              </div>
            </CardContent>
          </Card>
          
          <EventAttendanceStats
            total={guests.length}
            checkedIn={checkedInCount}
            confirmed={confirmedCount}
            invited={invitedCount}
            declined={declinedCount}
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Wszyscy goście ({guests.length})</TabsTrigger>
            <TabsTrigger value="checkedIn">Obecni ({checkedInCount})</TabsTrigger>
            <TabsTrigger value="notCheckedIn">Nieobecni ({guests.length - checkedInCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="mb-4 flex justify-end">
              <EventExport guests={guests} eventName={event.name} />
            </div>
            <GuestTable 
              guests={guests}
              onViewQR={handleViewQR}
              onEdit={handleEditGuest}
              onDelete={handleDeleteGuest}
              onResendInvite={handleResendInvite}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
          
          <TabsContent value="checkedIn">
            <div className="mb-4 flex justify-end">
              <EventExport guests={guests.filter(g => g.status === "checked-in")} eventName={event.name} />
            </div>
            <GuestTable 
              guests={guests.filter(g => g.status === "checked-in")}
              onViewQR={handleViewQR}
              onEdit={handleEditGuest}
              onDelete={handleDeleteGuest}
              onResendInvite={handleResendInvite}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
          
          <TabsContent value="notCheckedIn">
            <div className="mb-4 flex justify-end">
              <EventExport guests={guests.filter(g => g.status !== "checked-in")} eventName={event.name} />
            </div>
            <GuestTable 
              guests={guests.filter(g => g.status !== "checked-in")}
              onViewQR={handleViewQR}
              onEdit={handleEditGuest}
              onDelete={handleDeleteGuest}
              onResendInvite={handleResendInvite}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kod QR gościa</DialogTitle>
          </DialogHeader>
          
          {currentQRGuest && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-md">
                {/* W rzeczywistej aplikacji tutaj byłby rzeczywisty kod QR */}
                <div className="h-48 w-48 bg-gray-200 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-primary" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-medium">
                  {currentQRGuest.firstName} {currentQRGuest.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentQRGuest.email}
                </p>
                {currentQRGuest.company && (
                  <p className="text-sm text-muted-foreground">
                    {currentQRGuest.company}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <GuestDetails 
        guest={selectedGuest} 
        open={guestDetailsOpen} 
        onOpenChange={setGuestDetailsOpen} 
      />
    </MainLayout>
  );
};

export default EventDetails;
