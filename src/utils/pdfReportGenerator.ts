import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EventAnalyticsData } from '@/hooks/analytics/useEventAnalytics';
import { drawPieChart, drawBarChart, drawAreaChart } from './pdfChartDrawer';

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

  renderSummarySection(doc, data, 62);
  renderZonesSection(doc, data);
  renderAccessSection(doc, data);
  renderTimelineSection(doc, data);

  // --- Charts page ---
  doc.addPage();
  renderChartsPage(doc, data);

  addFooter(doc);

  const fileName = `raport_${sanitize(data.event.title)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export function generateComparisonPdfReport(left: EventAnalyticsData, right: EventAnalyticsData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text('Porównanie wydarzeń', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`${left.event.title}  vs  ${right.event.title}`, pageWidth / 2, 34, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, pageWidth / 2, 41, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 46, pageWidth - 20, 46);

  const pct = (a: number, b: number) => b > 0 ? ((a / b) * 100).toFixed(1) : '0';
  const dfn = (a: number, b: number) => { const d = a - b; return d > 0 ? `+${d}` : String(d); };

  let y = 55;
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('Kluczowe wskaźniki (KPI)', 20, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Metryka', left.event.title, right.event.title, 'Różnica']],
    body: [
      ['Łączna liczba gości', String(left.guests.total), String(right.guests.total), dfn(left.guests.total, right.guests.total)],
      ['Obecni (check-in)', `${left.guests.checkedIn} (${pct(left.guests.checkedIn, left.guests.total)}%)`, `${right.guests.checkedIn} (${pct(right.guests.checkedIn, right.guests.total)}%)`, dfn(left.guests.checkedIn, right.guests.checkedIn)],
      ['Potwierdzeni', String(left.guests.confirmed), String(right.guests.confirmed), dfn(left.guests.confirmed, right.guests.confirmed)],
      ['Zaproszeni', String(left.guests.invited), String(right.guests.invited), dfn(left.guests.invited, right.guests.invited)],
      ['Odrzuceni', String(left.guests.declined), String(right.guests.declined), dfn(left.guests.declined, right.guests.declined)],
      ['Godzina szczytu', `${left.checkIns.peakHour} (${left.checkIns.peakCount})`, `${right.checkIns.peakHour} (${right.checkIns.peakCount})`, dfn(left.checkIns.peakCount, right.checkIns.peakCount)],
      ['Śr. czas pobytu', `${left.checkIns.avgDurationMinutes} min`, `${right.checkIns.avgDurationMinutes} min`, `${dfn(left.checkIns.avgDurationMinutes, right.checkIns.avgDurationMinutes)} min`],
      ['Emaile wysłane', String(left.emails.sent), String(right.emails.sent), dfn(left.emails.sent, right.emails.sent)],
      ['Email open rate', `${pct(left.emails.opened, left.emails.sent)}%`, `${pct(right.emails.opened, right.emails.sent)}%`, `${dfn(Math.round(parseFloat(pct(left.emails.opened, left.emails.sent))), Math.round(parseFloat(pct(right.emails.opened, right.emails.sent))))}%`],
      ['Emaile nieudane', String(left.emails.failed), String(right.emails.failed), dfn(left.emails.failed, right.emails.failed)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: { 3: { fontStyle: 'bold' } },
  });

  y = (doc as any).lastAutoTable.finalY + 15;
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.text('Porównanie stref', 20, y);
  y += 8;

  const allZones = new Set([...left.guests.byZone.map(z => z.zone), ...right.guests.byZone.map(z => z.zone)]);
  const zoneBody = Array.from(allZones).map(zone => {
    const lz = left.guests.byZone.find(z => z.zone === zone);
    const rz = right.guests.byZone.find(z => z.zone === zone);
    return [zone, `${lz?.checkedIn || 0} / ${lz?.total || 0}`, `${rz?.checkedIn || 0} / ${rz?.total || 0}`, dfn(lz?.total || 0, rz?.total || 0)];
  });

  autoTable(doc, {
    startY: y,
    head: [['Strefa', `${left.event.title} (obecni/łącznie)`, `${right.event.title} (obecni/łącznie)`, 'Różnica']],
    body: zoneBody,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: { 3: { fontStyle: 'bold' } },
  });

  // --- Comparison charts page ---
  doc.addPage();
  renderComparisonChartsPage(doc, left, right);

  addFooter(doc);

  const fileName = `porownanie_${sanitize(left.event.title)}_vs_${sanitize(right.event.title)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ---- Chart rendering ----

function renderChartsPage(doc: jsPDF, data: EventAnalyticsData) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('Wykresy', pageWidth / 2, 20, { align: 'center' });

  // Pie chart - guest status (left side)
  drawPieChart(doc, [
    { label: 'Obecni', value: data.guests.checkedIn, color: [16, 185, 129] },
    { label: 'Potwierdzeni', value: data.guests.confirmed, color: [59, 130, 246] },
    { label: 'Zaproszeni', value: data.guests.invited, color: [245, 158, 11] },
    { label: 'Odrzuceni', value: data.guests.declined, color: [239, 68, 68] },
  ], 55, 72, 30, 'Status gości');

  // Bar chart - zones (right side)
  if (data.guests.byZone.length > 0) {
    drawBarChart(
      doc,
      data.guests.byZone.map(z => ({
        label: z.zone,
        values: [
          { value: z.total, color: [59, 130, 246] as [number, number, number], name: 'Łącznie' },
          { value: z.checkedIn, color: [16, 185, 129] as [number, number, number], name: 'Obecni' },
        ],
      })),
      115, 38, 75, 55,
      'Goście wg stref'
    );
  }

  // Area chart - check-ins timeline (full width, bottom)
  if (data.checkIns.byHour.length > 0) {
    drawAreaChart(
      doc,
      data.checkIns.byHour.map(h => ({ label: h.hour, value: h.count })),
      35, 140, 145, 70,
      [59, 130, 246],
      'Check-ins w czasie'
    );
  }
}

