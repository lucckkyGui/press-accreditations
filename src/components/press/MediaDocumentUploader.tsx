import React, { useState, useRef } from 'react';
import { useMediaDocuments } from '@/hooks/press';
import { MediaDocumentForm, MediaDocumentType } from '@/types/pressRelease';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, CheckCircle } from 'lucide-react';

interface MediaDocumentUploaderProps {
  registrationId: string;
  onSuccess?: () => void;
}

export default function MediaDocumentUploader({ registrationId, onSuccess }: MediaDocumentUploaderProps) {
  const { uploadDocument, isUploading } = useMediaDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<MediaDocumentType>('press_id');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const documentTypeOptions = [
    { value: 'press_id', label: 'Press ID / Media Credential' },
    { value: 'portfolio', label: 'Portfolio / Work Samples' },
    { value: 'assignment_letter', label: 'Assignment Letter' },
    { value: 'other', label: 'Other Document' },
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus('idle');
      setError(null);
    }
  };

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value as MediaDocumentType);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 300);
    
    try {
      const formData: MediaDocumentForm = {
        registrationId,
        file: selectedFile,
        documentType,
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      await uploadDocument(formData);
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('success');
      setSelectedFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000);
      
    } catch (error: Error | unknown) {
      clearInterval(interval);
      setUploadStatus('error');
      setError(error.message || 'Failed to upload document');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Upload Supporting Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select 
            value={documentType} 
            onValueChange={handleDocumentTypeChange}
          >
            <SelectTrigger id="document-type" className="w-full">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="document-file">Select File</Label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => fileInputRef.current?.click()}>
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFile ? selectedFile.name : 'Click to browse or drop a file'}
              </div>
              {selectedFile && (
                <div className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
          </div>
        </div>
        
        {uploadStatus === 'uploading' && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-gray-500">
              Uploading: {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
        
        {uploadStatus === 'success' && (
          <div className="p-2 bg-green-50 border border-green-100 rounded-md flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm">Document uploaded successfully</p>
          </div>
        )}
        
        {uploadStatus === 'error' && (
          <div className="p-2 bg-red-50 border border-red-100 rounded-md flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error || 'An error occurred while uploading'}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading || uploadStatus === 'uploading'}
        >
          {isUploading || uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardFooter>
    </Card>
  );
}
