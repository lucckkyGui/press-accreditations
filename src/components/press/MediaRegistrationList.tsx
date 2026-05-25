
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Zaimportuj nowo utworzone komponenty
import StatusBadge from './list/StatusBadge';
import RegistrationActions from './list/RegistrationActions';
import RejectionDialog from './list/RejectionDialog';
import RegistrationDetailsDialog from './list/RegistrationDetailsDialog';
import EmptyState from './list/EmptyState';

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
    return <EmptyState isOrganizer={isOrganizer} />;
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
                  <TableCell><StatusBadge status={registration.status} /></TableCell>
                  <TableCell>
                    {new Date(registration.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <RegistrationActions 
                      registration={registration}
                      isOrganizer={isOrganizer}
                      onViewDetails={handleViewDetails}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Rejestracja Details Dialog */}
      <RegistrationDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        registration={selectedRegistration}
        isOrganizer={isOrganizer}
        onStatusChange={handleStatusChange}
      />
      
      {/* Rejection Reason Dialog */}
      <RejectionDialog
        isOpen={rejectionDialogOpen}
        setIsOpen={setRejectionDialogOpen}
        selectedRegistration={selectedRegistration}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirmRejection={handleConfirmRejection}
      />
    </>
  );
}
