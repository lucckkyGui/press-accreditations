
import React from 'react';
import { MediaRegistration } from '@/types/pressRelease';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import MediaDocumentList from '../MediaDocumentList';

interface RegistrationDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  registration: MediaRegistration | null;
  isOrganizer: boolean;
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void;
}

export default function RegistrationDetailsDialog({
  isOpen,
  setIsOpen,
  registration,
  isOrganizer,
  onStatusChange
}: RegistrationDetailsDialogProps) {
  if (!registration) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registration Details</DialogTitle>
          <DialogDescription>
            {registration.mediaOrganization} - Submitted on {new Date(registration.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Media Organization</h4>
              <p>{registration.mediaOrganization}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Job Title</h4>
              <p>{registration.jobTitle}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Website</h4>
              <p>{registration.website || 'Not provided'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Previous Accreditation</h4>
              <p>{registration.previousAccreditation ? 'Yes' : 'No'}</p>
            </div>
            {registration.coverageDescription && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Coverage Description</h4>
                <p className="whitespace-pre-wrap">{registration.coverageDescription}</p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Supporting Documents</h4>
            <MediaDocumentList 
              registrationId={registration.id} 
              isOrganizer={isOrganizer}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          
          {isOrganizer && (
            <>
              {registration.status !== 'approved' && (
                <Button
                  onClick={() => onStatusChange(registration.id, 'approved')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              
              {registration.status !== 'rejected' && (
                <Button
                  variant="destructive"
                  onClick={() => onStatusChange(registration.id, 'rejected')}
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
  );
}
