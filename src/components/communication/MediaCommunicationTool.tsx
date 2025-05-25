
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Bell, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  sentAt: Date;
  status: 'draft' | 'sent' | 'scheduled';
  type: 'email' | 'push' | 'sms';
}

export default function MediaCommunicationTool() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      subject: 'Aktualizacja harmonogramu konferencji',
      content: 'Informujemy o zmianie godziny rozpoczęcia...',
      recipients: ['tvn@example.com', 'polsat@example.com'],
      sentAt: new Date(),
      status: 'sent',
      type: 'email'
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipients: [] as string[],
    type: 'email' as 'email' | 'push' | 'sms'
  });

  const [recipientInput, setRecipientInput] = useState('');

  const addRecipient = () => {
    if (recipientInput && !newMessage.recipients.includes(recipientInput)) {
      setNewMessage(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipientInput]
      }));
      setRecipientInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setNewMessage(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const sendMessage = () => {
    if (!newMessage.subject || !newMessage.content || newMessage.recipients.length === 0) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      ...newMessage,
      sentAt: new Date(),
      status: 'sent'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({
      subject: '',
      content: '',
      recipients: [],
      type: 'email'
    });
    
    toast.success(`Wiadomość ${newMessage.type} została wysłana do ${newMessage.recipients.length} odbiorców`);
  };

  const scheduleMessage = () => {
    // Implementation for scheduling messages
    toast.success('Wiadomość została zaplanowana');
  };

  const sendToAllAccredited = () => {
    // Send to all accredited media
    const allMediaEmails = [
      'tvn@example.com',
      'polsat@example.com', 
      'gazeta@example.com',
      'radio@example.com'
    ];
    
    setNewMessage(prev => ({
      ...prev,
      recipients: allMediaEmails
    }));
    
    toast.success(`Dodano ${allMediaEmails.length} odbiorców z listy akredytowanych mediów`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Narzędzie komunikacji z mediami
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Napisz wiadomość</TabsTrigger>
              <TabsTrigger value="history">Historia wiadomości</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compose" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={sendToAllAccredited}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Wszyscy akredytowani
                </Button>
                
                <div className="flex gap-2">
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage(prev => ({
                      ...prev,
                      type: e.target.value as 'email' | 'push' | 'sms'
                    }))}
                    className="p-2 border rounded-md"
                  >
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Odbiorcy
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Dodaj adres email..."
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                    />
                    <Button onClick={addRecipient} variant="outline">
                      Dodaj
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newMessage.recipients.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeRecipient(email)}
                      >
                        {email} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Temat
                  </label>
                  <Input
                    placeholder="Temat wiadomości..."
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({
                      ...prev,
                      subject: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Treść
                  </label>
                  <Textarea
                    placeholder="Napisz swoją wiadomość..."
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({
                      ...prev,
                      content: e.target.value
                    }))}
                    rows={8}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={sendMessage} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Wyślij teraz
                  </Button>
                  <Button onClick={scheduleMessage} variant="outline">
                    Zaplanuj wysłanie
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {message.type === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                            {message.type === 'push' && <Bell className="h-4 w-4 text-green-500" />}
                            {message.type === 'sms' && <MessageSquare className="h-4 w-4 text-orange-500" />}
                            <h4 className="font-medium">{message.subject}</h4>
                            <Badge 
                              variant={message.status === 'sent' ? 'default' : 'secondary'}
                            >
                              {message.status === 'sent' ? 'Wysłane' : 'Szkic'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Do: {message.recipients.length} odbiorców</span>
                            <span>Wysłane: {message.sentAt.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
