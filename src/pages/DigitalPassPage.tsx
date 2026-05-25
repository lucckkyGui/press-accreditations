import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import DigitalPassGenerator from "@/components/passes/DigitalPassGenerator";
import { Wallet } from "lucide-react";

const DigitalPassPage = () => {
  usePageTitle("Digital Pass Generator");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" /> Digital Pass Generator
        </h1>
        <p className="text-muted-foreground">Generuj cyfrowe passy do portfeli mobilnych</p>
      </div>
      <DigitalPassGenerator />
    </div>
  );
};

export default DigitalPassPage;