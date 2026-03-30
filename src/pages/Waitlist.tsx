import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Clock, UserCheck, UserX, Users, ArrowUpCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";

interface WaitlistGuest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  created_at: string;
  status: string;
  event_id: string;
}

const Waitlist = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [waitlistGuests, setWaitlistGuests] = useState<WaitlistGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, capacity: 0, confirmed: 0 });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("events")
      .select("id, title, max_guests")
      .eq("organizer_id", user.id)
      .then(({ data }) => {
        if (data) setEvents(data);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedEvent) return;
    fetchWaitlist();
  }, [selectedEvent]);

  const fetchWaitlist = async () => {
    setLoading(true);
    const [waitlistRes, confirmedRes] = await Promise.all([
      supabase
        .from("guests")
        .select("*")
        .eq("event_id", selectedEvent)
        .eq("status", "waitlisted")
        .order("created_at", { ascending: true }),
      supabase
        .from("guests")
        .select("id", { count: "exact", head: true })
        .eq("event_id", selectedEvent)
        .in("status", ["confirmed", "checked-in"]),
    ]);

    setWaitlistGuests((waitlistRes.data as WaitlistGuest[]) || []);
    const ev = events.find((e) => e.id === selectedEvent);
    setStats({
      total: waitlistRes.data?.length || 0,
      capacity: ev?.max_guests || 0,
      confirmed: confirmedRes.count || 0,
    });
    setLoading(false);
  };

  const promoteGuest = async (guestId: string) => {
    const { error } = await supabase
      .from("guests")
      .update({ status: "confirmed" })
      .eq("id", guestId);
    if (error) {
      toast.error("Błąd: " + error.message);
      return;
    }
    toast.success("Gość przeniesiony z waitlisty!");
    fetchWaitlist();
  };

  const removeFromWaitlist = async (guestId: string) => {
    const { error } = await supabase
      .from("guests")
      .update({ status: "declined" })
      .eq("id", guestId);
    if (error) {
      toast.error("Błąd: " + error.message);
      return;
    }
    toast.success("Gość usunięty z waitlisty");
    fetchWaitlist();
  };

  const promoteAll = async () => {
    if (!stats.capacity) {
      // No limit — promote all
      const ids = waitlistGuests.map((g) => g.id);
      await supabase
        .from("guests")
        .update({ status: "confirmed" })
        .in("id", ids);
      toast.success(`Przeniesiono ${ids.length} gości!`);
      fetchWaitlist();
      return;
    }

    const available = stats.capacity - stats.confirmed;
    if (available <= 0) {
      toast.error("Brak wolnych miejsc!");
      return;
    }

    const toPromote = waitlistGuests.slice(0, available).map((g) => g.id);
    await supabase
      .from("guests")
      .update({ status: "confirmed" })
      .in("id", toPromote);
    toast.success(`Przeniesiono ${toPromote.length} gości z waitlisty!`);
    fetchWaitlist();
  };

  const spotsAvailable = stats.capacity ? Math.max(0, stats.capacity - stats.confirmed) : "∞";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lista oczekujących</h1>
        <p className="text-muted-foreground mt-1">
          Zarządzaj gośćmi oczekującymi na miejsce gdy wydarzenie jest pełne
        </p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="w-72">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz wydarzenie..." />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedEvent && (
          <Button variant="outline" size="sm" onClick={fetchWaitlist}>
            <RefreshCw className="h-4 w-4 mr-1" /> Odśwież
          </Button>
        )}
      </div>

      {selectedEvent && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Na waitliście</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.confirmed}</p>
                    <p className="text-xs text-muted-foreground">Potwierdzonych</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{String(spotsAvailable)}</p>
                    <p className="text-xs text-muted-foreground">Wolnych miejsc</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          {waitlistGuests.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={promoteAll} size="sm">
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                Przenieś dostępnych ({String(spotsAvailable === "∞" ? stats.total : Math.min(Number(spotsAvailable), stats.total))})
              </Button>
            </div>
          )}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Imię i nazwisko</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Data zgłoszenia</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlistGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Brak gości na liście oczekujących
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitlistGuests.map((g, i) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{g.first_name} {g.last_name}</TableCell>
                        <TableCell>{g.email}</TableCell>
                        <TableCell>{g.company || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(g.created_at).toLocaleDateString("pl-PL")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => promoteGuest(g.id)}>
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeFromWaitlist(g.id)}>
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Waitlist;
