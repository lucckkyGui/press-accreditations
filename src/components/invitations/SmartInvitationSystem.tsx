
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, Users, Globe, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface InvitationTemplate {
  id: string;
  name: string;
  type: 'vip' | 'press' | 'general' | 'staff';
  subject: string;
  language: 'pl' | 'en';
  hasLogo: boolean;
  isPersonalized: boolean;
}

interface ReminderSettings {
  enabled: boolean;
  reminderDays: number[];
  customMessage?: string;
}

const SmartInvitationSystem: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    reminderDays: [3, 1],
    customMessage: ''
  });

  const templates: InvitationTemplate[] = [
    {
      id: 'vip-pl',
      name: 'VIP - Polski',
      type: 'vip',
      subject: 'Ekskluzywne zaproszenie na {EVENT_NAME}',
      language: 'pl',
      hasLogo: true,
      isPersonalized: true
    },
    {
      id: 'vip-en',
      name: 'VIP - English',
      type: 'vip',
      subject: 'Exclusive invitation to {EVENT_NAME}',
      language: 'en',
      hasLogo: true,
      isPersonalized: true
    },
    {
      id: 'press-pl',
      name: 'Prasa - Polski',
      type: 'press',
      subject: 'Akredytacja prasowa - {EVENT_NAME}',
      language: 'pl',
      hasLogo: true,
      isPersonalized: true
    },
    {
      id: 'general-pl',
      name: 'Standardowe - Polski',
      type: 'general',
      subject: 'Zaproszenie na {EVENT_NAME}',
      language: 'pl',
      hasLogo: false,
      isPersonalized: false
    },
    {
      id: 'staff-pl',
      name: 'Personel - Polski',
      type: 'staff',
      subject: 'Instrukcje dla personelu - {EVENT_NAME}',
      language: 'pl',
      hasLogo: true,
      isPersonalized: true
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      case 'press': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleScheduleReminders = async () => {
    if (!reminderSettings.enabled) {
      toast.info('Przypomnienia są wyłączone');
      return;
    }

    toast.success(`Zaplanowano przypomnienia na: ${reminderSettings.reminderDays.join(', ')} dni przed eventem`);
  };

  const handleSendInvitations = async () => {
    if (!selectedTemplate) {
      toast.error('Wybierz szablon zaproszenia');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    toast.success(`Rozpoczęto wysyłkę zaproszeń używając szablonu: ${template?.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inteligentne zaproszenia</h2>
        <Badge variant="outline" className="bg-blue-50">
          <Zap className="h-3 w-3 mr-1" />
          AI-Enhanced
        </Badge>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Szablony</TabsTrigger>
          <TabsTrigger value="reminders">Przypomnienia</TabsTrigger>
          <TabsTrigger value="preview">Podgląd</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Wybierz szablon zaproszenia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge className={getTypeColor(template.type)}>
                          {template.type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {template.subject}
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {template.language.toUpperCase()}
                        </Badge>
                        
                        {template.hasLogo && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Logo
                          </Badge>
                        )}
                        
                        {template.isPersonalized && (
                          <Badge variant="outline" className="text-xs">
                            Personalizowane
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Automatyczne przypomnienia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-reminders"
                  checked={reminderSettings.enabled}
                  onChange={(e) => setReminderSettings(prev => ({
                    ...prev,
                    enabled: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="enable-reminders" className="font-medium">
                  Włącz automatyczne przypomnienia
                </label>
              </div>

              {reminderSettings.enabled && (
                <div className="space-y-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Wyślij przypomnienia (dni przed eventem):
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[7, 3, 1].map(days => (
                        <label key={days} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={reminderSettings.reminderDays.includes(days)}
                            onChange={(e) => {
                              setReminderSettings(prev => ({
                                ...prev,
                                reminderDays: e.target.checked
                                  ? [...prev.reminderDays, days]
                                  : prev.reminderDays.filter(d => d !== days)
                              }));
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{days} {days === 1 ? 'dzień' : 'dni'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Dodatkowa wiadomość w przypomnieniu:
                    </label>
                    <textarea
                      value={reminderSettings.customMessage}
                      onChange={(e) => setReminderSettings(prev => ({
                        ...prev,
                        customMessage: e.target.value
                      }))}
                      placeholder="np. Nie zapomnij przynieść dokumentu tożsamości..."
                      className="w-full p-2 border rounded-md text-sm"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleScheduleReminders} className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Zaplanuj przypomnienia
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Podgląd zaproszenia</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium">Wybrano szablon:</div>
                    <div className="text-sm text-muted-foreground">
                      {templates.find(t => t.id === selectedTemplate)?.name}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="text-sm text-gray-600 mb-2">Podgląd emaila:</div>
                    <div className="space-y-2">
                      <div><strong>Temat:</strong> {templates.find(t => t.id === selectedTemplate)?.subject}</div>
                      <div className="text-sm text-gray-600">
                        [Tutaj będzie personalizowana treść zaproszenia z QR kodem]
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Wybierz szablon aby zobaczyć podgląd
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button 
          onClick={handleSendInvitations} 
          disabled={!selectedTemplate}
          className="flex-1"
        >
          Wyślij zaproszenia
        </Button>
        <Button variant="outline" className="flex-1">
          Zapisz jako szablon
        </Button>
      </div>
    </div>
  );
};

export default SmartInvitationSystem;
