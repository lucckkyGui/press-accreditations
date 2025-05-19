
import React from 'react';
import { MediaRegistration, MediaRegistrationStatus } from '@/types/pressRelease';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { EyeIcon, Trash, MoreHorizontal, Check, X, AlertTriangle } from 'lucide-react';

interface RegistrationActionsProps {
  registration: MediaRegistration;
  isOrganizer: boolean;
  onViewDetails: (registration: MediaRegistration) => void;
  onStatusChange: (id: string, status: MediaRegistrationStatus) => void;
  onDelete: (id: string) => void;
}

export default function RegistrationActions({ 
  registration, 
  isOrganizer, 
  onViewDetails, 
  onStatusChange, 
  onDelete 
}: RegistrationActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onViewDetails(registration)} 
          className="cursor-pointer"
        >
          <EyeIcon className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        
        {isOrganizer && registration.status !== 'approved' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(registration.id, 'approved')}
            className="cursor-pointer"
          >
            <Check className="mr-2 h-4 w-4" />
            <span>Approve</span>
          </DropdownMenuItem>
        )}
        
        {isOrganizer && registration.status !== 'rejected' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(registration.id, 'rejected')}
            className="cursor-pointer"
          >
            <X className="mr-2 h-4 w-4" />
            <span>Reject</span>
          </DropdownMenuItem>
        )}
        
        {isOrganizer && registration.status !== 'changes_requested' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(registration.id, 'changes_requested')}
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
                onClick={() => onDelete(registration.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
