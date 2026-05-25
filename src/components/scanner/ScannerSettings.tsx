
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/hooks/useI18n";

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
  const { t } = useI18n();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("settings.title")}</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-scan">{t("settings.autoScan")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.autoScanDesc")}
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
              <Label htmlFor="haptic">{t("settings.vibration")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.vibrationDesc")}
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
              <Label htmlFor="sound">{t("settings.sound")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.soundDesc")}
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
              <Label htmlFor="front-camera">{t("settings.frontCamera")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.frontCameraDesc")}
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
              <Label htmlFor="flashlight">{t("settings.flashlight")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.flashlightDesc")}
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
