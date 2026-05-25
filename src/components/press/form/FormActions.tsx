
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
}

export default function FormActions({ isSubmitting, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </Button>
    </div>
  );
}
