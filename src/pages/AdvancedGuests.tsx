
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, FileDown, BarChart3 } from 'lucide-react';
import PageContent from '@/components/layout/PageContent';
import ZoneManagement from '@/components/guests/advanced/ZoneManagement';
import BlacklistWhitelistManager from '@/components/guests/advanced/BlacklistWhitelistManager';
import ReportExporter from '@/components/reports/ReportExporter';

const AdvancedGuests = () => {
  const [activeTab, setActiveTab] = useState('zones');

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Zaawansowane zarządzanie gośćmi</h1>
            <p className="text-muted-foreground">
              Strefy dostępu, kontrola bezpieczeństwa i eksport raportów
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="zones" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Strefy dostępu
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Kontrola bezpieczeństwa
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export raportów
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zones" className="space-y-4">
            <ZoneManagement />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <BlacklistWhitelistManager />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportExporter />
          </TabsContent>
        </Tabs>
      </div>
    </PageContent>
  );
};

export default AdvancedGuests;
