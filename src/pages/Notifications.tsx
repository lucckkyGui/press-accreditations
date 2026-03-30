import React, { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationScheduler from "@/components/notifications/NotificationScheduler";
import NotificationsList from "@/components/notifications/NotificationsList";
import NotificationTemplates from "@/components/notifications/NotificationTemplates";
import { Notification } from "@/types/notifications";
import { Guest, Event } from "@/types";
import { toast } from "sonner";

const Notifications = () => {
  usePageTitle("Powiadomienia");
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Symulacja pobierania danych dla MVP
    const loadData = async () => {
      // W rzeczywistej aplikacji tutaj byłoby zapytanie do API
      setTimeout(() => {
        // Mockowe dane wydarzenia
        const mockEvent: Event = {
          id: eventId || "1",
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
        };

        // Mockowi goście
        const mockGuests = [
          {
            id: "1",
            firstName: "Jan",
            lastName: "Kowalski",
            email: "jan.kowalski@example.com",
            company: "ABC Corp",
            phone: "+48123456789",
            ticketType: "uczestnik" as const,
            zones: [] as string[],
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
            ticketType: "media" as const,
            zones: [] as string[],
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
            ticketType: "crew" as const,
            zones: [] as string[],
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
            ticketType: "uczestnik" as const,
            zones: [] as string[],
            status: "declined" as const,
            emailStatus: "failed" as const,
            qrCode: "mock-qr-code-4",
            invitationSentAt: new Date(2023, 3, 1),
            invitationOpenedAt: new Date(2023, 3, 3),
          },
          {
            id: "5",
            firstName: "Tomasz",
            lastName: "Nowicki",
            email: "tomasz.nowicki@example.com",
            company: "Tech Review",
            ticketType: "media" as const,
            zones: [] as string[],
            status: "invited" as const,
            emailStatus: "sent" as const,
            qrCode: "mock-qr-code-5",
            invitationSentAt: new Date(2023, 3, 5),
          },
        ];

        // Mockowe powiadomienia
        const mockNotifications = [
          {
            id: "1",
            eventId: eventId || "1",
            type: "reminder" as const,
            title: "Przypomnienie o wydarzeniu",
            message: "Szanowny Gościu, przypominamy o nadchodzącym wydarzeniu Konferencja Prasowa 2025, które odbędzie się 15.04.2025 o godzinie 10:00.",
            scheduledFor: new Date(2025, 3, 13, 10, 0), // 2 dni przed wydarzeniem
            status: "scheduled" as const,
          },
          {
            id: "2",
            eventId: eventId || "1",
            type: "update" as const,
            title: "Zmiana lokalizacji wydarzenia",
            message: "Szanowny Gościu, informujemy o zmianie lokalizacji wydarzenia Konferencja Prasowa 2025. Nowa lokalizacja: Hotel Marriott, Al. Jerozolimskie 65/79, Warszawa.",
            scheduledFor: new Date(2025, 3, 10, 9, 0),
            status: "sent" as const,
            sentAt: new Date(2025, 3, 10, 9, 5),
          },
          {
            id: "3",
            eventId: eventId || "1",
            type: "reminder" as const,
            title: "Przypomnienie o wydarzeniu jutro",
            message: "Przypominamy, że jutro o godzinie 10:00 odbędzie się Konferencja Prasowa 2025. Prosimy o przygotowanie kodu QR z zaproszenia.",
            scheduledFor: new Date(new Date().getTime() - 86400000), // Yesterday
            status: "scheduled" as const,
          },
          {
            id: "4",
            eventId: eventId || "1",
            type: "custom" as const,
            title: "Problemy techniczne",
            message: "Przepraszamy za problemy techniczne z linkiem do rejestracji. Prosimy skorzystać z tego linku: https://example.com/register",
            scheduledFor: new Date(2025, 3, 5, 15, 30),
            status: "failed" as const,
          },
        ];
        
        setEvent(mockEvent);
        setGuests(mockGuests);
        setNotifications(mockNotifications);
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, [eventId]);

  const handleDeleteNotification = (id: string) => {
    // W rzeczywistej aplikacji tutaj byłoby zapytanie do API
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleSendNowNotification = (notification: Notification) => {
    // W rzeczywistej aplikacji tutaj byłoby zapytanie do API
    const updatedNotifications = notifications.map(n => {
      if (n.id === notification.id) {
        return {
          ...n,
          status: "sent" as const,
          sentAt: new Date(),
          scheduledFor: new Date(), // Update schedule to now
        };
      }
      return n;
    });
    
    setNotifications(updatedNotifications);
    toast.success("Powiadomienie zostało wysłane");
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Powiadomienia</h1>
        <p className="text-muted-foreground">
          Zarządzaj powiadomieniami dla wydarzenia: {event.name}
        </p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">Zaplanuj powiadomienia</TabsTrigger>
          <TabsTrigger value="scheduled">Zaplanowane ({notifications.filter(n => n.status === "scheduled").length})</TabsTrigger>
          <TabsTrigger value="sent">Historia wysyłki ({notifications.filter(n => n.status === "sent").length})</TabsTrigger>
          <TabsTrigger value="templates">Szablony</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <NotificationScheduler 
            eventId={event.id}
            eventName={event.name}
            eventDate={event.startDate}
            guests={guests}
          />
        </TabsContent>
        
        <TabsContent value="scheduled">
          <NotificationsList 
            eventId={event.id}
            notifications={notifications.filter(n => n.status === "scheduled")}
            onDeleteNotification={handleDeleteNotification}
            onSendNowNotification={handleSendNowNotification}
          />
        </TabsContent>
        
        <TabsContent value="sent">
          <NotificationsList 
            eventId={event.id}
            notifications={[
              ...notifications.filter(n => n.status === "sent"),
              ...notifications.filter(n => n.status === "failed")
            ]}
            onDeleteNotification={handleDeleteNotification}
            onSendNowNotification={handleSendNowNotification}
          />
        </TabsContent>
        
        <TabsContent value="templates">
          <NotificationTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
