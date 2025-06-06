
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, FileDown, BarChart3, Brain, Fingerprint } from 'lucide-react';
import PageContent from '@/components/layout/PageContent';
import ZoneManagement from '@/components/guests/advanced/ZoneManagement';
import BlacklistWhitelistManager from '@/components/guests/advanced/BlacklistWhitelistManager';
import ReportExporter from '@/components/reports/ReportExporter';
import AIFraudDetection from '@/components/security/AIFraudDetection';
import BiometricVerification from '@/components/security/BiometricVerification';
import PredictiveAnalytics from '@/components/analytics/PredictiveAnalytics';
import BlockchainCredentials from '@/components/guests/advanced/BlockchainCredentials';

const AdvancedGuests = () => {
  const [activeTab, setActiveTab] = useState('zones');

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Zaawansowane zarządzanie gośćmi</h1>
            <p className="text-muted-foreground">
              AI, blockchain, biometria i zaawansowana analityka
            </p>
          </div>
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

          <TabsContent value="zones" className="space-y-4">
            <ZoneManagement />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <BlacklistWhitelistManager />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportExporter />
          </TabsContent>

          <TabsContent value="ai-fraud" className="space-y-4">
            <AIFraudDetection />
          </TabsContent>

          <TabsContent value="biometric" className="space-y-4">
            <BiometricVerification />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-4">
            <BlockchainCredentials />
          </TabsContent>
        </Tabs>
      </div>
    </PageContent>
  );
};

export default AdvancedGuests;
