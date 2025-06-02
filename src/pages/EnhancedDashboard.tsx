
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Zap, Smartphone, Settings } from 'lucide-react';
import PageContent from '@/components/layout/PageContent';
import RealTimeDashboard from '@/components/dashboard/RealTimeDashboard';
import SmartInvitationSystem from '@/components/invitations/SmartInvitationSystem';
import OfflineCheckinSystem from '@/components/scanner/OfflineCheckinSystem';

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('realtime');

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
            <OfflineCheckinSystem />
          </TabsContent>
        </Tabs>
      </div>
    </PageContent>
  );
};

export default EnhancedDashboard;
