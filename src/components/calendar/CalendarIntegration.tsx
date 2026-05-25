
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  attendees: string[];
  type: 'conference' | 'press-briefing' | 'interview' | 'workshop';
}

export default function CalendarIntegration() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Konferencja prasowa - Nowe produkty 2024',
      description: 'Prezentacja nowych produktów i strategii na 2024 rok',
      startTime: new Date(2024, 5, 15, 10, 0),
      endTime: new Date(2024, 5, 15, 12, 0),
      location: 'Hotel Warsaw, Sala Konferencyjna A',
      attendees: ['media@company.com'],
      type: 'conference'
    },
    {
      id: '2',
      title: 'Wywiad z CEO',
      description: 'Indywidualny wywiad na temat przyszłości branży',
      startTime: new Date(2024, 5, 16, 14, 0),
      endTime: new Date(2024, 5, 16, 15, 0),
      location: 'Biuro główne, pokój 301',
      attendees: ['reporter@tvn.pl'],
      type: 'interview'
    }
  ]);

  const generateCalendarLink = (event: CalendarEvent, provider: 'google' | 'outlook' | 'ics') => {
    const startTime = event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    const title = encodeURIComponent(event.title);
    
    if (provider === 'google') {
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    } else if (provider === 'outlook') {
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startTime}&enddt=${endTime}&body=${details}&location=${location}`;
    } else {
      // Generate ICS file content
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Press Accreditations//Calendar//EN
BEGIN:VEVENT
UID:${event.id}@pressaccreditations.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
      
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      return URL.createObjectURL(blob);
    }
  };

  const openCalendarLink = (event: CalendarEvent, provider: 'google' | 'outlook') => {
    const link = generateCalendarLink(event, provider);
    window.open(link, '_blank');
    toast.success(`Otwarto kalendarz ${provider === 'google' ? 'Google' : 'Outlook'}`);
  };

  const downloadICSFile = (event: CalendarEvent) => {
    const link = generateCalendarLink(event, 'ics');
    const a = document.createElement('a');
    a.href = link;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(link);
    toast.success('Plik kalendarza został pobrany');
  };

  const shareEvent = (event: CalendarEvent) => {
    const eventDetails = `📅 ${event.title}
🕐 ${event.startTime.toLocaleString()} - ${event.endTime.toLocaleTimeString()}
📍 ${event.location}
📝 ${event.description}`;

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: eventDetails,
      });
    } else {
      navigator.clipboard.writeText(eventDetails);
      toast.success('Szczegóły wydarzenia skopiowane do schowka');
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'conference': return 'bg-blue-100 text-blue-800';
      case 'press-briefing': return 'bg-green-100 text-green-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'conference': return 'Konferencja';
      case 'press-briefing': return 'Briefing prasowy';
      case 'interview': return 'Wywiad';
      case 'workshop': return 'Warsztat';
      default: return 'Wydarzenie';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Integracja z kalendarzem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString()} - {event.endTime.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees.length} uczestników</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCalendarLink(event, 'google')}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    Google Calendar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCalendarLink(event, 'outlook')}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    Outlook
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadICSFile(event)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Pobierz .ics
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareEvent(event)}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    Udostępnij
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Automatyczna synchronizacja</h4>
          <p className="text-sm text-blue-700 mb-3">
            Wydarzenia są automatycznie synchronizowane z Twoim kalendarzem. 
            Otrzymasz powiadomienia o zbliżających się terminach.
          </p>
          <Button size="sm" variant="outline">
            Skonfiguruj automatyczną synchronizację
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
