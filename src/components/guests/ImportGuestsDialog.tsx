
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ImportGuestsDialogProps {
  onImport: (guests: any[]) => void;
}

const ImportGuestsDialog = ({ onImport }: ImportGuestsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("csv");
  const [csvContent, setCsvContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [defaultZone, setDefaultZone] = useState<string>("general");

  const handleImport = () => {
    // W rzeczywistej aplikacji tutaj byłoby parsowanie CSV i walidacja
    
    // Dla MVP symulujemy import kilku gości
    const mockImportedGuests = [
      {
        id: Math.random().toString(36).substr(2, 9),
        firstName: "Jan",
        lastName: "Kowalski",
        email: "jan.kowalski@example.com",
        company: "ABC Corp",
        zone: defaultZone,
        status: "invited"
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        firstName: "Anna",
        lastName: "Nowak",
        email: "anna.nowak@example.com",
        company: "XYZ Media",
        zone: defaultZone,
        status: "invited"
      },
    ];
    
    onImport(mockImportedGuests);
    setOpen(false);
    setCsvContent("");
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Importuj gości</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Importuj listę gości</DialogTitle>
          <DialogDescription>
            Dodaj wiele osób na raz importując listę z pliku CSV lub wprowadzając dane ręcznie.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">Plik CSV</TabsTrigger>
            <TabsTrigger value="manual">Wprowadź ręcznie</TabsTrigger>
          </TabsList>
          <TabsContent value="csv" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Wybierz plik CSV</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Format: imię, nazwisko, email, firma (opcjonalnie)
              </p>
            </div>
          </TabsContent>
          <TabsContent value="manual" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-content">Wprowadź dane</Label>
              <Textarea
                id="csv-content"
                placeholder="Jan,Kowalski,jan.kowalski@example.com,ABC Corp"
                className="min-h-[150px]"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Każda osoba w nowej linii. Format: imię, nazwisko, email, firma (opcjonalnie)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="default-zone">Domyślna strefa</Label>
          <Select value={defaultZone} onValueChange={setDefaultZone}>
            <SelectTrigger id="default-zone">
              <SelectValue placeholder="Wybierz strefę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Ogólna</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="press">Press</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handleImport}>Importuj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportGuestsDialog;
