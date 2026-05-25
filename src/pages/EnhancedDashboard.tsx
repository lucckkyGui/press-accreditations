
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Zap, Smartphone, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageContent from '@/components/layout/PageContent';
import RealTimeDashboard from '@/components/dashboard/RealTimeDashboard';
import SmartInvitationSystem from '@/components/invitations/SmartInvitationSystem';
import { Button } from '@/components/ui/button';

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const navigate = useNavigate();

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enhanced Dashboard</h1>
            <p className="text-muted-foreground">
              Zaawansowane funkcje zarządzania eventami z analityką na żywo
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analityka na żywo
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Smart Zaproszenia
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Offline Check-in
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-4">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <SmartInvitationSystem />
          </TabsContent>

          <TabsContent value="offline" className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Offline check-in</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lokalna walidacja QR, manifest wydarzenia i kolejka skanów są dostępne w skanerze QR.
                  </p>
                </div>
                <Button onClick={() => navigate('/scanner')} className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Otwórz skaner QR
                </Button>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </PageContent>
  );
};

export default EnhancedDashboard;
