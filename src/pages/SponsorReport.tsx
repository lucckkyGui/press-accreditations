import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { FileBarChart, Download, Users, TrendingUp, Clock, BarChart3 } from "lucide-react";
// jsPDF loaded dynamically on PDF download
const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  return { jsPDF, autoTable };
};

interface ReportData {
  event: any;
  totalGuests: number;
  confirmedGuests: number;
  checkedIn: number;
  waitlisted: number;
  byTicketType: Record<string, number>;
  byZone: Record<string, number>;
}

const SponsorReport = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("events")
      .select("id, title, start_date, end_date, location, max_guests")
      .eq("organizer_id", user.id)
      .then(({ data }) => {
        if (data) setEvents(data);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedEvent) return;
    generateReport();
  }, [selectedEvent]);

  const generateReport = async () => {
    setLoading(true);
    const ev = events.find((e) => e.id === selectedEvent);
    const { data: guests } = await supabase
      .from("guests")
      .select("*")
      .eq("event_id", selectedEvent);

    if (!guests) {
      setLoading(false);
      return;
    }

    const byTicketType: Record<string, number> = {};
    const byZone: Record<string, number> = {};
    let confirmed = 0, checkedIn = 0, waitlisted = 0;

    guests.forEach((g: any) => {
      if (g.status === "confirmed") confirmed++;
      if (g.status === "checked-in") checkedIn++;
      if (g.status === "waitlisted") waitlisted++;
      byTicketType[g.ticket_type || "general"] = (byTicketType[g.ticket_type || "general"] || 0) + 1;
      (g.zones || []).forEach((z: string) => {
        byZone[z] = (byZone[z] || 0) + 1;
      });
    });

    setReportData({
      event: ev,
      totalGuests: guests.length,
      confirmedGuests: confirmed,
      checkedIn,
      waitlisted,
      byTicketType,
      byZone,
    });
    setLoading(false);
  };

  const downloadPDF = () => {
    if (!reportData) return;
    const { event } = reportData;
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text("Raport sponsorski", pw / 2, 25, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text(event.title, pw / 2, 35, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    const dateStr = `${new Date(event.start_date).toLocaleDateString("pl-PL")} — ${new Date(event.end_date).toLocaleDateString("pl-PL")}`;
    doc.text(dateStr, pw / 2, 42, { align: "center" });
    if (event.location) doc.text(event.location, pw / 2, 47, { align: "center" });

    doc.line(20, 52, pw - 20, 52);

    // Summary
    let y = 62;
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Podsumowanie", 20, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Metryka", "Wartość"]],
      body: [
        ["Łączna liczba gości", String(reportData.totalGuests)],
        ["Potwierdzeni", String(reportData.confirmedGuests)],
        ["Zeskanowani (check-in)", String(reportData.checkedIn)],
        ["Frekwencja", reportData.totalGuests > 0 ? `${Math.round((reportData.checkedIn / reportData.totalGuests) * 100)}%` : "0%"],
        ["Lista oczekujących", String(reportData.waitlisted)],
        ["Pojemność", event.max_guests ? String(event.max_guests) : "Bez limitu"],
      ],
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] },
    });

    // Ticket types
    const autoTableY = (doc as any).lastAutoTable?.finalY || y + 60;
    doc.setFontSize(13);
    doc.text("Typy biletów", 20, autoTableY + 15);

    autoTable(doc, {
      startY: autoTableY + 20,
      head: [["Typ biletu", "Liczba gości"]],
      body: Object.entries(reportData.byTicketType).map(([k, v]) => [k, String(v)]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] },
    });

    // Zones
    if (Object.keys(reportData.byZone).length > 0) {
      const ztY = (doc as any).lastAutoTable?.finalY || autoTableY + 50;
      doc.setFontSize(13);
      doc.text("Strefy", 20, ztY + 15);

      autoTable(doc, {
        startY: ztY + 20,
        head: [["Strefa", "Liczba gości"]],
        body: Object.entries(reportData.byZone).map(([k, v]) => [k, String(v)]),
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Wygenerowano: ${new Date().toLocaleDateString("pl-PL")} | Strona ${i}/${pages}`,
        pw / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`raport_sponsorski_${event.title.replace(/\s+/g, "_")}.pdf`);
    toast.success("Raport PDF pobrano!");
  };

  const attendance = reportData && reportData.totalGuests > 0
    ? Math.round((reportData.checkedIn / reportData.totalGuests) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-primary" />
          Raporty dla sponsorów
        </h1>
        <p className="text-muted-foreground mt-1">
          Generuj automatyczne raporty PDF z analityką wydarzenia dla sponsorów
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
        {reportData && (
          <Button onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-1" /> Pobierz PDF
          </Button>
        )}
      </div>

      {reportData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reportData.totalGuests}</p>
                    <p className="text-xs text-muted-foreground">Łącznie gości</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{attendance}%</p>
                    <p className="text-xs text-muted-foreground">Frekwencja</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reportData.checkedIn}</p>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reportData.waitlisted}</p>
                    <p className="text-xs text-muted-foreground">Waitlista</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Typy biletów</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.byTicketType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <Badge variant="outline">{type}</Badge>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {Object.keys(reportData.byZone).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Strefy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(reportData.byZone).map(([zone, count]) => (
                      <div key={zone} className="flex justify-between items-center">
                        <Badge variant="outline">{zone}</Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SponsorReport;