function renderComparisonChartsPage(doc: jsPDF, left: EventAnalyticsData, right: EventAnalyticsData) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('Wykresy porównawcze', pageWidth / 2, 20, { align: 'center' });

  // Side-by-side zone bar charts
  const allZones = Array.from(new Set([
    ...left.guests.byZone.map(z => z.zone),
    ...right.guests.byZone.map(z => z.zone),
  ]));

  if (allZones.length > 0) {
    drawBarChart(
      doc,
      allZones.map(zone => ({
        label: zone,
        values: [
          { value: left.guests.byZone.find(z => z.zone === zone)?.total || 0, color: [59, 130, 246] as [number, number, number], name: left.event.title },
          { value: right.guests.byZone.find(z => z.zone === zone)?.total || 0, color: [139, 92, 246] as [number, number, number], name: right.event.title },
        ],
      })),
      25, 38, 165, 60,
      'Goście wg stref — porównanie'
    );
  }

  // Side-by-side timeline
  if (left.checkIns.byHour.length > 0) {
    drawAreaChart(
      doc,
      left.checkIns.byHour.map(h => ({ label: h.hour, value: h.count })),
      25, 130, 75, 55,
      [59, 130, 246],
      left.event.title
    );
  }

  if (right.checkIns.byHour.length > 0) {
    drawAreaChart(
      doc,
      right.checkIns.byHour.map(h => ({ label: h.hour, value: h.count })),
      115, 130, 75, 55,
      [139, 92, 246],
      right.event.title
    );
  }
}

// ---- Internal helpers ----

function sanitize(s: string) {
  return s.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '_');
}

function renderSummarySection(doc: jsPDF, data: EventAnalyticsData, y: number) {
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('Podsumowanie', 20, y);
  y += 8;

  const checkInRate = data.guests.total > 0 ? ((data.guests.checkedIn / data.guests.total) * 100).toFixed(1) : '0';
  const emailOpenRate = data.emails.sent > 0 ? ((data.emails.opened / data.emails.sent) * 100).toFixed(1) : '0';

  autoTable(doc, {
    startY: y,
    head: [['Metryka', 'Wartość']],
    body: [
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
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 20, right: 20 },
  });
}

function renderZonesSection(doc: jsPDF, data: EventAnalyticsData) {
  let y = (doc as any).lastAutoTable.finalY + 15;
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.text('Statystyki stref', 20, y);
  y += 8;

  if (data.guests.byZone.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Strefa', 'Łącznie gości', 'Obecni', 'Wskaźnik']],
      body: data.guests.byZone.map(z => {
        const rate = z.total > 0 ? ((z.checkedIn / z.total) * 100).toFixed(1) : '0';
        return [z.zone, String(z.total), String(z.checkedIn), `${rate}%`];
      }),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 20, right: 20 },
    });
  }
}

function renderAccessSection(doc: jsPDF, data: EventAnalyticsData) {
  let y = (doc as any).lastAutoTable?.finalY + 15 || 20;
  if (y > 240) { doc.addPage(); y = 20; }

  if (data.zones.entries.length > 0) {
    doc.setFontSize(14);
    doc.text('Ruch w strefach (RFID)', 20, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Strefa', 'Wejścia', 'Wyjścia', 'Śr. czas']],
      body: data.zones.entries.map(z => [z.zone, String(z.entryCount), String(z.exitCount), `${z.avgDuration} min`]),
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246], textColor: 255 },
      margin: { left: 20, right: 20 },
    });
  }
}

function renderTimelineSection(doc: jsPDF, data: EventAnalyticsData) {
  if (data.checkIns.byHour.length > 0) {
    let y = (doc as any).lastAutoTable?.finalY + 15 || 20;
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(14);
    doc.text('Check-ins w czasie', 20, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Godzina', 'Liczba wejść']],
      body: data.checkIns.byHour.map(h => [h.hour, String(h.count)]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      margin: { left: 20, right: 20 },
    });
  }
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
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
}
