
import React from 'react';
import PageContent from '@/components/layout/PageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedQRScanner from '@/components/scanner/EnhancedQRScanner';
import { QrCode } from 'lucide-react';

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
    // Tu można dodać logikę aktualizacji bazy danych
  };

  return (
    <PageContent>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <QrCode className="h-8 w-8" />
            Skaner QR Kodów
          </h1>
          <p className="text-muted-foreground">
            Skanuj kody QR gości aby zarejestrować ich obecność na wydarzeniu
          </p>
        </div>

        <EnhancedQRScanner
          event={mockEvent}
          onGuestCheckedIn={handleGuestCheckedIn}
        />
      </div>
    </PageContent>
  );
};

export default Scanner;
