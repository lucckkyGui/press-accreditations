
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Eye, Save, Plus, Edit, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'invitation' | 'reminder' | 'confirmation' | 'custom';
  isDefault: boolean;
  variables: string[];
}

interface EmailTemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSave: (template: EmailTemplate) => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  open,
  onOpenChange,
  onTemplateSave
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 'default-invitation',
      name: 'Standardowe zaproszenie',
      subject: 'Zaproszenie na wydarzenie {{eventName}}',
      content: `
Szanowny/-a {{firstName}} {{lastName}},

Mamy przyjemność zaprosić Cię na wydarzenie "{{eventName}}", które odbędzie się {{eventDate}} w {{eventLocation}}.

Twoje dane akredytacyjne:
- Imię i nazwisko: {{firstName}} {{lastName}}
- Email: {{email}}
- Firma: {{company}}
- Strefa dostępu: {{zone}}

Aby wziąć udział w wydarzeniu, przedstaw poniższy kod QR przy wejściu:

{{qrCode}}

W przypadku pytań, skontaktuj się z nami pod adresem {{contactEmail}}.

Z poważaniem,
Zespół organizacyjny
      `,
      type: 'invitation',
      isDefault: true,
      variables: ['firstName', 'lastName', 'email', 'company', 'zone', 'eventName', 'eventDate', 'eventLocation', 'qrCode', 'contactEmail']
    },
    {
      id: 'vip-invitation',
      name: 'Zaproszenie VIP',
      subject: 'Ekskluzywne zaproszenie VIP - {{eventName}}',
      content: `
Szanowny/-a {{firstName}} {{lastName}},

Z wielką przyjemnością zapraszamy Cię jako naszego Gościa VIP na ekskluzywne wydarzenie "{{eventName}}".

Szczegóły Wydarzenia:
📅 Data: {{eventDate}}
📍 Miejsce: {{eventLocation}}
🎫 Status: VIP Access

Twój kod QR (dostęp VIP):
{{qrCode}}

Jako Gość VIP masz dostęp do:
✓ Strefy VIP z exkluzywnymi miejscami
✓ Welcome drink i catering premium
✓ Priorytetu w rejestracji
✓ Dedykowanej obsługi

Czekamy na Ciebie!

Z wyrazami szacunku,
Zespół organizacyjny
      `,
      type: 'invitation',
      isDefault: false,
      variables: ['firstName', 'lastName', 'eventName', 'eventDate', 'eventLocation', 'qrCode']
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const availableVariables = [
    '{{firstName}}', '{{lastName}}', '{{email}}', '{{company}}', '{{phone}}', '{{pesel}}',
    '{{zone}}', '{{eventName}}', '{{eventDate}}', '{{eventLocation}}', '{{eventDescription}}',
    '{{qrCode}}', '{{contactEmail}}', '{{organizerName}}', '{{customMessage}}'
  ];

  const handleCreateTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name: 'Nowy szablon',
      subject: 'Nowy szablon emaila',
      content: 'Wprowadź treść szablonu...',
      type: 'custom',
      isDefault: false,
      variables: []
    };
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate({ ...template });
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    if (!selectedTemplate.name.trim() || !selectedTemplate.subject.trim() || !selectedTemplate.content.trim()) {
      toast.error('Wszystkie pola są wymagane');
      return;
    }

    // Zaktualizuj lub dodaj szablon
    const updatedTemplates = templates.some(t => t.id === selectedTemplate.id)
      ? templates.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
      : [...templates, selectedTemplate];

    setTemplates(updatedTemplates);
    onTemplateSave(selectedTemplate);
    setIsEditing(false);
    setSelectedTemplate(null);
    toast.success('Szablon został zapisany');
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast.error('Nie można usunąć szablonu domyślnego');
      return;
    }

    if (window.confirm('Czy na pewno chcesz usunąć ten szablon?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Szablon został usunięty');
    }
  };

  const insertVariable = (variable: string) => {
    if (!selectedTemplate) return;

    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = selectedTemplate.content;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      
      setSelectedTemplate({
        ...selectedTemplate,
        content: newContent
      });

      // Przywróć pozycję kursora
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const generatePreview = () => {
    if (!selectedTemplate) return selectedTemplate?.content || '';

    let preview = selectedTemplate.content;
    const sampleData = {
      '{{firstName}}': 'Jan',
      '{{lastName}}': 'Kowalski',
      '{{email}}': 'jan.kowalski@example.com',
      '{{company}}': 'ABC Corporation',
      '{{phone}}': '+48 123 456 789',
      '{{pesel}}': '80010112345',
      '{{zone}}': 'VIP',
      '{{eventName}}': 'Konferencja Tech 2024',
      '{{eventDate}}': '15 marca 2024, 10:00',
      '{{eventLocation}}': 'Centrum Kongresowe, Warszawa',
      '{{eventDescription}}': 'Największa konferencja technologiczna w Polsce',
      '{{qrCode}}': '[KOD QR BĘDZIE TUTAJ]',
      '{{contactEmail}}': 'kontakt@example.com',
      '{{organizerName}}': 'Zespół organizacyjny',
      '{{customMessage}}': 'Dodatkowa wiadomość od organizatora'
    };

    Object.entries(sampleData).forEach(([variable, value]) => {
      preview = preview.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Edytor szablonów email
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista szablonów */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Szablony</h3>
              <Button size="sm" onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-1" />
                Nowy
              </Button>
            </div>

            <div className="space-y-2">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.type}
                          </Badge>
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Domyślny
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {!template.isDefault && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Edytor szablonu */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTemplate ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {isEditing ? 'Edycja szablonu' : 'Podgląd szablonu'}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {previewMode ? 'Edytuj' : 'Podgląd'}
                    </Button>
                    {isEditing && (
                      <Button size="sm" onClick={handleSaveTemplate}>
                        <Save className="h-4 w-4 mr-1" />
                        Zapisz
                      </Button>
                    )}
                  </div>
                </div>

                {previewMode ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Podgląd emaila</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Temat:</Label>
                          <p className="text-sm bg-muted p-2 rounded mt-1">
                            {selectedTemplate.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                              const sampleData: Record<string, string> = {
                                eventName: 'Konferencja Tech 2024',
                                firstName: 'Jan',
                                lastName: 'Kowalski'
                              };
                              return sampleData[key] || match;
                            })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Treść:</Label>
                          <div className="text-sm bg-muted p-4 rounded mt-1 whitespace-pre-wrap">
                            {generatePreview()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template-name">Nazwa szablonu</Label>
                        <Input
                          id="template-name"
                          value={selectedTemplate.name}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            name: e.target.value
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-type">Typ szablonu</Label>
                        <Select
                          value={selectedTemplate.type}
                          onValueChange={(value: Error) => setSelectedTemplate({
                            ...selectedTemplate,
                            type: value
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="invitation">Zaproszenie</SelectItem>
                            <SelectItem value="reminder">Przypomnienie</SelectItem>
                            <SelectItem value="confirmation">Potwierdzenie</SelectItem>
                            <SelectItem value="custom">Własny</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="template-subject">Temat wiadomości</Label>
                      <Input
                        id="template-subject"
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          subject: e.target.value
                        })}
                        disabled={!isEditing}
                        placeholder="np. Zaproszenie na wydarzenie {{eventName}}"
                      />
                    </div>

                    <div>
                      <Label htmlFor="template-content">Treść wiadomości</Label>
                      <Textarea
                        id="template-content"
                        name="content"
                        value={selectedTemplate.content}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          content: e.target.value
                        })}
                        disabled={!isEditing}
                        rows={12}
                        placeholder="Wprowadź treść szablonu..."
                      />
                    </div>

                    {isEditing && (
                      <div>
                        <Label className="text-sm font-medium">Dostępne zmienne</Label>
                        <Alert className="mt-2">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Kliknij na zmienną, aby wstawić ją do treści wiadomości
                          </AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {availableVariables.map((variable) => (
                            <Button
                              key={variable}
                              size="sm"
                              variant="outline"
                              onClick={() => insertVariable(variable)}
                              className="text-xs"
                            >
                              {variable}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Wybierz szablon do edycji lub utwórz nowy
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateEditor;
