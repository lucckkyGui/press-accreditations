
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, Mail, Send, Trash } from "lucide-react";
import { Notification } from "@/types/notifications";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationsListProps {
  eventId: string;
  notifications: Notification[];
  onDeleteNotification: (id: string) => void;
  onSendNowNotification: (notification: Notification) => void;
}

const NotificationsList = ({ 
  eventId, 
  notifications, 
  onDeleteNotification, 
  onSendNowNotification 
}: NotificationsListProps) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  const handleDeleteClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDeleteDialog(true);
  };
  
  const handleSendNowClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowSendDialog(true);
  };
  
  const confirmDelete = () => {
    if (selectedNotification) {
      onDeleteNotification(selectedNotification.id);
      toast.success("Powiadomienie zostało usunięte");
    }
    setShowDeleteDialog(false);
  };
  
  const confirmSendNow = () => {
    if (selectedNotification) {
      onSendNowNotification(selectedNotification);
    }
    setShowSendDialog(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Zaplanowane</Badge>;
      case "sent":
        return <Badge variant="secondary">Wysłane</Badge>;
      case "failed":
        return <Badge variant="destructive">Błąd</Badge>;
      default:
        return null;
    }
  };

  // Check if a notification is in the past
  const isNotificationPast = (date: Date) => {
    return date < new Date();
  };

  return (
    <div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Zaplanowane powiadomienia</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak zaplanowanych powiadomień
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-md border flex flex-col sm:flex-row justify-between items-start gap-3 ${
                      notification.status === "failed" ? "bg-red-50 border-red-200" :
                      notification.status === "sent" ? "bg-gray-50" :
                      isNotificationPast(notification.scheduledFor) ? "bg-amber-50 border-amber-200" : 
                      "bg-white"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="font-medium line-clamp-1">{notification.title}</div>
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusBadge(notification.status)}
                          
                          {isNotificationPast(notification.scheduledFor) && notification.status === "scheduled" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Opóźnione
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {format(notification.scheduledFor, 'dd.MM.yyyy', { locale: pl })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {format(notification.scheduledFor, 'HH:mm', { locale: pl })}
                        </div>
                        {notification.sentAt && (
                          <div className="flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            Wysłano: {format(notification.sentAt, 'dd.MM.yyyy HH:mm', { locale: pl })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {notification.status === "scheduled" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSendNowClick(notification)}
                            className="gap-1 whitespace-nowrap"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Wyślij teraz
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteClick(notification)}
                            className="h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {notification.status === "failed" && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleSendNowClick(notification)}
                          className="gap-1"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Ponów wysyłkę
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć to powiadomienie?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Powiadomienie zostanie trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Send Now Dialog */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wyślij powiadomienie teraz?</AlertDialogTitle>
            <AlertDialogDescription>
              Powiadomienie zostanie wysłane natychmiast do wszystkich wybranych odbiorców.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendNow}>
              Wyślij teraz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsList;
