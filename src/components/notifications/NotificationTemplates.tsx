
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { NotificationTemplate, NotificationType } from "@/types/notifications";
import { toast } from "sonner";
import { Clock, Edit, FilePlus, Star, Trash } from "lucide-react";

interface NotificationTemplatesProps {
  eventId?: string;
  onSelectTemplate?: (template: NotificationTemplate) => void;
}

const NotificationTemplates = ({ eventId, onSelectTemplate }: NotificationTemplatesProps) => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      name: "Przypomnienie o wydarzeniu",
      type: "reminder",
      title: "Przypominamy o nadchodzącym wydarzeniu",
      message: "Dzień dobry, przypominamy o wydarzeniu {eventName}, które odbędzie się {eventDate} o godzinie {eventTime}. Prosimy o przygotowanie kodu QR z zaproszenia.",
      isDefault: true,
      lastUsed: new Date(2023, 4, 15),
    },
    {
      id: "2",
      name: "Aktualizacja informacji",
      type: "update",
      title: "Ważna aktualizacja - {eventName}",
      message: "Szanowni Państwo, informujemy o zmianie w szczegółach wydarzenia {eventName}. {updateDetails}",
      lastUsed: new Date(2023, 3, 25),
    },
    {
      id: "3",
      name: "Podziękowanie za udział",
      type: "custom",
      title: "Dziękujemy za udział w {eventName}",
      message: "Dziękujemy za udział w wydarzeniu {eventName}. Będziemy wdzięczni za wypełnienie krótkiej ankiety oceniającej: {surveyLink}",
    },
  ]);

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (editingTemplate.id) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      toast.success("Szablon został zaktualizowany");
    } else {
      // Add new template
      const newTemplate = {
        ...editingTemplate,
        id: Date.now().toString(),
      };
      setTemplates([...templates, newTemplate]);
      toast.success("Nowy szablon został utworzony");
    }
    setIsDialogOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten szablon?")) {
      setTemplates(templates.filter(t => t.id !== id));
      toast.success("Szablon został usunięty");
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate({
      id: "",
      name: "",
      type: "reminder",
      title: "",
      message: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate({...template});
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Szablony powiadomień</h3>
        <Button onClick={handleCreateTemplate} variant="outline" size="sm">
          <FilePlus className="h-4 w-4 mr-2" />
          Nowy szablon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-base flex items-center">
                  {template.isDefault && <Star className="h-4 w-4 text-amber-500 mr-1" />}
                  {template.name}
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
                  {template.type === "reminder" && "Przypomnienie"}
                  {template.type === "update" && "Aktualizacja"}
                  {template.type === "cancellation" && "Odwołanie"}
                  {template.type === "custom" && "Niestandardowe"}
                </div>
              </div>
              <CardDescription className="line-clamp-1">{template.title}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground line-clamp-3">{template.message}</p>
              {template.lastUsed && (
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Ostatnio użyto: {template.lastUsed.toLocaleDateString()}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditTemplate(template)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edytuj
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                  disabled={template.isDefault}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                {onSelectTemplate && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Użyj
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? "Edytuj szablon powiadomienia" : "Nowy szablon powiadomienia"}
            </DialogTitle>
            <DialogDescription>
              Wypełnij poniższe pola, aby utworzyć lub zaktualizować szablon.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa szablonu</Label>
              <Input
                id="name"
                value={editingTemplate?.name || ""}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="Np. Przypomnienie o wydarzeniu"
              />
            </div>

            <div className="space-y-2">
              <Label>Typ powiadomienia</Label>
              <RadioGroup 
                value={editingTemplate?.type} 
                onValueChange={(value) => setEditingTemplate(prev => 
                  prev ? {...prev, type: value as NotificationType} : null
                )}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reminder" id="reminder" />
                  <Label htmlFor="reminder">Przypomnienie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="update" id="update" />
                  <Label htmlFor="update">Aktualizacja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cancellation" id="cancellation" />
                  <Label htmlFor="cancellation">Odwołanie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Niestandardowe</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tytuł wiadomości</Label>
              <Input
                id="title"
                value={editingTemplate?.title || ""}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, title: e.target.value} : null)}
                placeholder="Np. Przypomnienie o nadchodzącym wydarzeniu"
              />
              <p className="text-xs text-muted-foreground">
                Możesz użyć zmiennych: {"{eventName}"}, {"{eventDate}"}, {"{eventTime}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Treść wiadomości</Label>
              <Textarea
                id="message"
                rows={5}
                value={editingTemplate?.message || ""}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, message: e.target.value} : null)}
                placeholder="Treść powiadomienia..."
              />
              <p className="text-xs text-muted-foreground">
                Możesz użyć zmiennych: {"{eventName}"}, {"{eventDate}"}, {"{eventTime}"}, {"{guestName}"}, {"{location}"}, {"{updateDetails}"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleSaveTemplate}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationTemplates;
