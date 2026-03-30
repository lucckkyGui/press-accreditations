import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Clock, UserCheck, UserX, Users, ArrowUpCircle, RefreshCw, Zap, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";

interface WaitlistGuest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  phone: string | null;
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
  const [promoting, setPromoting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, capacity: 0, confirmed: 0, checkedIn: 0 });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("events")
      .select("id, title, max_guests")
      .eq("organizer_id", user.id)
      .order("start_date", { ascending: false })
      .then(({ data }) => {
        if (data) setEvents(data);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedEvent) return;
    fetchWaitlist();
  }, [selectedEvent]);

  const fetchWaitlist = useCallback(async () => {
    setLoading(true);
    setSelectedIds([]);
    const [waitlistRes, confirmedRes, checkedInRes] = await Promise.all([
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
        .eq("status", "confirmed"),
      supabase
        .from("guests")
        .select("id", { count: "exact", head: true })
        .eq("event_id", selectedEvent)
        .eq("status", "checked-in"),
    ]);

    setWaitlistGuests((waitlistRes.data as WaitlistGuest[]) || []);
    const ev = events.find((e) => e.id === selectedEvent);
    setStats({
      total: waitlistRes.data?.length || 0,
      capacity: ev?.max_guests || 0,
      confirmed: confirmedRes.count || 0,
      checkedIn: checkedInRes.count || 0,
    });
    setLoading(false);
  }, [selectedEvent, events]);

  const callWaitlistApi = async (action: string, guestIds?: string[]) => {
    setPromoting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/waitlist-manage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            eventId: selectedEvent,
            action,
            guestIds,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Wystąpił błąd");
        return;
      }

      if (action === "remove") {
        toast.success(`Usunięto ${result.removed} gości z waitlisty`);
      } else {
        toast.success(result.message || `Przeniesiono ${result.promoted} gości`);
      }
      fetchWaitlist();
    } catch (err) {
      toast.error("Błąd połączenia");
    } finally {
      setPromoting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === waitlistGuests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(waitlistGuests.map((g) => g.id));
    }
  };

  const totalOccupied = stats.confirmed + stats.checkedIn;
  const spotsAvailable = stats.capacity ? Math.max(0, stats.capacity - totalOccupied) : Infinity;
  const capacityPercent = stats.capacity ? Math.round((totalOccupied / stats.capacity) * 100) : 0;
  const isFull = stats.capacity > 0 && spotsAvailable === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Lista oczekujących (Waitlist)
        </h1>
        <p className="text-muted-foreground mt-1">
          Automatyczny system kolejkowania gdy wydarzenie osiągnie limit gości. Goście trafiają na waitlistę w kolejności FIFO.
        </p>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-72">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz wydarzenie..." />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  <span className="flex items-center gap-2">
                    {e.title}
                    {e.max_guests && (
                      <Badge variant="outline" className="text-[10px]">
                        limit: {e.max_guests}
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedEvent && (
          <Button variant="outline" size="sm" onClick={fetchWaitlist} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Odśwież
          </Button>
        )}
      </div>

      {selectedEvent && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
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
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.confirmed + stats.checkedIn}</p>
                    <p className="text-xs text-muted-foreground">Potwierdzonych + check-in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {spotsAvailable === Infinity ? "∞" : spotsAvailable}
                    </p>
                    <p className="text-xs text-muted-foreground">Wolnych miejsc</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zapełnienie</span>
                    <span className="font-semibold">
                      {stats.capacity ? `${capacityPercent}%` : "Bez limitu"}
                    </span>
                  </div>
                  {stats.capacity > 0 && (
                    <Progress
                      value={Math.min(capacityPercent, 100)}
                      className="h-2"
                    />
                  )}
                  {isFull && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Wydarzenie pełne
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action buttons */}
          {waitlistGuests.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => callWaitlistApi("auto-promote")}
                disabled={promoting || spotsAvailable === 0}
                size="sm"
              >
                <Zap className="h-4 w-4 mr-1" />
                Auto-promocja ({spotsAvailable === Infinity ? stats.total : Math.min(Number(spotsAvailable), stats.total)} gości)
              </Button>
              {selectedIds.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => callWaitlistApi("promote-specific", selectedIds)}
                    disabled={promoting}
                    size="sm"
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-1" />
                    Przenieś zaznaczonych ({selectedIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => callWaitlistApi("remove", selectedIds)}
                    disabled={promoting}
                    size="sm"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Usuń zaznaczonych ({selectedIds.length})
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      {waitlistGuests.length > 0 && (
                        <Checkbox
                          checked={selectedIds.length === waitlistGuests.length && waitlistGuests.length > 0}
                          onCheckedChange={toggleAll}
                        />
                      )}
                    </TableHead>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Imię i nazwisko</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Data zgłoszenia</TableHead>
                    <TableHead>Czas oczekiwania</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Ładowanie...
                      </TableCell>
                    </TableRow>
                  ) : waitlistGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>Brak gości na liście oczekujących</p>
                        <p className="text-xs mt-1">Goście trafią tutaj automatycznie gdy limit miejsc zostanie osiągnięty</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitlistGuests.map((g, i) => {
                      const waitTime = Math.round((Date.now() - new Date(g.created_at).getTime()) / (1000 * 60 * 60));
                      const waitLabel = waitTime < 1 ? "<1h" : waitTime < 24 ? `${waitTime}h` : `${Math.round(waitTime / 24)}d`;

                      return (
                        <TableRow key={g.id} className={selectedIds.includes(g.id) ? "bg-primary/5" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(g.id)}
                              onCheckedChange={() => toggleSelect(g.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground text-xs">{i + 1}</TableCell>
                          <TableCell className="font-medium">{g.first_name} {g.last_name}</TableCell>
                          <TableCell className="text-sm">{g.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{g.company || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{g.phone || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(g.created_at).toLocaleDateString("pl-PL", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {waitLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => callWaitlistApi("promote-specific", [g.id])}
                                disabled={promoting}
                                title="Potwierdź gościa"
                              >
                                <UserCheck className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => callWaitlistApi("remove", [g.id])}
                                disabled={promoting}
                                title="Usuń z waitlisty"
                              >
                                <UserX className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Info box */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sm mb-2">Jak działa waitlista?</h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Gdy wydarzenie osiągnie limit <code>max_guests</code>, nowi rejestrujący automatycznie trafiają na waitlistę</li>
                <li>• Kolejność jest FIFO — najwcześniej zapisani mają priorytet</li>
                <li>• <strong>Auto-promocja</strong> przenosi gości z waitlisty do potwierdzonych (tyle ile jest wolnych miejsc)</li>
                <li>• Działa z formularzem rejestracji (widget embed) oraz ręcznym dodawaniem gości</li>
                <li>• Usunięci z waitlisty otrzymują status "declined"</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Waitlist;
