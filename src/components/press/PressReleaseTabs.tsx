
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PressReleaseList from './PressReleaseList';
import MediaGroupList from './MediaGroupList';
import MediaContactList from './MediaContactList';

const PressReleaseTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('press-releases');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="press-releases">Komunikaty prasowe</TabsTrigger>
        <TabsTrigger value="media-groups">Grupy mediów</TabsTrigger>
        <TabsTrigger value="media-contacts">Kontakty medialne</TabsTrigger>
      </TabsList>
      
      <TabsContent value="press-releases" className="mt-6">
        <PressReleaseList />
      </TabsContent>
      
      <TabsContent value="media-groups" className="mt-6">
        <MediaGroupList />
      </TabsContent>
      
      <TabsContent value="media-contacts" className="mt-6">
        <MediaContactList />
      </TabsContent>
    </Tabs>
  );
};

export default PressReleaseTabs;
