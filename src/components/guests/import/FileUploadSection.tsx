
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, X } from 'lucide-react';

interface FileUploadSectionProps {
  file: File | null;
  onFileChange: (file: File) => void;
  onReset: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  file,
  onFileChange,
  onReset
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  if (file) {
    return (
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-sm">{file.name}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onReset}>
          <X className="h-4 w-4" />
          <span className="sr-only">Usuń plik</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
      <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-sm text-center text-muted-foreground mb-2">
        Przeciągnij i upuść plik CSV tutaj lub kliknij, aby wybrać
      </p>
      <Input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".csv"
        onChange={handleFileInputChange}
      />
      <Button asChild>
        <label htmlFor="file-upload">Wybierz plik CSV</label>
      </Button>
    </div>
  );
};

export default FileUploadSection;
