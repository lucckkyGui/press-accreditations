
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PressReleaseTabs from '@/components/press/PressReleaseTabs';

const PressReleasePage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Komunikaty prasowe</h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <PressReleaseTabs />
        </CardContent>
      </Card>
    </div>
  );
};

export default PressReleasePage;
