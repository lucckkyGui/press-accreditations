
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Guest } from '@/types';
import { AlertCircle, Users } from 'lucide-react';
import { useEnhancedGuestImport } from './enhanced-import/useEnhancedGuestImport';
import EnhancedFileUploadSection from './enhanced-import/EnhancedFileUploadSection';
import EnhancedImportSettings from './enhanced-import/EnhancedImportSettings';
import EnhancedGuestPreviewTable from './enhanced-import/EnhancedGuestPreviewTable';

interface EnhancedBulkGuestImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (guests: Array<Partial<Guest> & { eventId: string }>) => Promise<void>;
  eventId: string;
  isSubmitting?: boolean;
}

const EnhancedBulkGuestImport: React.FC<EnhancedBulkGuestImportProps> = ({ 
  open, 
  onOpenChange, 
  onImport, 
  eventId,
  isSubmitting = false 
}) => {
  const {
    file,
    processedGuests,
    defaultZone,
    error,
    importProgress,
    isProcessing,
    selectedCount,
    validCount,
    setDefaultZone,
    setImportProgress,
    handleFileChange,
    handleSelectAll,
    handleSelectGuest,
    prepareGuestsForImport,
    resetForm
  } = useEnhancedGuestImport();
  
  const handleImport = async () => {
    try {
      const selectedValidGuests = prepareGuestsForImport(eventId);
      
      if (selectedValidGuests.length === 0) {
        return;
      }
      
      // Symulacja postępu importu
      const batchSize = 100;
      const totalBatches = Math.ceil(selectedValidGuests.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = selectedValidGuests.slice(i * batchSize, (i + 1) * batchSize);
        await onImport(batch);
        
        const progress = ((i + 1) / totalBatches) * 100;
        setImportProgress(progress);
        
        // Małe opóźnienie dla lepszego UX
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      resetForm();
      onOpenChange(false);
    } catch (err) {
    }
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Import gości z pliku</DialogTitle>
          <DialogDescription>
            Importuj listę gości z pliku CSV lub Excel. Obsługujemy pola: imię, nazwisko, email, PESEL, firma, telefon, strefa.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Błąd</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 py-4">
          <EnhancedFileUploadSection
            file={file}
            onFileChange={handleFileChange}
            onReset={resetForm}
            selectedCount={selectedCount}
            validCount={validCount}
            totalCount={processedGuests.length}
          />
          
          {file && (
            <>
              <EnhancedImportSettings
                defaultZone={defaultZone}
                onDefaultZoneChange={setDefaultZone}
              />

              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Przetwarzanie pliku...</p>
                  </div>
                </div>
              ) : (
                <>
                  {importProgress > 0 && importProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Postęp importu:</span>
                        <span className="text-sm font-medium">{Math.round(importProgress)}%</span>
                      </div>
                      <Progress value={importProgress} className="w-full" />
                    </div>
                  )}
                  
                  <EnhancedGuestPreviewTable
                    guests={processedGuests}
                    selectedCount={selectedCount}
                    validCount={validCount}
                    onSelectAll={handleSelectAll}
                    onSelectGuest={handleSelectGuest}
                  />
                </>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || selectedCount === 0 || isSubmitting || isProcessing}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isSubmitting ? 'Importowanie...' : `Importuj (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBulkGuestImport;
