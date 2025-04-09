
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface InstallPWAProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function InstallPWA({ className, variant = "outline" }: InstallPWAProps) {
  const { isInstallable, isInstalled, installPWA } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button 
      variant={variant}
      onClick={installPWA}
      className={className}
      size="sm"
    >
      <Download className="mr-2 h-4 w-4" />
      Zainstaluj aplikację
    </Button>
  );
}
