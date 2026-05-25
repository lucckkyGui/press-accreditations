
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ZonesList from './ZonesList';
import { AccessZone } from '@/types/zones';

interface ZoneTabsProps {
  zones: AccessZone[];
  showAddZone: boolean;
  newZone: Partial<AccessZone>;
  onZoneChange: (zone: Partial<AccessZone>) => void;
  onAddZone: () => void;
  onCancelAdd: () => void;
  onEditZone: (zoneId: string) => void;
  onDeleteZone: (zoneId: string) => void;
}

const ZoneTabs: React.FC<ZoneTabsProps> = (props) => {
  return (
    <Tabs defaultValue="zones" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="zones">Strefy</TabsTrigger>
        <TabsTrigger value="restrictions">Ograniczenia</TabsTrigger>
        <TabsTrigger value="analytics">Analityka</TabsTrigger>
      </TabsList>

      <TabsContent value="zones" className="space-y-4">
        <ZonesList {...props} />
      </TabsContent>

      <TabsContent value="restrictions">
        <Card>
          <CardHeader>
            <CardTitle>Ograniczenia czasowe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tutaj możesz skonfigurować ograniczenia czasowe dla poszczególnych stref.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analityka stref</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Statystyki wykorzystania stref i raport dostępu.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ZoneTabs;
