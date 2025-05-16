
import React from 'react';
import { MediaRegistration, MediaRegistrationStatus as RegistrationStatus } from '@/types/pressRelease';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, XCircle, FileEdit } from 'lucide-react';

interface MediaRegistrationStatusProps {
  registration: MediaRegistration;
  onEdit?: () => void;
  onCancel?: () => void;
}

export default function MediaRegistrationStatus({ 
  registration, 
  onEdit, 
  onCancel 
}: MediaRegistrationStatusProps) {
  const getStatusIcon = (status: RegistrationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'changes_requested':
        return <FileEdit className="h-8 w-8 text-amber-500" />;
      default: // pending
        return <Clock className="h-8 w-8 text-blue-500" />;
    }
  };
  
  const getStatusBadge = (status: RegistrationStatus) => {
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
  
  const getStatusMessage = (status: RegistrationStatus) => {
    switch (status) {
      case 'approved':
        return "Congratulations! Your registration has been approved. You can proceed with the next steps.";
      case 'rejected':
        return registration.rejectionReason || "Your registration has been rejected. Please contact the event organizer for more details.";
      case 'changes_requested':
        return "Please make the requested changes to your registration and resubmit.";
      default:
        return "Your registration is under review. We will notify you when there is an update.";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {getStatusIcon(registration.status)}
          <div>
            <div className="font-semibold flex items-center space-x-2">
              <span>Status:</span> 
              {getStatusBadge(registration.status)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(registration.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-semibold">Message</h4>
          <div className={`p-3 rounded-md ${
            registration.status === 'rejected' 
              ? 'bg-red-50 border border-red-100 text-red-700' 
              : 'bg-gray-50 border border-gray-100'
          }`}>
            {registration.status === 'rejected' && (
              <div className="flex items-start space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <span className="font-medium">Rejection Reason</span>
              </div>
            )}
            <p className="text-sm">{getStatusMessage(registration.status)}</p>
          </div>
        </div>
      </CardContent>
      {(registration.status === 'pending' || registration.status === 'changes_requested') && (
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel Application
            </Button>
          )}
          {onEdit && registration.status === 'changes_requested' && (
            <Button onClick={onEdit}>
              Edit Application
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
