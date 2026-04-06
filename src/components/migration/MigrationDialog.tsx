
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MigrationService } from "@/services/migration/migrationService";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface MigrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  migrationFn: (data: any[], entity: string) => Promise<any>;
  getLocalDataFn: (entity: string) => any[];
  entities: Array<{
    name: string;
    label: string;
  }>;
}

export function MigrationDialog({
  isOpen,
  onClose,
  migrationFn,
  getLocalDataFn,
  entities,
}: MigrationDialogProps) {
  const [progress, setProgress] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);
  const [results, setResults] = useState<Record<string, { successful: number; failed: number }>>(
    {}
  );

  const handleMigration = async () => {
    setIsMigrating(true);
    setProgress(0);

    try {
      const migrationResults = await MigrationService.migrateLocalData(
        migrationFn,
        getLocalDataFn,
        entities.map(e => e.name),
        {
          onProgress: (progress, total) => {
            setProgress((progress / total) * 100);
          },
        }
      );

      setResults(migrationResults);

      // Sprawdźmy czy były jakieś błędy
      const hasErrors = Object.values(migrationResults).some(
        (result) => result.failed > 0
      );

      if (hasErrors) {
        toast({
          title: "Migracja zakończona z błędami",
          description: "Niektóre dane nie zostały zmigrowane poprawnie. Sprawdź szczegóły.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Migracja zakończona",
          description: "Wszystkie dane zostały pomyślnie zmigrowane.",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd migracji",
        description: "Wystąpił nieoczekiwany błąd podczas migracji danych.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const totalMigrated = Object.values(results).reduce(
    (sum, result) => sum + result.successful,
    0
  );
  const totalFailed = Object.values(results).reduce(
    (sum, result) => sum + result.failed,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Migracja danych do Supabase</DialogTitle>
          <DialogDescription>
            Ten proces przeniesie wszystkie Twoje lokalne dane do bazy Supabase.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isMigrating ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Migracja w toku, nie zamykaj tej strony...
              </p>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-right text-muted-foreground">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
          ) : Object.keys(results).length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="font-medium">Podsumowanie migracji</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Łącznie zmigrowano: {totalMigrated} rekordów</p>
                  {totalFailed > 0 && (
                    <p className="text-red-500">
                      Nie udało się zmigrować: {totalFailed} rekordów
                    </p>
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  {entities.map((entity) => {
                    const result = results[entity.name] || { successful: 0, failed: 0 };
                    return (
                      <div key={entity.name} className="flex justify-between text-sm">
                        <span>{entity.label}:</span>
                        <span>
                          {result.successful} OK
                          {result.failed > 0 && (
                            <span className="text-red-500 ml-2">
                              {result.failed} błędów
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">
                Rozpocznij migrację, aby przenieść wszystkie lokalne dane do
                Supabase.
              </p>
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Uwaga
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Proces migracji może potrwać kilka chwil. Upewnij się, że
                        masz stabilne połączenie z internetem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isMigrating && Object.keys(results).length === 0 && (
            <Button
              type="button"
              onClick={handleMigration}
              disabled={isMigrating}
            >
              Rozpocznij migrację
            </Button>
          )}
          {!isMigrating && Object.keys(results).length > 0 && (
            <Button type="button" onClick={onClose}>
              Zamknij
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
