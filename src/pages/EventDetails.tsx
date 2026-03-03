import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Bell } from "lucide-react";
import { Event, Guest } from "@/types";
import GuestTable from "@/components/guests/GuestTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import EventAttendanceStats from "@/components/events/EventAttendanceStats";
import EventExport from "@/components/events/EventExport";
import GuestDetails from "@/components/guests/GuestDetails";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event from Supabase
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        if (eventData) {
          setEvent({
            id: eventData.id,
            name: eventData.title,
            description: eventData.description || "",
            location: eventData.location || "",
            startDate: new Date(eventData.start_date),
            endDate: eventData.end_date ? new Date(eventData.end_date) : new Date(eventData.start_date),
            organizerId: eventData.organizer_id || "",
            organizationId: eventData.organizer_id || "",
            isPublished: eventData.is_published || false,
            imageUrl: eventData.image_url,
            category: eventData.category,
            maxGuests: eventData.max_guests,
            createdAt: new Date(eventData.created_at || Date.now()),
            updatedAt: new Date(eventData.updated_at || Date.now()),
            createdBy: eventData.organizer_id || "",
          });
        }

        // Fetch real guests for this event
        const { data: guestsData, error: guestsError } = await supabase
          .from('guests')
          .select('*')
          .eq('event_id', eventId);

        if (guestsError) {
          console.error('Error fetching guests:', guestsError);
        }

        if (guestsData) {
          setGuests(
            guestsData.map((g) => ({
              id: g.id,
              firstName: g.first_name,
              lastName: g.last_name,
              email: g.email,
              company: g.company || "",
              phone: g.phone || undefined,
              ticketType: ((g as any).ticket_type || 'uczestnik') as Guest["ticketType"],
              zones: ((g as any).zones || []) as string[],
              status: g.status as Guest["status"],
              emailStatus: (g.email_status || "pending") as Guest["emailStatus"],
              qrCode: g.qr_code,
              invitationSentAt: g.invitation_sent_at ? new Date(g.invitation_sent_at) : undefined,
              invitationOpenedAt: g.invitation_opened_at ? new Date(g.invitation_opened_at) : undefined,
              checkedInAt: g.checked_in_at ? new Date(g.checked_in_at) : undefined,
            }))
          );
        }
      } catch (error: any) {
        console.error("Error fetching event details:", error);
        toast.error("Nie udało się załadować szczegółów wydarzenia");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleViewQR = (guest: Guest) => {
    setCurrentQRGuest(guest);
    setQrDialogOpen(true);
  };

  const handleEditGuest = (guest: Guest) => {
    toast.info("Funkcja edycji gościa będzie dostępna wkrótce");
  };

  const handleDeleteGuest = async (guest: Guest) => {
    if (window.confirm(`Czy na pewno chcesz usunąć gościa ${guest.firstName} ${guest.lastName}?`)) {
      const { error } = await supabase.from('guests').delete().eq('id', guest.id);
      if (error) {
        toast.error("Nie udało się usunąć gościa");
        return;
      }
      setGuests(guests.filter((g) => g.id !== guest.id));
      toast.success("Gość został usunięty");
    }
  };

  const handleResendInvite = (guest: Guest) => {
    toast.success(`Zaproszenie wysłane ponownie do ${guest.firstName} ${guest.lastName}`);
  };

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setGuestDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Wydarzenie nie zostało znalezione</h1>
        <Button onClick={() => navigate('/events')}>Powrót do listy wydarzeń</Button>
      </div>
    );
  }

  const checkedInCount = guests.filter(guest => guest.status === "checked-in").length;
  const confirmedCount = guests.filter(guest => guest.status === "confirmed").length;
  const invitedCount = guests.filter(guest => guest.status === "invited").length;
  const declinedCount = guests.filter(guest => guest.status === "declined").length;

  return (
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
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}
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
              <span>{new Date(event.startDate).toLocaleDateString('pl-PL')}</span>
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
          {guests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>Brak gości. Dodaj gości do tego wydarzenia.</p>
            </div>
          ) : (
            <GuestTable
              guests={guests}
              onViewQR={handleViewQR}
              onEdit={handleEditGuest}
              onDelete={handleDeleteGuest}
              onResendInvite={handleResendInvite}
              onViewDetails={handleViewDetails}
            />
          )}
        </TabsContent>

        <TabsContent value="checkedIn">
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

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kod QR gościa</DialogTitle>
          </DialogHeader>
          {currentQRGuest && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-md">
                <div className="h-48 w-48 bg-gray-200 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-medium">
                  {currentQRGuest.firstName} {currentQRGuest.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{currentQRGuest.email}</p>
                {currentQRGuest.company && (
                  <p className="text-sm text-muted-foreground">{currentQRGuest.company}</p>
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
    </div>
  );
};

export default EventDetails;
