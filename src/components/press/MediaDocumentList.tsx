
import React from 'react';
import { useMediaDocuments } from '@/hooks/press';
import { MediaDocument, MediaDocumentType, MediaDocumentStatus } from '@/types/pressRelease';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Download, Trash, MoreHorizontal, Check, X } from 'lucide-react';

interface MediaDocumentListProps {
  registrationId: string;
  isOrganizer?: boolean;
}

export default function MediaDocumentList({ registrationId, isOrganizer = false }: MediaDocumentListProps) {
  const { 
    documents, 
    isLoading, 
    updateDocument, 
    deleteDocument, 
    getDocumentUrl
  } = useMediaDocuments({ registrationId });
  
  const getDocumentTypeLabel = (type: MediaDocumentType): string => {
    switch (type) {
      case 'press_id': return 'Press ID';
      case 'portfolio': return 'Portfolio';
      case 'assignment_letter': return 'Assignment Letter';
      case 'other': return 'Other';
      default: return type;
    }
  };
  
  const getStatusBadge = (status: MediaDocumentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };
  
  const handleDownload = (document: MediaDocument) => {
    const url = getDocumentUrl(document.filePath);
    window.open(url, '_blank');
  };
  
  const handleDelete = (id: string) => {
    deleteDocument(id);
  };
  
  const handleStatusChange = (id: string, status: MediaDocumentStatus) => {
    updateDocument(id, { status });
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading documents...</div>;
  }
  
  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
            <File className="h-12 w-12 mb-2 text-gray-400" />
            <h3 className="text-lg font-medium mb-1">No documents yet</h3>
            <p className="text-sm">
              {isOrganizer
                ? 'No documents have been uploaded for this registration yet.'
                : 'Upload supporting documents to strengthen your application.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Supporting documents for your application</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">{document.fileName}</TableCell>
                <TableCell>{getDocumentTypeLabel(document.documentType)}</TableCell>
                <TableCell>{getStatusBadge(document.status)}</TableCell>
                <TableCell>
                  {new Date(document.uploadedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(document)} className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      
                      {isOrganizer && document.status !== 'approved' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(document.id, 'approved')} className="cursor-pointer">
                          <Check className="mr-2 h-4 w-4" />
                          <span>Approve</span>
                        </DropdownMenuItem>
                      )}
                      
                      {isOrganizer && document.status !== 'rejected' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(document.id, 'rejected')} className="cursor-pointer">
                          <X className="mr-2 h-4 w-4" />
                          <span>Reject</span>
                        </DropdownMenuItem>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete document</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the document.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(document.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
