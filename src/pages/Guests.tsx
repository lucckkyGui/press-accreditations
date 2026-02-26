
import React, { useState, useEffect } from 'react';
import { useGuestsPage } from "./guests";
import GuestsPageHeader from "./guests/GuestsPageHeader";
import GuestsTabs from "./guests/GuestsTabs";
import GuestsDialogs from "./guests/GuestsDialogs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Guests = () => {
  const guestsPageProps = useGuestsPage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });

      if (data && !error) {
        const mapped: Event[] = data.map(e => ({
          id: e.id,
          name: e.title,
          description: e.description || '',
          location: e.location || '',
          startDate: new Date(e.start_date),
          endDate: new Date(e.end_date),
          isPublished: e.is_published || false,
          organizationId: e.organizer_id || '',
          organizerId: e.organizer_id || '',
          category: e.category || '',
          imageUrl: e.image_url || '',
          maxGuests: e.max_guests || 0,
          createdAt: new Date(e.created_at || ''),
          updatedAt: new Date(e.updated_at || ''),
          createdBy: e.organizer_id || '',
        }));
        setEvents(mapped);
        if (mapped.length > 0 && !guestsPageProps.selectedEvent) {
          guestsPageProps.setSelectedEvent(mapped[0]);
        }
      }
      setLoadingEvents(false);
    };
    fetchEvents();
  }, []);

  if (loadingEvents) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-8 w-8 text-primary/40" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Brak wydarzeń</h2>
        <p className="text-muted-foreground mb-6">Utwórz wydarzenie, aby zarządzać gośćmi</p>
        <Button className="rounded-xl" onClick={() => navigate('/events')}>Utwórz wydarzenie</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event selector */}
      <Card className="rounded-2xl border-border bg-primary/5">
        <CardContent className="py-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-semibold text-foreground whitespace-nowrap">Wydarzenie:</label>
            <Select
              value={guestsPageProps.selectedEvent?.id || ''}
              onValueChange={(val) => {
                const ev = events.find(e => e.id === val);
                if (ev) guestsPageProps.setSelectedEvent(ev);
              }}
            >
              <SelectTrigger className="max-w-md h-11 rounded-xl border-border/60 bg-card">
                <SelectValue placeholder="Wybierz wydarzenie" />
              </SelectTrigger>
              <SelectContent>
                {events.map(ev => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {guestsPageProps.selectedEvent && (
        <>
          <GuestsPageHeader
            selectedEvent={guestsPageProps.selectedEvent}
            onImportClick={() => guestsPageProps.setShowImportDialog(true)}
            onCreateClick={guestsPageProps.handleCreateGuest}
            guestCount={guestsPageProps.total}
          />
          <GuestsTabs {...guestsPageProps} />
          <GuestsDialogs {...guestsPageProps} />
        </>
      )}
    </div>
  );
};

export default Guests;
