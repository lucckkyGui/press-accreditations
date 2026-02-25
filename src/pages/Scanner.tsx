
import React, { useState, useEffect } from 'react';
import PageContent from '@/components/layout/PageContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedQRScanner from '@/components/scanner/EnhancedQRScanner';
import FaceRecognitionCheckIn from '@/components/scanner/FaceRecognitionCheckIn';
import BulkFaceEnrollment from '@/components/scanner/BulkFaceEnrollment';
import { QrCode, ScanFace, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Scanner = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (mapped.length > 0) {
          setSelectedEvent(mapped[0]);
        }
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleGuestCheckedIn = (guest: any) => {
    console.log('Guest checked in:', guest);
  };

  if (loading) {
    return (
      <PageContent>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Skaner Check-in</h1>
          <p className="text-muted-foreground mb-4">
            Skanuj kody QR gości na wybranym wydarzeniu
          </p>

          {events.length > 0 ? (
            <Select
              value={selectedEvent?.id || ''}
              onValueChange={(val) => {
                const ev = events.find(e => e.id === val);
                if (ev) setSelectedEvent(ev);
              }}
            >
              <SelectTrigger className="max-w-sm mx-auto">
                <SelectValue placeholder="Wybierz wydarzenie" />
              </SelectTrigger>
              <SelectContent>
                {events.map(ev => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-muted-foreground">Brak wydarzeń. Utwórz wydarzenie, aby rozpocząć skanowanie.</p>
          )}
        </div>

        {selectedEvent && (
          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Kod QR
              </TabsTrigger>
              <TabsTrigger value="face" className="flex items-center gap-2">
                <ScanFace className="h-4 w-4" />
                Twarz
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Masowy enrollment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr">
              <EnhancedQRScanner
                event={selectedEvent}
                onGuestCheckedIn={handleGuestCheckedIn}
              />
            </TabsContent>

            <TabsContent value="face">
              <FaceRecognitionCheckIn />
            </TabsContent>

            <TabsContent value="bulk">
              <BulkFaceEnrollment />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageContent>
  );
};

export default Scanner;
