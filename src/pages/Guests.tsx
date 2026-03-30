
import React, { useState, useEffect } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGuestsPage } from "./guests";
import GuestsPageHeader from "./guests/GuestsPageHeader";
import GuestsTabs from "./guests/GuestsTabs";
import GuestsDialogs from "./guests/GuestsDialogs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { CalendarDays, Shield, FileDown, Brain, Fingerprint, BarChart3, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ZoneManagement from '@/components/guests/advanced/ZoneManagement';
import BlacklistWhitelistManager from '@/components/guests/advanced/BlacklistWhitelistManager';
import ReportExporter from '@/components/reports/ReportExporter';
import AIFraudDetection from '@/components/security/AIFraudDetection';
import BiometricVerification from '@/components/security/BiometricVerification';
import PredictiveAnalytics from '@/components/analytics/PredictiveAnalytics';
import BlockchainCredentials from '@/components/guests/advanced/BlockchainCredentials';

const Guests = () => {
  const guestsPageProps = useGuestsPage();
  usePageTitle("Goście");
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [mainTab, setMainTab] = useState('guests');
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

      {/* Main tabs: Guests list + Advanced */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="guests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista gości
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Zaawansowane
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guests">
          {guestsPageProps.selectedEvent && (
            <>
              <GuestsPageHeader
                selectedEvent={guestsPageProps.selectedEvent}
                onImportClick={() => guestsPageProps.setShowImportDialog(true)}
                onCreateClick={guestsPageProps.handleCreateGuest}
                guestCount={guestsPageProps.total}
                guests={guestsPageProps.guests}
              />
              <GuestsTabs {...guestsPageProps} />
              <GuestsDialogs {...guestsPageProps} />
            </>
          )}
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedGuestsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AdvancedGuestsPanel = () => {
  const [activeTab, setActiveTab] = useState('zones');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Zaawansowane zarządzanie</h2>
        <p className="text-muted-foreground">AI, strefy, raporty i bezpieczeństwo</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Strefy</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Kontrola</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Raporty</span>
          </TabsTrigger>
          <TabsTrigger value="ai-fraud" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Fraud</span>
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            <span className="hidden sm:inline">Biometria</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Analityka</span>
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Blockchain</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones"><ZoneManagement /></TabsContent>
        <TabsContent value="security"><BlacklistWhitelistManager /></TabsContent>
        <TabsContent value="reports"><ReportExporter /></TabsContent>
        <TabsContent value="ai-fraud"><AIFraudDetection /></TabsContent>
        <TabsContent value="biometric"><BiometricVerification /></TabsContent>
        <TabsContent value="analytics"><PredictiveAnalytics /></TabsContent>
        <TabsContent value="blockchain"><BlockchainCredentials /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Guests;
