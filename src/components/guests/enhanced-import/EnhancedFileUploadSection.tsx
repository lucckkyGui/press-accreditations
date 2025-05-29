
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, X, Download } from 'lucide-react';

interface EnhancedFileUploadSectionProps {
  file: File | null;
  onFileChange: (file: File) => void;
  onReset: () => void;
  selectedCount: number;
  validCount: number;
  totalCount: number;
}

const EnhancedFileUploadSection: React.FC<EnhancedFileUploadSectionProps> = ({
  file,
  onFileChange,
  onReset,
  selectedCount,
  validCount,
  totalCount
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "firstName,lastName,email,pesel,company,phone,zone\n" +
                      "Jan,Kowalski,jan@example.com,80010112345,ABC Corp,+48123456789,general\n" +
                      "Anna,Nowak,anna@example.com,85020298765,XYZ Media,+48987654321,press";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'szablon_gosci.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (file) {
    return (
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-sm">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {totalCount} rekordów, {validCount} prawidłowych, {selectedCount} wybranych
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onReset}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
        <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm text-center text-muted-foreground mb-2">
          Przeciągnij i upuść plik CSV/Excel tutaj lub kliknij, aby wybrać
        </p>
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInputChange}
        />
        <Button asChild>
          <label htmlFor="file-upload">Wybierz plik</label>
        </Button>
      </div>
      
      <div className="flex justify-center">
        <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Pobierz szablon CSV
        </Button>
      </div>
    </div>
  );
};

export default EnhancedFileUploadSection;
