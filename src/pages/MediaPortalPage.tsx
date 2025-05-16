
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMediaRegistrations } from '@/hooks/press';
import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';

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
import MediaDocumentUploader from '@/components/press/MediaDocumentUploader';
import MediaDocumentList from '@/components/press/MediaDocumentList';

export default function MediaPortalPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isOrganizer } = useAuth();
  
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
    console.log("Edit registration");
  };
  
  const handleCancelRegistration = () => {
    // Implement cancel functionality
    console.log("Cancel registration");
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
        Apply for media accreditation, manage your applications, and upload supporting documents.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="my-registrations">
            {isOrganizer ? 'All Registrations' : 'My Registrations'}
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-registrations" className="space-y-4">
          {isOrganizer ? (
            <MediaRegistrationList eventId={eventId} isOrganizer={true} />
          ) : (
            <>
              {!showRegistrationForm && !userRegistration && (
                <Card>
                  <CardHeader>
                    <CardTitle>Apply for Media Accreditation</CardTitle>
                    <CardDescription>
                      Submit your application for media accreditation to get access to the event.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      As a media representative, you can apply for accreditation to cover this event.
                      Fill out the form with your details and upload supporting documents.
                    </p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
                      <li>Complete the registration form with your media organization details</li>
                      <li>Upload supporting documents like press ID, portfolio, or assignment letter</li>
                      <li>Track your application status and receive updates</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleCreateNewRegistration}>Apply Now</Button>
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
            <MediaDocumentUploader registrationId={userRegistration.id} />
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
                  <p>You need to apply for accreditation before uploading documents.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab('my-registrations')}
                  >
                    Apply for Accreditation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
