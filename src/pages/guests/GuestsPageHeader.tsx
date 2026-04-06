
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Users, Download, FileDown, FileSpreadsheet } from 'lucide-react';
import { Event, Guest } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { STRIPE_TIERS } from "@/config/stripe";
import { exportToExcel, guestExcelColumns } from "@/utils/excelExport";

interface GuestsPageHeaderProps {
  selectedEvent: Event | null;
  onImportClick: () => void;
  onCreateClick: () => void;
  guestCount?: number;
  guests?: Guest[];
}

const GuestsPageHeader: React.FC<GuestsPageHeaderProps> = ({
  selectedEvent,
  onImportClick,
  onCreateClick,
  guestCount = 0,
  guests = []
}) => {
  const { limits, isWithinGuestLimit, currentTier } = useFeatureAccess();
  const atLimit = !isWithinGuestLimit(guestCount);
  const tierName = currentTier === 'free' ? 'Darmowy' : STRIPE_TIERS[currentTier].name;

  const handleExportCSV = () => {
    if (guests.length === 0) return;
    const headers = ['Imię', 'Nazwisko', 'Email', 'Firma', 'Telefon', 'Typ biletu', 'Strefy', 'Status'];
    const rows = guests.map(g => [
      g.firstName, g.lastName, g.email, g.company || '', g.phone || '',
      g.ticketType, (g.zones || []).join('; '), g.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goscie_${selectedEvent?.name || 'export'}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Imię', 'Nazwisko', 'Email', 'Firma', 'Telefon', 'Typ biletu', 'Strefy'];
    const example = ['Jan', 'Kowalski', 'jan@example.com', 'Firma ABC', '+48123456789', 'uczestnik', 'VIP; Backstage'];
    const csv = [headers.join(','), example.map(c => `"${c}"`).join(',')].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'szablon_importu_gosci.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase">Zarządzanie</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="h-7 w-7 text-primary/60" />
            Goście
          </h1>
          {limits.maxGuests < Infinity && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary border-0 text-xs">
                {guestCount} / {limits.maxGuests}
              </Badge>
              <span className="text-sm text-muted-foreground">plan {tierName}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate} className="rounded-xl gap-2" size="sm">
            <FileDown className="h-4 w-4" />
            Szablon importu
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={guests.length === 0} className="rounded-xl gap-2" size="sm">
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportToExcel(guests, guestExcelColumns, `goscie_${selectedEvent?.title || 'export'}`)} disabled={guests.length === 0} className="rounded-xl gap-2" size="sm">
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={onImportClick} disabled={!selectedEvent || atLimit} className="rounded-xl gap-2">
            <Upload className="h-4 w-4" />
            Importuj
          </Button>
          <Button onClick={onCreateClick} disabled={!selectedEvent || atLimit} className="rounded-xl gap-2 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all">
            <Plus className="h-4 w-4" />
            Dodaj gościa
          </Button>
        </div>
      </div>
      {atLimit && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>
            Osiągnięto limit {limits.maxGuests} gości dla planu {tierName}. Ulepsz plan, aby dodać więcej gości.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GuestsPageHeader;
