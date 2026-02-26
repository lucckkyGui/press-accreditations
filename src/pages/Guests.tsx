
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

const Guests = () => {
  const guestsPageProps = useGuestsPage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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
      <div className="text-center py-16">
        <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Brak wydarzeń</h2>
        <p className="text-muted-foreground">Utwórz wydarzenie, aby zarządzać gośćmi</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Wybierz wydarzenie</label>
        <Select
          value={guestsPageProps.selectedEvent?.id || ''}
          onValueChange={(val) => {
            const ev = events.find(e => e.id === val);
            if (ev) guestsPageProps.setSelectedEvent(ev);
          }}
        >
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Wybierz wydarzenie" />
          </SelectTrigger>
          <SelectContent>
            {events.map(ev => (
              <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
