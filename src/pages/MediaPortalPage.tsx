import { toast } from "sonner";

import React, { useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useMediaRegistrations } from '@/hooks/press';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Lazy-load heavy tab components
const MediaRegistrationForm = lazy(() => import('@/components/press/MediaRegistrationForm'));
const MediaRegistrationList = lazy(() => import('@/components/press/MediaRegistrationList'));
const MediaRegistrationStatus = lazy(() => import('@/components/press/MediaRegistrationStatus'));
const DocumentUploader = lazy(() => import('@/components/documents/DocumentUploader'));
const MediaDocumentList = lazy(() => import('@/components/press/MediaDocumentList'));
const BadgeGenerator = lazy(() => import('@/components/badges/BadgeGenerator'));
const CheckInSystem = lazy(() => import('@/components/checkin/CheckInSystem'));
const MediaAnalyticsDashboard = lazy(() => import('@/components/analytics/MediaAnalyticsDashboard'));
const MediaCommunicationTool = lazy(() => import('@/components/communication/MediaCommunicationTool'));
const CalendarIntegration = lazy(() => import('@/components/calendar/CalendarIntegration'));

const LazyTab = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner /></div>}>
    {children}
  </Suspense>
);

export default function MediaPortalPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, profile, isOrganizer } = useAuth();
  
  const [activeTab, setActiveTab] = useState('my-registrations');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const { registrations, isLoading } = useMediaRegistrations(
    { eventId: eventId!, userId: isOrganizer ? undefined : user?.id },
    { enabled: Boolean(eventId) }
  );
  
  const userRegistration = registrations?.[0];
  
  const handleCreateNewRegistration = () => {
    setShowRegistrationForm(true);
  };
  
  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
  };
  
  const handleEditRegistration = () => {
    toast.info("Edycja rejestracji w przygotowaniu");
  };
  
  const handleCancelRegistration = () => {
    toast.info("Anulowanie rejestracji w przygotowaniu");
  };
  
  if (!eventId) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Media Portal</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p>No event selected. Please select an event.</p>
              <Button className="mt-4" onClick={() => navigate('/events')}>
                Browse Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Media Portal</h1>
      <p className="text-gray-600 mb-6">
        Kompleksowy portal dla mediów - akredytacje, dokumenty, komunikacja i analityka.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="my-registrations">
            {isOrganizer ? 'Akredytacje' : 'Moje zgłoszenia'}
          </TabsTrigger>
          <TabsTrigger value="documents">Dokumenty</TabsTrigger>
          <TabsTrigger value="badges">Identyfikatory</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="analytics">Analityka</TabsTrigger>
          <TabsTrigger value="communication">Komunikacja</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-registrations" className="space-y-4">
          <LazyTab>
            {isOrganizer ? (
              <MediaRegistrationList eventId={eventId} isOrganizer={true} />
            ) : (
              <>
                {!showRegistrationForm && !userRegistration && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Aplikuj o akredytację medialną</CardTitle>
                      <CardDescription>
                        Złóż wniosek o akredytację medialną aby uzyskać dostęp do wydarzenia.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Jako przedstawiciel mediów możesz aplikować o akredytację do relacjonowania tego wydarzenia.
                      </p>
                      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
                        <li>Wypełnij formularz rejestracyjny z danymi Twojej organizacji medialnej</li>
                        <li>Prześlij dokumenty potwierdzające (legitymacja prasowa, portfolio)</li>
                        <li>Śledź status swojego wniosku i otrzymuj aktualizacje</li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleCreateNewRegistration}>Aplikuj teraz</Button>
                    </CardFooter>
                  </Card>
                )}
                
                {showRegistrationForm && !userRegistration && (
                  <MediaRegistrationForm 
                    eventId={eventId}
                    onSuccess={handleRegistrationSuccess} 
                  />
                )}
                
                {userRegistration && (
                  <div className="space-y-6">
                    <MediaRegistrationStatus 
                      registration={userRegistration} 
                      onEdit={handleEditRegistration}
                      onCancel={handleCancelRegistration}
                    />
                    
                    <MediaRegistrationList eventId={eventId} />
                  </div>
                )}
              </>
            )}
          </LazyTab>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <LazyTab>
            {!isOrganizer && userRegistration && (
              <DocumentUploader 
                registrationId={userRegistration.id}
                onUploadComplete={(files) => {}}
              />
            )}
            
            {userRegistration && (
              <MediaDocumentList 
                registrationId={userRegistration.id}
                isOrganizer={isOrganizer} 
              />
            )}
            
            {!userRegistration && !isOrganizer && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p>Musisz najpierw aplikować o akredytację aby móc przesyłać dokumenty.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab('my-registrations')}
                    >
                      Aplikuj o akredytację
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </LazyTab>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <LazyTab>
            {userRegistration && (
              <BadgeGenerator
                registrationId={userRegistration.id}
                userInfo={{
                  firstName: profile?.firstName || '',
                  lastName: profile?.lastName || '',
                  mediaOrganization: userRegistration.mediaOrganization,
                  jobTitle: userRegistration.jobTitle
                }}
                eventInfo={{
                  name: 'Konferencja Tech 2024',
                  date: new Date().toLocaleDateString(),
                  location: 'Hotel Warsaw'
                }}
              />
            )}
            
            {!userRegistration && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p>Aby wygenerować identyfikator, musisz mieć zatwierdzoną akredytację.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab('my-registrations')}
                    >
                      Sprawdź status akredytacji
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </LazyTab>
        </TabsContent>

        <TabsContent value="checkin" className="space-y-4">
          <LazyTab>
            {isOrganizer ? (
              <CheckInSystem />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p>System check-in/check-out jest dostępny tylko dla organizatorów.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </LazyTab>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <LazyTab>
            {isOrganizer ? (
              <MediaAnalyticsDashboard />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p>Panel analityczny jest dostępny tylko dla organizatorów.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </LazyTab>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <LazyTab>
            {isOrganizer ? (
              <div className="space-y-6">
                <MediaCommunicationTool />
                <CalendarIntegration />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p>Narzędzia komunikacji są dostępne tylko dla organizatorów.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </LazyTab>
        </TabsContent>
      </Tabs>
    </div>
  );
}
