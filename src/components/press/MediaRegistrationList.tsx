import React, { useState } from 'react';
import { useMediaRegistrations } from '@/hooks/press';
import { MediaRegistration, MediaRegistrationStatus } from '@/types/pressRelease';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, EyeIcon, Trash, MoreHorizontal, Check, X, AlertTriangle } from 'lucide-react';

import MediaDocumentList from './MediaDocumentList';

interface MediaRegistrationListProps {
  eventId: string;
  isOrganizer?: boolean;
}

export default function MediaRegistrationList({ eventId, isOrganizer = false }: MediaRegistrationListProps) {
  const { registrations, isLoading, updateMediaRegistration, deleteMediaRegistration } = useMediaRegistrations({ eventId });
  
  const [selectedRegistration, setSelectedRegistration] = useState<MediaRegistration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  
  const getStatusBadge = (status: MediaRegistrationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'changes_requested':
        return <Badge className="bg-amber-500">Changes Requested</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };
  
  const handleViewDetails = (registration: MediaRegistration) => {
    setSelectedRegistration(registration);
    setIsDetailsOpen(true);
  };
  
  const handleStatusChange = (id: string, status: MediaRegistrationStatus) => {
    if (status === 'rejected') {
      setSelectedRegistration(registrations?.find(r => r.id === id) || null);
      setRejectionDialogOpen(true);
      return;
    }
    
    updateMediaRegistration(id, { status });
  };
  
  const handleConfirmRejection = () => {
    if (selectedRegistration && rejectionReason.trim()) {
      updateMediaRegistration(selectedRegistration.id, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
      });
      
      setRejectionDialogOpen(false);
      setRejectionReason('');
      setSelectedRegistration(null);
    }
  };
  
  const handleDelete = (id: string) => {
    deleteMediaRegistration(id);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading registrations...</div>;
  }
  
  if (!registrations || registrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Media Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mb-2 text-gray-400" />
            <h3 className="text-lg font-medium mb-1">No registrations</h3>
            <p className="text-sm">
              {isOrganizer
                ? 'No media registrations have been submitted for this event yet.'
                : 'You have not submitted any media registrations yet.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Media Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Media registrations for this event</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Media Organization</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">{registration.mediaOrganization}</TableCell>
                  <TableCell>{registration.user?.firstName} {registration.user?.lastName}</TableCell>
                  <TableCell>{getStatusBadge(registration.status)}</TableCell>
                  <TableCell>
                    {new Date(registration.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleViewDetails(registration)} 
                          className="cursor-pointer"
                        >
                          <EyeIcon className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        
                        {isOrganizer && registration.status !== 'approved' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(registration.id, 'approved')}
                            className="cursor-pointer"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            <span>Approve</span>
                          </DropdownMenuItem>
                        )}
                        
                        {isOrganizer && registration.status !== 'rejected' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(registration.id, 'rejected')}
                            className="cursor-pointer"
                          >
                            <X className="mr-2 h-4 w-4" />
                            <span>Reject</span>
                          </DropdownMenuItem>
                        )}
                        
                        {isOrganizer && registration.status !== 'changes_requested' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(registration.id, 'changes_requested')}
                            className="cursor-pointer"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Request Changes</span>
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
                              <AlertDialogTitle>Delete registration</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the registration
                                and all associated documents.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(registration.id)}
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
      
      {/* Registration Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              {selectedRegistration?.mediaOrganization} - Submitted on {selectedRegistration ? new Date(selectedRegistration.createdAt).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Media Organization</h4>
                  <p>{selectedRegistration.mediaOrganization}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Job Title</h4>
                  <p>{selectedRegistration.jobTitle}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Website</h4>
                  <p>{selectedRegistration.website || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Previous Accreditation</h4>
                  <p>{selectedRegistration.previousAccreditation ? 'Yes' : 'No'}</p>
                </div>
                {selectedRegistration.coverageDescription && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Coverage Description</h4>
                    <p className="whitespace-pre-wrap">{selectedRegistration.coverageDescription}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Supporting Documents</h4>
                <MediaDocumentList 
                  registrationId={selectedRegistration.id} 
                  isOrganizer={isOrganizer}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            
            {isOrganizer && selectedRegistration && (
              <>
                {selectedRegistration.status !== 'approved' && (
                  <Button
                    onClick={() => handleStatusChange(selectedRegistration.id, 'approved')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                )}
                
                {selectedRegistration.status !== 'rejected' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange(selectedRegistration.id, 'rejected')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this registration.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter the reason for rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmRejection}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
