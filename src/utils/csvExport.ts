import { toast } from 'sonner';

interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = 'export'
): void {
  if (data.length === 0) {
    toast.error('Brak danych do eksportu');
    return;
  }

  const headers = columns.map(c => escapeCSV(c.header));
  const rows = data.map(row =>
    columns.map(col => escapeCSV(String(col.accessor(row) ?? '')))
  );

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Wyeksportowano ${data.length} rekordów`);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Pre-configured guest export columns
 */
export const guestExportColumns = [
  { header: 'Imię', accessor: (g: any) => g.firstName || g.first_name },
  { header: 'Nazwisko', accessor: (g: any) => g.lastName || g.last_name },
  { header: 'Email', accessor: (g: any) => g.email },
  { header: 'Telefon', accessor: (g: any) => g.phone },
  { header: 'Firma', accessor: (g: any) => g.company },
  { header: 'Status', accessor: (g: any) => g.status },
  { header: 'Typ biletu', accessor: (g: any) => g.ticketType || g.ticket_type },
  { header: 'Zameldowany', accessor: (g: any) => g.checkedInAt || g.checked_in_at ? 'Tak' : 'Nie' },
];
