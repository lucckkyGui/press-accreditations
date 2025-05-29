
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Guest } from '@/types';
import { AlertCircle } from 'lucide-react';
import { useGuestImport } from './import/useGuestImport';
import FileUploadSection from './import/FileUploadSection';
import ImportSettings from './import/ImportSettings';
import GuestPreviewTable from './import/GuestPreviewTable';

interface BulkGuestImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (guests: Array<Partial<Guest> & { eventId: string }>) => Promise<void>;
  eventId: string;
  isSubmitting?: boolean;
}

const BulkGuestImport: React.FC<BulkGuestImportProps> = ({ 
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
    setDefaultZone,
    handleFileChange,
    prepareGuestsForImport,
    resetForm
  } = useGuestImport();
  
  const handleImport = async () => {
    try {
      const validGuests = prepareGuestsForImport(eventId);
      
      if (validGuests.length === 0) {
        return;
      }
      
      await onImport(validGuests);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error('Error importing guests:', err);
    }
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  const validGuestsCount = processedGuests.filter(g => g.valid).length;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Importuj gości</DialogTitle>
          <DialogDescription>
            Importuj listę gości z pliku CSV. Plik powinien zawierać kolumny: firstName, lastName, email, company (opcjonalnie), phone (opcjonalnie), zone (opcjonalnie).
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
          <FileUploadSection
            file={file}
            onFileChange={handleFileChange}
            onReset={resetForm}
          />
          
          {file && (
            <>
              <div>
                <p className="text-xs text-muted-foreground">
                  {processedGuests.length} gości, {validGuestsCount} prawidłowych
                </p>
              </div>
              
              <ImportSettings
                defaultZone={defaultZone}
                onDefaultZoneChange={setDefaultZone}
              />
              
              <GuestPreviewTable guests={processedGuests} />
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || validGuestsCount === 0 || isSubmitting}
          >
            {isSubmitting ? 'Importowanie...' : 'Importuj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGuestImport;
