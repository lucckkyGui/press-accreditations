
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, FileText, FileSpreadsheet, Calendar, Users, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportConfig {
  type: 'guests' | 'attendance' | 'zones' | 'analytics';
  format: 'excel' | 'pdf' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  includeFields: string[];
  filters: {
    status?: string;
    zone?: string;
    includeBlacklisted?: boolean;
  };
}

const ReportExporter: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'guests',
    format: 'excel',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeFields: ['name', 'email', 'status', 'checkInTime'],
    filters: {}
  });

  const [isExporting, setIsExporting] = useState(false);

  const reportTypes = [
    {
      id: 'guests',
      name: 'Raport gości',
      description: 'Lista wszystkich gości z ich danymi i statusami',
      icon: Users,
      fields: [
        { id: 'name', label: 'Imię i nazwisko' },
        { id: 'email', label: 'Email' },
        { id: 'company', label: 'Firma' },
        { id: 'phone', label: 'Telefon' },
        { id: 'status', label: 'Status' },
        { id: 'zone', label: 'Strefa' },
        { id: 'checkInTime', label: 'Czas check-in' },
        { id: 'checkOutTime', label: 'Czas check-out' },
        { id: 'invitationSent', label: 'Zaproszenie wysłane' },
        { id: 'invitationOpened', label: 'Zaproszenie otwarte' }
      ]
    },
    {
      id: 'attendance',
      name: 'Raport obecności',
      description: 'Szczegółowy raport obecności gości',
      icon: Calendar,
      fields: [
        { id: 'name', label: 'Imię i nazwisko' },
        { id: 'checkInTime', label: 'Czas wejścia' },
        { id: 'checkOutTime', label: 'Czas wyjścia' },
        { id: 'duration', label: 'Czas przebywania' },
        { id: 'zone', label: 'Strefa' },
        { id: 'location', label: 'Lokalizacja' }
      ]
    },
    {
      id: 'zones',
      name: 'Raport stref',
      description: 'Wykorzystanie stref dostępu',
      icon: BarChart3,
      fields: [
        { id: 'zoneName', label: 'Nazwa strefy' },
        { id: 'capacity', label: 'Pojemność' },
        { id: 'currentOccupancy', label: 'Aktualna obsada' },
        { id: 'maxOccupancy', label: 'Maksymalna obsada' },
        { id: 'utilizationRate', label: 'Stopień wykorzystania' },
        { id: 'accessAttempts', label: 'Próby dostępu' }
      ]
    },
    {
      id: 'analytics',
      name: 'Raport analityczny',
      description: 'Zaawansowana analityka wydarzenia',
      icon: BarChart3,
      fields: [
        { id: 'totalGuests', label: 'Łączna liczba gości' },
        { id: 'attendanceRate', label: 'Wskaźnik obecności' },
        { id: 'avgDuration', label: 'Średni czas przebywania' },
        { id: 'peakHours', label: 'Godziny szczytu' },
        { id: 'zonePopularity', label: 'Popularność stref' },
        { id: 'emailEngagement', label: 'Zaangażowanie email' }
      ]
    }
  ];

  const currentReportType = reportTypes.find(type => type.id === reportConfig.type);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Symulacja eksportu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileName = `${currentReportType?.name}_${reportConfig.dateRange.start}_${reportConfig.dateRange.end}.${reportConfig.format}`;
      
      toast.success(`Raport wyeksportowany: ${fileName}`);
      
      // W rzeczywistej aplikacji tutaj byłoby pobieranie pliku
      console.log('Eksport konfiguracji:', reportConfig);
      
    } catch (error) {
      toast.error('Błąd podczas eksportu raportu');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setReportConfig(prev => ({
      ...prev,
      includeFields: checked
        ? [...prev.includeFields, fieldId]
        : prev.includeFields.filter(id => id !== fieldId)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Export raportów</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konfiguracja raportu */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typ raportu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      reportConfig.type === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setReportConfig(prev => ({ 
                      ...prev, 
                      type: type.id as any,
                      includeFields: type.fields.slice(0, 4).map(f => f.id)
                    }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <type.icon className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Format i zakres dat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Format</label>
                  <Select
                    value={reportConfig.format}
                    onValueChange={(value) => setReportConfig(prev => ({
                      ...prev,
                      format: value as any
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel (.xlsx)
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          PDF (.pdf)
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileDown className="h-4 w-4" />
                          CSV (.csv)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Data od</label>
                  <input
                    type="date"
                    value={reportConfig.dateRange.start}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Data do</label>
                  <input
                    type="date"
                    value={reportConfig.dateRange.end}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pola do uwzględnienia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentReportType?.fields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={reportConfig.includeFields.includes(field.id)}
                      onCheckedChange={(checked) => handleFieldToggle(field.id, !!checked)}
                    />
                    <label htmlFor={field.id} className="text-sm cursor-pointer">
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Podgląd i eksport */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Podgląd raportu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ:</span>
                  <span className="font-medium">{currentReportType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{reportConfig.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zakres:</span>
                  <span className="font-medium">
                    {reportConfig.dateRange.start} - {reportConfig.dateRange.end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pola:</span>
                  <span className="font-medium">{reportConfig.includeFields.length}</span>
                </div>
              </div>

              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  'Eksportowanie...'
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Eksportuj raport
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Szybkie raporty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Lista obecnych gości
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Dzienny raport obecności
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Podsumowanie wydarzenia
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportExporter;
