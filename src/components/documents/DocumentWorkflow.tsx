import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocumentSubmissions, DocumentSubmission } from '@/hooks/documents/useDocumentSubmissions';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  File,
  FileText,
  Image,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface DocumentWorkflowProps {
  eventId: string;
  className?: string;
}

const statusConfig = {
  pending: { label: 'Oczekuje', icon: Clock, color: 'bg-yellow-500' },
  approved: { label: 'Zatwierdzony', icon: CheckCircle, color: 'bg-green-500' },
  rejected: { label: 'Odrzucony', icon: XCircle, color: 'bg-red-500' },
  changes_requested: { label: 'Wymaga zmian', icon: AlertCircle, color: 'bg-orange-500' }
};

export function DocumentWorkflow({ eventId, className }: DocumentWorkflowProps) {
  const { submissions, isLoading, createSubmission, updateSubmissionStatus } = useDocumentSubmissions(eventId);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error('Wypełnij tytuł i wybierz plik');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${eventId}/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('Media Documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      await createSubmission(
        eventId,
        title,
        filePath,
        selectedFile.name,
        selectedFile.type,
        selectedFile.size,
        description
      );

      setUploadProgress(100);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setIsUploadOpen(false);
      toast.success('Dokument został przesłany');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Nie udało się przesłać dokumentu');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-32", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dokumenty</CardTitle>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Prześlij dokument
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prześlij nowy dokument</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Tytuł dokumentu *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Opis (opcjonalnie)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <File className="h-5 w-5" />
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                ) : isDragActive ? (
                  <p className="text-sm">Upuść plik tutaj...</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Przeciągnij plik lub kliknij, aby wybrać
                  </p>
                )}
              </div>
              {isUploading && (
                <Progress value={uploadProgress} className="h-2" />
              )}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Przesyłanie...
                  </>
                ) : (
                  'Prześlij'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Brak przesłanych dokumentów
          </p>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <DocumentItem
                key={submission.id}
                submission={submission}
                onStatusChange={updateSubmissionStatus}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DocumentItemProps {
  submission: DocumentSubmission;
  onStatusChange: (id: string, status: DocumentSubmission['status'], notes?: string) => Promise<boolean>;
}

function DocumentItem({ submission, onStatusChange }: DocumentItemProps) {
  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;
  const FileIcon = submission.fileType.startsWith('image/') ? Image : 
                   submission.fileType.includes('pdf') ? FileText : File;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-md bg-muted">
        <FileIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium truncate">{submission.title}</p>
            <p className="text-xs text-muted-foreground">{submission.fileName}</p>
          </div>
          <Badge variant="outline" className="shrink-0">
            <StatusIcon className={cn("h-3 w-3 mr-1", status.color.replace('bg-', 'text-'))} />
            {status.label}
          </Badge>
        </div>
        {submission.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {submission.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {format(new Date(submission.createdAt), 'd MMM yyyy, HH:mm', { locale: pl })}
        </p>
        {submission.reviewNotes && (
          <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
            <span className="font-medium">Uwagi: </span>
            {submission.reviewNotes}
          </p>
        )}
      </div>
    </div>
  );
}

export default DocumentWorkflow;
