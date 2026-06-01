/**
 * Generator PDF Media Coverage Report (9 sekcji) — jsPDF + autotable.
 * Dokument dla sponsora: executive summary, funnel, coverage, sponsor, top
 * publikacje, missing coverage, rekomendacje. Obsługa polskich znaków (jsPDF
 * standardowy font Helvetica obsługuje Latin-2 dla podstawowych PL znaków przez
 * WinAnsi; dla pełnej zgodności używamy czytelnych zamienników w nagłówkach).
 */
import type { CoverageReport } from "@/lib/report/coverageReport";

type JsPdf = import("jspdf").jsPDF;
type AutoTable = (doc: JsPdf, options: Record<string, unknown>) => void;

const loadPdfLibs = async () => {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (autoTableMod as unknown as { default: AutoTable }).default;
  return { jsPDF, autoTable };
};

const fmt = (n: number) => n.toLocaleString("pl-PL");
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pl-PL") : "—");

const REC_LABEL: Record<string, string> = {
  invite_again: "Zapros ponownie",
  follow_up: "Follow-up",
  deprioritize: "Despriorytetyzuj",
  sponsor_relevant: "Istotne dla sponsora",
};

export async function generateCoverageReportPdf(report: CoverageReport): Promise<void> {
  const { jsPDF, autoTable } = await loadPdfLibs();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 0;

  const lastTableY = (): number => {
    const t = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    return t ? t.finalY : y;
  };

  const ensureSpace = (need: number) => {
    if (y + need > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
  };

  const sectionTitle = (n: number, title: string) => {
    ensureSpace(14);
    doc.setFillColor(99, 102, 241);
    doc.rect(margin, y, pw - margin * 2, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${n}. ${title}`, margin + 2, y + 5.5);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "normal");
    y += 12;
  };

  // ── Nagłówek / branding ──
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pw, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Media Coverage Report", margin, 13);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(report.event.title, margin, 21);
  doc.setFontSize(8);
  const evDates = [fmtDate(report.event.start), report.event.end ? `– ${fmtDate(report.event.end)}` : ""].join(" ");
  doc.text(`${evDates}${report.event.location ? ` · ${report.event.location}` : ""}`, margin, 26);
  doc.setTextColor(20, 20, 20);
  y = 38;

  // ── 1. Executive summary ──
  sectionTitle(1, "Executive summary");
  doc.setFontSize(10);
  const m = report.metrics;
  const f = report.funnel;
  const summary = [
    `Z ${fmt(f.submissions)} zgloszen zaakceptowano ${fmt(f.approved)} (${m.approvalRate}%).`,
    `Na miejscu pojawilo sie ${fmt(f.checkedIn)} mediow (check-in ${m.checkInRate}%, no-show ${m.noShowRate}%).`,
    `Dostarczono ${fmt(f.coverageSubmitted)} publikacji (coverage rate ${m.coverageRate}%), brak: ${fmt(f.coverageMissing)}.`,
    `Laczny szacowany zasieg: ${fmt(m.estimatedReach)} (${m.reachVerified ? "zweryfikowany" : "deklarowany/estymowany"}).`,
    `Wzmianki sponsora: ${fmt(m.sponsorMentions)}.`,
  ];
  for (const line of summary) { ensureSpace(6); doc.text(line, margin, y, { maxWidth: pw - margin * 2 }); y += 6; }
  y += 2;

  // ── KPI cards ──
  const kpis = [
    { label: "Approval", value: `${m.approvalRate}%` },
    { label: "Check-in", value: `${m.checkInRate}%` },
    { label: "No-show", value: `${m.noShowRate}%` },
    { label: "Coverage", value: `${m.coverageRate}%` },
  ];
  const cardW = (pw - margin * 2 - 9) / 4;
  ensureSpace(20);
  kpis.forEach((k, i) => {
    const x = margin + i * (cardW + 3);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(x, y, cardW, 16, 2, 2, "S");
    doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text(k.label.toUpperCase(), x + 2, y + 4);
    doc.setFontSize(13); doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "bold");
    doc.text(k.value, x + 2, y + 12);
    doc.setFont("helvetica", "normal");
  });
  y += 22;

  // ── 2. Event overview ──
  sectionTitle(2, "Event overview");
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    theme: "plain", styles: { fontSize: 9 },
    body: [
      ["Wydarzenie", report.event.title],
      ["Termin", evDates],
      ["Lokalizacja", report.event.location ?? "—"],
      ["Wygenerowano", fmtDate(report.generatedAt)],
    ],
  });
  y = lastTableY() + 6;

  // ── 3. Accreditation funnel ──
  sectionTitle(3, "Accreditation funnel");
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    head: [["Etap", "Liczba", "% poprzedniego"]],
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 },
    body: [
      ["Zgloszenia", fmt(f.submissions), "100%"],
      ["Zaakceptowane", fmt(f.approved), `${m.approvalRate}%`],
      ["Check-in", fmt(f.checkedIn), `${m.checkInRate}%`],
      ["Coverage dostarczone", fmt(f.coverageSubmitted), `${m.coverageRate}%`],
      ["Coverage brak", fmt(f.coverageMissing), "—"],
    ],
  });
  y = lastTableY() + 6;

  // ── 4. Media attendance ──
  sectionTitle(4, "Media attendance");
  doc.setFontSize(9);
  doc.text(`Obecnosc: ${fmt(f.checkedIn)}/${fmt(f.approved)} zaakceptowanych (${m.checkInRate}%). No-show: ${m.noShowRate}%.`, margin, y, { maxWidth: pw - margin * 2 });
  y += 8;

  // ── 5. Coverage performance ──
  sectionTitle(5, "Coverage performance");
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    head: [["Medium", "Publikacje", "Zasieg (est.)", "Wzmianki sponsora"]],
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 },
    body: report.topOutlets.length > 0
      ? report.topOutlets.map((o) => [o.outlet, fmt(o.publications), fmt(o.reach), fmt(o.sponsorMentions)])
      : [["Brak dostarczonych publikacji", "", "", ""]],
  });
  y = lastTableY() + 6;

  // ── 6. Sponsor mentions ──
  sectionTitle(6, "Sponsor mentions");
  doc.setFontSize(10);
  doc.text(`Laczna liczba wzmianek sponsora w dostarczonych publikacjach: ${fmt(m.sponsorMentions)}.`, margin, y, { maxWidth: pw - margin * 2 });
  y += 6;
  const sponsorOutlets = report.topOutlets.filter((o) => o.sponsorMentions > 0);
  if (sponsorOutlets.length > 0) {
    autoTable(doc, {
      startY: y, margin: { left: margin, right: margin },
      head: [["Medium", "Wzmianki sponsora"]],
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
      body: sponsorOutlets.map((o) => [o.outlet, fmt(o.sponsorMentions)]),
    });
    y = lastTableY() + 6;
  } else { y += 2; }

  // ── 7. Top publications ──
  sectionTitle(7, "Top publications");
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    head: [["Medium", "Typ", "Zasieg", "Data", "URL"]],
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 8, cellWidth: "wrap" },
    columnStyles: { 4: { cellWidth: 55 } },
    body: report.topPublications.length > 0
      ? report.topPublications.map((p) => [p.outlet, p.type ?? "—", p.reach != null ? fmt(p.reach) : "—", fmtDate(p.publicationDate), p.url])
      : [["Brak publikacji", "", "", "", ""]],
  });
  y = lastTableY() + 6;

  // ── 8. Missing coverage (czerwony blok) ──
  sectionTitle(8, "Missing coverage");
  if (report.missingCoverage.length > 0) {
    ensureSpace(10);
    doc.setFillColor(254, 226, 226);
    doc.setDrawColor(220, 38, 38);
    doc.roundedRect(margin, y, pw - margin * 2, 8, 1.5, 1.5, "FD");
    doc.setTextColor(153, 27, 27); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(`Uwaga: ${report.missingCoverage.length} mediow nie dostarczylo coverage`, margin + 2, y + 5.5);
    doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "normal");
    y += 11;
    autoTable(doc, {
      startY: y, margin: { left: margin, right: margin },
      head: [["Medium / osoba", "E-mail", "Status"]],
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 9 },
      body: report.missingCoverage.map((row) => [row.name, row.email, row.status]),
    });
    y = lastTableY() + 6;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.text("Wszystkie media z check-inem dostarczyly coverage.", margin, y);
    doc.setTextColor(20, 20, 20);
    y += 8;
  }

  // ── 9. Recommendations ──
  sectionTitle(9, "Recommendations");
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    head: [["Rekomendacja", "Medium", "Uzasadnienie"]],
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 },
    body: report.recommendations.length > 0
      ? report.recommendations.map((r) => [REC_LABEL[r.kind] ?? r.kind, r.outlet, r.reason])
      : [["Brak rekomendacji", "", ""]],
  });

  // Stopka z numeracją stron
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `PressOps by OSURMO · Media Coverage Report · str. ${i}/${pages}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" },
    );
  }

  const safe = report.event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40);
  doc.save(`coverage-report-${safe || "event"}.pdf`);
}
