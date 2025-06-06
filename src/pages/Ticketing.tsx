
import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import PageContent from "@/components/layout/PageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin } from "lucide-react";

const Ticketing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleTicketCheckout = () => {
    toast.success("Bilety zostały zarezerwowane pomyślnie!");
    setTimeout(() => navigate("/profile?tab=tickets"), 1500);
  };

  const mockEvents = [
    {
      id: '1',
      title: 'Konferencja Tech 2024',
      date: '2024-03-15',
      location: 'Warszawa',
      price: 299
    },
    {
      id: '2',
      title: 'AI Summit Warsaw',
      date: '2024-04-20',
      location: 'Kraków',
      price: 399
    }
  ];

  return (
    <PageContent>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Biletowy</h1>
          <p className="text-muted-foreground">
            Zarezerwuj bilety na wybrane wydarzenia i zarządzaj swoimi akredytacjami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  {event.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{event.price} PLN</span>
                  <Button onClick={handleTicketCheckout}>
                    Zarezerwuj
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContent>
  );
};

export default Ticketing;
