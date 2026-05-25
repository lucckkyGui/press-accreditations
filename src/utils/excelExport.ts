import { toast } from 'sonner';

interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
  width?: number;
}

/**
 * Export data to Excel-compatible XML Spreadsheet (.xlsx-like .xls)
 * Uses SpreadsheetML — no external library needed.
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = 'export'
): void {
  if (data.length === 0) {
    toast.error('Brak danych do eksportu');
    return;
  }

  const escapeXml = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const headerRow = columns
    .map(c => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(c.header)}</Data></Cell>`)
    .join('');

  const dataRows = data.map(row => {
    const cells = columns.map(col => {
      const raw = col.accessor(row);
      const val = raw == null ? '' : String(raw);
      const isNum = !isNaN(Number(val)) && val.trim() !== '';
      const type = isNum ? 'Number' : 'String';
      return `<Cell><Data ss:Type="${type}">${escapeXml(val)}</Data></Cell>`;
    }).join('');
    return `<Row>${cells}</Row>`;
  }).join('\n');

  const colDefs = columns
    .map(c => `<Column ss:AutoFitWidth="1" ss:Width="${c.width || 120}"/>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default"><Font ss:FontName="Calibri" ss:Size="11"/></Style>
  <Style ss:ID="header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#6366F1" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Dane">
  <Table>
   ${colDefs}
   <Row>${headerRow}</Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Wyeksportowano ${data.length} rekordów do Excel`);
}

export const guestExcelColumns = [
  { header: 'Imię', accessor: (g: any) => g.firstName || g.first_name, width: 120 },
  { header: 'Nazwisko', accessor: (g: any) => g.lastName || g.last_name, width: 140 },
  { header: 'Email', accessor: (g: any) => g.email, width: 200 },
  { header: 'Telefon', accessor: (g: any) => g.phone, width: 130 },
  { header: 'Firma', accessor: (g: any) => g.company, width: 160 },
  { header: 'Status', accessor: (g: any) => g.status, width: 100 },
  { header: 'Typ biletu', accessor: (g: any) => g.ticketType || g.ticket_type, width: 120 },
  { header: 'Zameldowany', accessor: (g: any) => (g.checkedInAt || g.checked_in_at) ? 'Tak' : 'Nie', width: 100 },
];
