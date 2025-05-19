
import React from 'react';
import { MediaRegistrationStatus } from '@/types/pressRelease';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: MediaRegistrationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
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
}
