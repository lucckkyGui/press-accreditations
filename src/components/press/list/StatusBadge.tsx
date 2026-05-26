
import React from 'react';
import { MediaRegistrationStatus } from '@/types/pressRelease';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: MediaRegistrationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-success">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'changes_requested':
      return <Badge className="bg-warning">Changes Requested</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}
