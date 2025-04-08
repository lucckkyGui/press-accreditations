
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Guest } from "@/types";
import QRScanner from "@/components/scanner/QRScanner";
import { toast } from "sonner";

const Scanner = () => {
  const handleScanSuccess = (guest: Guest) => {
    toast.success(`${guest.firstName} ${guest.lastName} zeskanowany pomyślnie`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skaner QR</h1>
          <p className="text-muted-foreground">
            Skanuj kody QR gości, aby zweryfikować ich dostęp do wydarzenia.
          </p>
        </div>
        
        <div className="flex justify-center py-8">
          <QRScanner onScanSuccess={handleScanSuccess} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Scanner;
