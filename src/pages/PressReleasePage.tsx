
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PageContent from '@/components/layout/PageContent';

const PressReleasePage: React.FC = () => {
  return (
    <PageContent>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Komunikaty prasowe</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">System komunikatów prasowych będzie dostępny wkrótce</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default PressReleasePage;
