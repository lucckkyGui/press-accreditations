
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ScannerSettingsProps {
  settings: {
    autoScan: boolean;
    hapticFeedback: boolean;
    playSound: boolean;
    frontCamera: boolean;
    flashlight: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
}

const ScannerSettings: React.FC<ScannerSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Ustawienia skanera</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-scan">Automatyczne skanowanie</Label>
              <p className="text-xs text-muted-foreground">
                Automatycznie skanuj następny kod po zakończeniu
              </p>
            </div>
            <Switch
              id="auto-scan"
              checked={settings.autoScan}
              onCheckedChange={(value) => onSettingChange('autoScan', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="haptic">Wibracja przy skanowaniu</Label>
              <p className="text-xs text-muted-foreground">
                Urządzenie zawibruje przy poprawnym/błędnym skanowaniu
              </p>
            </div>
            <Switch
              id="haptic" 
              checked={settings.hapticFeedback}
              onCheckedChange={(value) => onSettingChange('hapticFeedback', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Dźwięki</Label>
              <p className="text-xs text-muted-foreground">
                Odtwarzaj dźwięki przy skanowaniu
              </p>
            </div>
            <Switch
              id="sound"
              checked={settings.playSound}
              onCheckedChange={(value) => onSettingChange('playSound', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="front-camera">Przednia kamera</Label>
              <p className="text-xs text-muted-foreground">
                Użyj przedniej kamery do skanowania
              </p>
            </div>
            <Switch
              id="front-camera"
              checked={settings.frontCamera}
              onCheckedChange={(value) => onSettingChange('frontCamera', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="flashlight">Lampa błyskowa</Label>
              <p className="text-xs text-muted-foreground">
                Włącz lampę podczas skanowania (jeśli dostępna)
              </p>
            </div>
            <Switch
              id="flashlight"
              checked={settings.flashlight}
              onCheckedChange={(value) => onSettingChange('flashlight', value)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ScannerSettings;
