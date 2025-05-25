
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  registrationId: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
}

export default function DocumentUploader({ 
  registrationId, 
  onUploadComplete,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Możesz przesłać maksymalnie ${maxFiles} plików`);
      return;
    }

    setIsUploading(true);
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload with progress
    for (const file of newFiles) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }

        // Mark as completed
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'completed', url: `#uploaded-${file.id}` }
            : f
        ));
        
        toast.success(`Plik ${file.name} został przesłany`);
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error' } : f
        ));
        toast.error(`Błąd podczas przesyłania pliku ${file.name}`);
      }
    }

    setIsUploading(false);
    if (onUploadComplete) {
      onUploadComplete(newFiles.filter(f => f.status === 'completed'));
    }
  }, [files.length, maxFiles, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    disabled: isUploading
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Przesyłanie dokumentów
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary/50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-primary font-medium">Upuść pliki tutaj...</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Przeciągnij i upuść pliki lub kliknij aby wybrać
              </p>
              <p className="text-sm text-gray-500">
                Obsługiwane formaty: PDF, DOC, DOCX, obrazy
              </p>
              <p className="text-sm text-gray-500">
                Maksymalny rozmiar: {formatFileSize(maxFileSize)}
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Przesłane pliki:</h4>
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <File className="h-5 w-5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-1" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
