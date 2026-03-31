import { toast } from "sonner";

import React, { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import MediaRegistrationForm from '@/components/press/MediaRegistrationForm';
import MediaRegistrationList from '@/components/press/MediaRegistrationList';
import MediaRegistrationStatus from '@/components/press/MediaRegistrationStatus';
import DocumentUploader from '@/components/documents/DocumentUploader';
import MediaDocumentList from '@/components/press/MediaDocumentList';
import BadgeGenerator from '@/components/badges/BadgeGenerator';
import CheckInSystem from '@/components/checkin/CheckInSystem';
import MediaAnalyticsDashboard from '@/components/analytics/MediaAnalyticsDashboard';
import MediaCommunicationTool from '@/components/communication/MediaCommunicationTool';
import CalendarIntegration from '@/components/calendar/CalendarIntegration';

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
    // Implement edit functionality
    toast.info("Edycja rejestracji w przygotowaniu");
  };
  
  const handleCancelRegistration = () => {
    // Implement cancel functionality
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
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          {!isOrganizer && userRegistration && (
            <DocumentUploader 
              registrationId={userRegistration.id}
              onUploadComplete={(files) => console.log('Uploaded:', files)}
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
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="checkin" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
