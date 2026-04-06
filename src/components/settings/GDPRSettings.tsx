import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Trash2, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GDPRSettings: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gdpr-export", {
        body: { action: "export" },
      });
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moje-dane-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dane wyeksportowane pomyślnie");
    } catch (e: unknown) {
      toast.error("Błąd eksportu: " + (e.message || "Nieznany błąd"));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gdpr-export", {
        body: { action: "delete" },
      });
      if (error) throw error;
      toast.success("Konto i dane osobowe zostały usunięte");
      // Redirect after deletion
      window.location.href = "/";
    } catch (e: unknown) {
      toast.error("Błąd usuwania: " + (e.message || "Nieznany błąd"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Prywatność i RODO
        </CardTitle>
        <CardDescription>
          Zarządzaj swoimi danymi osobowymi zgodnie z Rozporządzeniem RODO (GDPR)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Export */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border">
          <div className="space-y-1">
            <h4 className="font-medium">Eksport danych (Art. 20 RODO)</h4>
            <p className="text-sm text-muted-foreground">
              Pobierz kopię wszystkich swoich danych osobowych w formacie JSON.
              Obejmuje profil, wydarzenia, powiadomienia i dokumenty.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="shrink-0"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Eksportuj
          </Button>
        </div>

        {/* Data Deletion */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="space-y-1">
            <h4 className="font-medium text-destructive">Usunięcie konta (Art. 17 RODO)</h4>
            <p className="text-sm text-muted-foreground">
              Trwale usuń swoje konto i wszystkie powiązane dane osobowe.
              Ta operacja jest nieodwracalna.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0" disabled={deleting}>
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Usuń konto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Potwierdzenie usunięcia konta
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>Ta operacja jest <strong>nieodwracalna</strong>. Zostaną usunięte:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Twój profil i dane osobowe</li>
                    <li>Wszystkie powiadomienia</li>
                    <li>Wnioski o akredytację</li>
                    <li>Rejestracje mediowe i dokumenty</li>
                    <li>Konwersacje na czacie</li>
                    <li>Twoje konto użytkownika</li>
                  </ul>
                  <p className="font-medium mt-3">Czy na pewno chcesz kontynuować?</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Tak, usuń konto
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Info */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Przetwarzamy Twoje dane zgodnie z RODO. Masz prawo do dostępu, sprostowania,
            usunięcia i przenoszenia swoich danych. W razie pytań skontaktuj się z nami
            przez stronę <a href="/contact" className="underline font-medium">Kontakt</a>.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default GDPRSettings;
