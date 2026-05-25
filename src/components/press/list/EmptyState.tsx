
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  isOrganizer: boolean;
}

export default function EmptyState({ isOrganizer }: EmptyStateProps) {
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
