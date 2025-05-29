
import { useState } from 'react';
import { Guest } from "@/types";

export const useGuestsDialogs = () => {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const openFormDialog = (guest?: Guest) => {
    setSelectedGuest(guest || null);
    setShowFormDialog(true);
  };

  const closeFormDialog = () => {
    setSelectedGuest(null);
    setShowFormDialog(false);
  };

  const openImportDialog = () => {
    setShowImportDialog(true);
  };

  const closeImportDialog = () => {
    setShowImportDialog(false);
  };

  const openEmailDialog = () => {
    setShowEmailDialog(true);
  };

  const closeEmailDialog = () => {
    setShowEmailDialog(false);
  };

  return {
    showFormDialog,
    showImportDialog,
    showEmailDialog,
    selectedGuest,
    setShowFormDialog,
    setShowImportDialog,
    setShowEmailDialog,
    setSelectedGuest,
    openFormDialog,
    closeFormDialog,
    openImportDialog,
    closeImportDialog,
    openEmailDialog,
    closeEmailDialog
  };
};
