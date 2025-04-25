
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, QrCode, Smartphone } from "lucide-react";

interface CameraPreviewProps {
  scanning: boolean;
  cameraActive: boolean;
  onStartScanning: () => void;
  onStopScanning: () => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  scanning,
  cameraActive,
  onStartScanning,
  onStopScanning,
}) => {
  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-primary rounded-lg">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-white border-opacity-40 rounded-md"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-red-500 opacity-70 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
          </div>
        </div>
        <p className="text-center mb-4">Skanowanie kodu QR...</p>
        <Button variant="outline" onClick={onStopScanning} className="gap-2">
          <CameraOff className="h-4 w-4" />
          Anuluj
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
      {cameraActive ? (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center">
          <Camera className="h-12 w-12 text-white opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-white border-opacity-40 rounded-md"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-0.5 bg-red-500 opacity-70 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute animate-ping w-4 h-4 bg-red-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
      )}
      <p className="text-center text-muted-foreground mb-4">
        Kliknij przycisk poniżej, aby rozpocząć skanowanie kodu QR
      </p>
      <Button onClick={onStartScanning} className="gap-2">
        <Smartphone className="h-4 w-4" />
        Rozpocznij skanowanie
      </Button>
    </div>
  );
};

export default CameraPreview;
