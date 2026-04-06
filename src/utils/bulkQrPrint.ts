import { toast } from 'sonner';
import { qrToDataURL } from '@/utils/qrDataUrl';

interface GuestQRData {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  ticketType?: string;
  qrCode: string;
}

/**
 * Generate a multi-page PDF with QR codes for bulk printing.
 * Layout: 2 columns × 4 rows = 8 per page
 */
export async function generateBulkQRPdf(guests: GuestQRData[], eventTitle: string): Promise<void> {
  if (guests.length === 0) {
    toast.error('Brak gości do wygenerowania kodów QR');
    return;
  }

  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const cols = 2;
  const rows = 4;
  const perPage = cols * rows;
  const cellW = (pageW - 20) / cols;
  const cellH = (pageH - 20) / rows;
  const qrSize = Math.min(cellW - 10, cellH - 20);

  for (let i = 0; i < guests.length; i++) {
    if (i > 0 && i % perPage === 0) {
      doc.addPage();
    }

    const posInPage = i % perPage;
    const col = posInPage % cols;
    const row = Math.floor(posInPage / cols);
    const x = 10 + col * cellW;
    const y = 10 + row * cellH;

    try {
      const qrDataUrl = qrToDataURL(guests[i].qrCode, 300);
      const qrX = x + (cellW - qrSize) / 2;
      doc.addImage(qrDataUrl, 'PNG', qrX, y + 2, qrSize, qrSize);
    } catch {
      doc.setFontSize(8);
      doc.text('QR Error', x + cellW / 2, y + qrSize / 2, { align: 'center' });
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const name = `${guests[i].firstName} ${guests[i].lastName}`;
    doc.text(name, x + cellW / 2, y + qrSize + 6, { align: 'center', maxWidth: cellW - 4 });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const subtitle = [guests[i].company, guests[i].ticketType].filter(Boolean).join(' · ');
    if (subtitle) {
      doc.text(subtitle, x + cellW / 2, y + qrSize + 11, { align: 'center', maxWidth: cellW - 4 });
    }

    doc.setDrawColor(200);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(x, y, cellW, cellH);
  }

  doc.setPage(1);
  doc.setFontSize(6);
  doc.setTextColor(150);
  doc.text(`${eventTitle} — ${guests.length} kodów QR — ${new Date().toLocaleDateString('pl-PL')}`, pageW / 2, pageH - 3, { align: 'center' });

  doc.save(`QR_${eventTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  toast.success(`Wygenerowano PDF z ${guests.length} kodami QR`);
}