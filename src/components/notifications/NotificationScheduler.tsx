
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Send, Users } from "lucide-react";
import { Guest } from "@/types";
import { NotificationTemplate, Notification } from "@/types/notifications";
import { toast } from "sonner";
import NotificationTemplates from "./NotificationTemplates";

interface NotificationSchedulerProps {
  eventId: string;
  eventName: string;
  eventDate: Date;
  guests: Guest[];
}

const NotificationScheduler = ({ eventId, eventName, eventDate, guests }: NotificationSchedulerProps) => {
  const [notification, setNotification] = useState<Partial<Notification>>({
    eventId,
    title: "",
    message: "",
    type: "reminder",
    status: "scheduled",
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow by default
  });

  const [guestFilter, setGuestFilter] = useState<string>("all");
  const [showTemplates, setShowTemplates] = useState(false);

  const handleScheduleNotification = () => {
    const recipientsCount = guestFilter === "all" 
      ? guests.length 
      : guests.filter(g => g.status === guestFilter).length;

    if (!notification.title || !notification.message) {
      toast.error("Proszę wypełnić tytuł i treść powiadomienia.");
      return;
    }

    // W rzeczywistej aplikacji, tutaj wysłalibyśmy zapytanie do API
    // aby zapisać powiadomienie w bazie danych
    const newNotification: Notification = {
      id: Date.now().toString(),
      eventId,
      title: notification.title || "",
      message: notification.message || "",
      type: notification.type as "reminder",
      status: "scheduled",
      scheduledFor: notification.scheduledFor || new Date(),
    };
    
    console.log("Zaplanowano powiadomienie:", newNotification);
    toast.success(`Powiadomienie zaplanowane dla ${recipientsCount} gości na ${format(notification.scheduledFor!, 'dd.MM.yyyy HH:mm')}`);
    
    // Reset form
    setNotification({
      eventId,
      title: "",
      message: "",
      type: "reminder",
      status: "scheduled",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    setGuestFilter("all");
  };
  
  const applyTemplate = (template: NotificationTemplate) => {
    // Replace variables in template
    let title = template.title;
    let message = template.message;
    
    // Replace variables with event data
    title = title.replace(/{eventName}/g, eventName);
    title = title.replace(/{eventDate}/g, format(eventDate, 'dd.MM.yyyy'));
    title = title.replace(/{eventTime}/g, format(eventDate, 'HH:mm'));
    
    message = message.replace(/{eventName}/g, eventName);
    message = message.replace(/{eventDate}/g, format(eventDate, 'dd.MM.yyyy'));
    message = message.replace(/{eventTime}/g, format(eventDate, 'HH:mm'));
    
    setNotification(prev => ({
      ...prev,
      title,
      message,
      type: template.type,
    }));
    
    setShowTemplates(false);
  };

  const getRecipientsCount = () => {
    if (guestFilter === "all") return guests.length;
    return guests.filter(g => g.status === guestFilter).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zaplanuj powiadomienia</h2>
        <Button 
          variant="outline" 
          onClick={() => setShowTemplates(!showTemplates)}
        >
          {showTemplates ? "Ukryj szablony" : "Pokaż szablony"}
        </Button>
      </div>
      
      {showTemplates && (
        <Card>
          <CardContent className="pt-6">
            <NotificationTemplates onSelectTemplate={applyTemplate} />
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Nowe powiadomienie</CardTitle>
          <CardDescription>
            Zaplanuj powiadomienie dla gości wydarzenia {eventName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Odbiorcy</label>
            <Select value={guestFilter} onValueChange={setGuestFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wszyscy goście" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszyscy goście ({guests.length})</SelectItem>
                <SelectItem value="invited">Zaproszeni ({guests.filter(g => g.status === "invited").length})</SelectItem>
                <SelectItem value="confirmed">Potwierdzeni ({guests.filter(g => g.status === "confirmed").length})</SelectItem>
                <SelectItem value="declined">Odrzuceni ({guests.filter(g => g.status === "declined").length})</SelectItem>
                <SelectItem value="checked-in">Obecni ({guests.filter(g => g.status === "checked-in").length})</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Users className="h-4 w-4 mr-1" />
              <span>{getRecipientsCount()} odbiorców</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Data i godzina wysyłki</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !notification.scheduledFor && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {notification.scheduledFor ? (
                      format(notification.scheduledFor, 'dd.MM.yyyy', { locale: pl })
                    ) : (
                      <span>Wybierz datę</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={notification.scheduledFor}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        const hours = notification.scheduledFor ? notification.scheduledFor.getHours() : 9;
                        const minutes = notification.scheduledFor ? notification.scheduledFor.getMinutes() : 0;
                        newDate.setHours(hours, minutes);
                        
                        setNotification(prev => ({
                          ...prev,
                          scheduledFor: newDate
                        }));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex w-full max-w-[180px] items-center">
                <Clock className="h-4 w-4 mr-2" />
                <Input
                  type="time"
                  value={notification.scheduledFor ? 
                    `${String(notification.scheduledFor.getHours()).padStart(2, '0')}:${String(notification.scheduledFor.getMinutes()).padStart(2, '0')}` : 
                    "09:00"
                  }
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = notification.scheduledFor ? new Date(notification.scheduledFor) : new Date();
                    newDate.setHours(hours, minutes);
                    
                    setNotification(prev => ({
                      ...prev,
                      scheduledFor: newDate
                    }));
                  }}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Tytuł powiadomienia</label>
            <Input
              value={notification.title}
              onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Np. Przypomnienie o wydarzeniu"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Treść powiadomienia</label>
            <Textarea
              value={notification.message}
              onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Treść powiadomienia..."
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Dostępne zmienne: {"{guestName}"}, {"{eventName}"}, {"{eventDate}"}, {"{eventTime}"}, {"{location}"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleScheduleNotification} className="gap-2">
            <Send className="h-4 w-4" />
            Zaplanuj powiadomienie
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationScheduler;
