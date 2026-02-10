import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EventAnalyticsData } from '@/hooks/analytics/useEventAnalytics';

export function generateEventPdfReport(data: EventAnalyticsData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text('Raport po wydarzeniu', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(80, 80, 80);
  doc.text(data.event.title, pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  const dateRange = `${new Date(data.event.startDate).toLocaleDateString('pl-PL')} — ${new Date(data.event.endDate).toLocaleDateString('pl-PL')}`;
  doc.text(dateRange, pageWidth / 2, 42, { align: 'center' });
  if (data.event.location) {
    doc.text(data.event.location, pageWidth / 2, 48, { align: 'center' });
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 53, pageWidth - 20, 53);

  // Summary section
  let y = 62;
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('Podsumowanie', 20, y);
  y += 8;

  const checkInRate = data.guests.total > 0
    ? ((data.guests.checkedIn / data.guests.total) * 100).toFixed(1)
    : '0';
  const emailOpenRate = data.emails.sent > 0
    ? ((data.emails.opened / data.emails.sent) * 100).toFixed(1)
    : '0';

  const summaryData = [
    ['Łączna liczba gości', String(data.guests.total)],
    ['Obecni (check-in)', `${data.guests.checkedIn} (${checkInRate}%)`],
    ['Potwierdzeni', String(data.guests.confirmed)],
    ['Zaproszeni', String(data.guests.invited)],
    ['Odrzuceni', String(data.guests.declined)],
    ['Godzina szczytu', `${data.checkIns.peakHour} (${data.checkIns.peakCount} wejść)`],
    ['Śr. czas przebywania', `${data.checkIns.avgDurationMinutes} min`],
    ['Emaile wysłane', String(data.emails.sent)],
    ['Emaile otwarte', `${data.emails.opened} (${emailOpenRate}%)`],
    ['Emaile nieudane', String(data.emails.failed)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metryka', 'Wartość']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 20, right: 20 },
  });

  // Zones table
  y = (doc as any).lastAutoTable.finalY + 15;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.text('Statystyki stref', 20, y);
  y += 8;

  if (data.guests.byZone.length > 0) {
    const zoneBody = data.guests.byZone.map(z => {
      const rate = z.total > 0 ? ((z.checkedIn / z.total) * 100).toFixed(1) : '0';
      return [z.zone, String(z.total), String(z.checkedIn), `${rate}%`];
    });

    autoTable(doc, {
      startY: y,
      head: [['Strefa', 'Łącznie gości', 'Obecni', 'Wskaźnik']],
      body: zoneBody,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 20, right: 20 },
    });
  }

  // Access logs zones
  y = (doc as any).lastAutoTable?.finalY + 15 || y + 10;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  if (data.zones.entries.length > 0) {
    doc.setFontSize(14);
    doc.text('Ruch w strefach (RFID)', 20, y);
    y += 8;

    const accessBody = data.zones.entries.map(z => [
      z.zone,
      String(z.entryCount),
      String(z.exitCount),
      `${z.avgDuration} min`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Strefa', 'Wejścia', 'Wyjścia', 'Śr. czas']],
      body: accessBody,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246], textColor: 255 },
      margin: { left: 20, right: 20 },
    });
  }

  // Check-in timeline
  if (data.checkIns.byHour.length > 0) {
    y = (doc as any).lastAutoTable?.finalY + 15 || y + 10;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.text('Check-ins w czasie', 20, y);
    y += 8;

    const timeBody = data.checkIns.byHour.map(h => [h.hour, String(h.count)]);

    autoTable(doc, {
      startY: y,
      head: [['Godzina', 'Liczba wejść']],
      body: timeBody,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      margin: { left: 20, right: 20 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Raport wygenerowany: ${new Date().toLocaleString('pl-PL')} | Strona ${i} z ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `raport_${data.event.title.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
