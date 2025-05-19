
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
import { Textarea } from '@/components/ui/textarea';

interface RejectionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedRegistration: MediaRegistration | null;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onConfirmRejection: () => void;
}

export default function RejectionDialog({
  isOpen,
  setIsOpen,
  selectedRegistration,
  rejectionReason,
  setRejectionReason,
  onConfirmRejection
}: RejectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirmRejection}
            disabled={!rejectionReason.trim()}
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
