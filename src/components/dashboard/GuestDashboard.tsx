
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Ticket, QrCode, Clock, MapPin, CheckCircle, 
  FileText, Bell, Star, ArrowRight, Download, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  // Fetch user's accreditations
  const { data: accreditations, isLoading: accreditationsLoading } = useQuery({
    queryKey: ['userAccreditations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('accreditations')
        .select(`
          *,
          events:event_id (id, title, start_date, end_date, location, image_url),
          accreditation_types:type_id (name, description, access_areas)
        `)
        .eq('user_id', user.id)
        .order('validity_start', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user's accreditation requests
  const { data: accreditationRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['userAccreditationRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('accreditation_requests')
        .select(`
          *,
          events:event_id (id, title, start_date, location)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['userNotifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const activeAccreditations = accreditations?.filter(a => {
    const now = new Date();
    return new Date(a.validity_start) <= now && new Date(a.validity_end) >= now && !a.revoked;
  }) || [];

  const upcomingAccreditations = accreditations?.filter(a => {
    const now = new Date();
    return new Date(a.validity_start) > now && !a.revoked;
  }) || [];

  const pendingRequests = accreditationRequests?.filter(r => r.status === 'pending') || [];

  const getInitials = () => {
    return `${profile?.firstName?.charAt(0) || ''}${profile?.lastName?.charAt(0) || ''}`.toUpperCase() || 'G';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/15 text-warning border-0">Oczekująca</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-success/15 text-success border-0">Zaakceptowana</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Odrzucona</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatarUrl} />
            <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Witaj, {profile?.firstName || 'Gościu'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Twój panel akredytacji i wydarzeń
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/notifications')}>
            <Bell className="h-4 w-4 mr-2" />
            Powiadomienia
            {notifications && notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">{notifications.length}</Badge>
            )}
          </Button>
          <Button onClick={() => navigate('/profile')}>
            Mój profil
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAccreditations.length}</p>
                <p className="text-sm text-muted-foreground">Aktywne akredytacje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/20 rounded-full">
                <Calendar className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingAccreditations.length}</p>
                <p className="text-sm text-muted-foreground">Nadchodzące wydarzenia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/20 rounded-full">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Oczekujące prośby</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active accreditations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current/Active accreditations */}
          {activeAccreditations.length > 0 && (
            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                  <CardTitle className="text-lg text-success">Aktywne akredytacje</CardTitle>
                </div>
                <CardDescription>Twoje obecnie aktywne przepustki</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeAccreditations.map((accreditation: any) => (
                  <div key={accreditation.id} className="p-4 rounded-lg bg-card border shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="p-3 bg-success/15 rounded-lg">
                          <QrCode className="h-8 w-8 text-success" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{accreditation.events?.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{accreditation.events?.location || 'Brak lokalizacji'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{accreditation.accreditation_types?.name}</Badge>
                            {accreditation.is_checked_in && (
                              <Badge className="bg-success/15 text-success border-0">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Zameldowany
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2">
                        <QrCode className="h-4 w-4" />
                        Pokaż QR
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming accreditations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Nadchodzące wydarzenia</CardTitle>
                <CardDescription>Wydarzenia, na które masz akredytację</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {accreditationsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : upcomingAccreditations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Brak nadchodzących wydarzeń</p>
                  <p className="text-sm mt-1">Złóż wniosek o akredytację na interesujące Cię wydarzenie</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAccreditations.map((accreditation: any) => (
                    <div key={accreditation.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center p-2 bg-primary/10 rounded-lg min-w-[60px]">
                          <div className="text-lg font-bold text-primary">
                            {new Date(accreditation.validity_start).getDate()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(accreditation.validity_start).toLocaleDateString('pl-PL', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold">{accreditation.events?.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{accreditation.events?.location || 'Brak lokalizacji'}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{accreditation.accreditation_types?.name}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accreditation requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Wnioski o akredytację</CardTitle>
                <CardDescription>Status Twoich wniosków</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : accreditationRequests?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Brak wniosków o akredytację</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accreditationRequests?.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{request.events?.title || request.media_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Powiadomienia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak nowych powiadomień
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications?.map((notification: any) => (
                    <div key={notification.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/notifications')}>
                Zobacz wszystkie
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Szybkie linki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/profile')}>
                <Star className="h-4 w-4" />
                Edytuj profil
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/ticketing')}>
                <Ticket className="h-4 w-4" />
                Moje bilety
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Pobierz przepustki
              </Button>
            </CardContent>
          </Card>

          {/* Help card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-3 bg-primary/20 rounded-full w-fit mx-auto mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">Potrzebujesz pomocy?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Sprawdź naszą dokumentację lub skontaktuj się z organizatorem
                </p>
                <Button variant="outline" className="w-full">
                  Centrum pomocy
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
