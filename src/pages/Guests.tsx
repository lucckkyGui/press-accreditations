
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGuestsPage } from "./guest-management/useGuestsPage";
import GuestsPageHeader from "./guest-management/GuestsPageHeader";
import GuestsTabs from "./guest-management/GuestsTabs";
import GuestsDialogs from "./guest-management/GuestsDialogs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import { GuestsSkeleton } from '@/components/common/PageSkeleton';
import { CalendarDays, Shield, FileDown, Brain, Fingerprint, BarChart3, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { features } from '@/config/features';

// Lazy-load heavy advanced tab components
const ZoneManagement = lazy(() => import('@/components/guests/advanced/ZoneManagement'));
const BlacklistWhitelistManager = lazy(() => import('@/components/guests/advanced/BlacklistWhitelistManager'));
const ReportExporter = lazy(() => import('@/components/reports/ReportExporter'));
const AIFraudDetection = lazy(() => import('@/components/security/AIFraudDetection'));
const BiometricVerification = lazy(() => import('@/components/security/BiometricVerification'));
const PredictiveAnalytics = lazy(() => import('@/components/analytics/PredictiveAnalytics'));
const BlockchainCredentials = lazy(() => import('@/components/guests/advanced/BlockchainCredentials'));

const LazyTab = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner /></div>}>
    {children}
  </Suspense>
);

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
    return <GuestsSkeleton />;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto mb-4 h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-7 w-7 text-primary/50" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-2">Brak wydarzeń</h2>
        <p className="text-muted-foreground mb-6 text-sm">Utwórz wydarzenie, aby zarządzać gośćmi</p>
        <Button className="rounded-lg" onClick={() => navigate('/events?new=1')}>Utwórz wydarzenie</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event selector */}
      <Card className="rounded-lg border-border bg-card">
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
  const advancedTabs = [
    {
      value: 'zones',
      icon: BarChart3,
      label: 'Strefy',
      content: <ZoneManagement />,
    },
    {
      value: 'security',
      icon: Shield,
      label: 'Kontrola',
      content: <BlacklistWhitelistManager />,
    },
    {
      value: 'reports',
      icon: FileDown,
      label: 'Raporty',
      content: <ReportExporter />,
    },
    ...(features.aiFraud ? [{
      value: 'ai-fraud',
      icon: Brain,
      label: 'AI Fraud',
      content: <AIFraudDetection />,
    }] : []),
    ...(features.faceRecognition ? [{
      value: 'biometric',
      icon: Fingerprint,
      label: 'Biometria',
      content: <BiometricVerification />,
    }] : []),
    {
      value: 'analytics',
      icon: Brain,
      label: 'Analityka',
      content: <PredictiveAnalytics />,
    },
    ...(features.blockchain ? [{
      value: 'blockchain',
      icon: Shield,
      label: 'Blockchain',
      content: <BlockchainCredentials />,
    }] : []),
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Zaawansowane zarządzanie</h2>
        <p className="text-muted-foreground">AI, strefy, raporty i bezpieczeństwo</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {advancedTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {advancedTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <LazyTab>{tab.content}</LazyTab>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Guests;
