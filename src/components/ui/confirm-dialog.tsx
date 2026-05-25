
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
}

export const ConfirmDialog = ({ title, description, onConfirm, onCancel, open }: ConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Potwierdź</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const confirm = ({ title, description }: { title: string; description: string }): Promise<boolean> => {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    document.body.appendChild(dialog);
    
    const cleanup = () => {
      document.body.removeChild(dialog);
    };
    
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };
    
    // This is a simplified implementation - in a real app you'd use a proper modal system
    const result = window.confirm(`${title}\n\n${description}`);
    cleanup();
    resolve(result);
  });
};
