
import React from 'react';
import PageContent from '@/components/layout/PageContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedQRScanner from '@/components/scanner/EnhancedQRScanner';
import FaceRecognitionCheckIn from '@/components/scanner/FaceRecognitionCheckIn';
import BulkFaceEnrollment from '@/components/scanner/BulkFaceEnrollment';
import { QrCode, ScanFace, Upload } from 'lucide-react';

// Mock event - w rzeczywistej aplikacji byłby pobierany z kontekstu/API
const mockEvent = {
  id: 'event-1',
  name: 'Konferencja Tech 2024',
  description: 'Największa konferencja technologiczna w Polsce',
  location: 'Centrum Kongresowe, Warszawa',
  startDate: new Date('2024-03-15T09:00:00'),
  endDate: new Date('2024-03-15T18:00:00'),
  isPublished: true,
  organizationId: 'org-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-1'
};

const Scanner = () => {
  const handleGuestCheckedIn = (guest: any) => {
    console.log('Guest checked in:', guest);
  };

  return (
    <PageContent>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Skaner Check-in</h1>
          <p className="text-muted-foreground">
            Skanuj kody QR, użyj rozpoznawania twarzy lub masowego enrollmentu
          </p>
        </div>

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
              event={mockEvent}
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
      </div>
    </PageContent>
  );
};

export default Scanner;
