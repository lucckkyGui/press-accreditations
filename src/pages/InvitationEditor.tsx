
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Send, Eye, Download } from "lucide-react";
import { toast } from "sonner";

const InvitationEditor = () => {
  const [subject, setSubject] = useState("Zaproszenie na Event XYZ");
  const [content, setContent] = useState(
    `Szanowni Państwo,

Z przyjemnością zapraszamy na Event XYZ, który odbędzie się dnia 25.05.2025 o godzinie 18:00 w Hotelu ABC w Warszawie.

Prosimy o potwierdzenie przybycia poprzez kliknięcie w przycisk poniżej.

Z poważaniem,
Zespół Organizacyjny`
  );
  
  const [invitationTemplate, setInvitationTemplate] = useState("template1");
  const [brandColor, setBrandColor] = useState("#1EAEDB");

  const handleSendTest = () => {
    toast.success("Wysłano testowe zaproszenie na adres organizatora");
  };

  const handleSave = () => {
    toast.success("Zapisano szablon zaproszenia");
  };

  const handleExport = () => {
    toast.success("Wyeksportowano szablon zaproszenia");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edytor zaproszeń</h1>
          <p className="text-muted-foreground">
            Personalizuj treść i wygląd zaproszeń dla gości.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Temat wiadomości</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Wpisz temat wiadomości"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Treść zaproszenia</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Wpisz treść zaproszenia"
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Branding i personalizacja</h3>

                  <div className="space-y-2">
                    <Label htmlFor="brandColor">Kolor główny</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="brandColor"
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <span className="text-sm text-muted-foreground">{brandColor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Szablon zaproszenia</Label>
                    <Tabs defaultValue="template1" value={invitationTemplate} onValueChange={setInvitationTemplate}>
                      <TabsList className="grid grid-cols-3 mb-2">
                        <TabsTrigger value="template1">Podstawowy</TabsTrigger>
                        <TabsTrigger value="template2">Klasyczny</TabsTrigger>
                        <TabsTrigger value="template3">Minimalistyczny</TabsTrigger>
                      </TabsList>
                      <TabsContent value="template1" className="p-2 border rounded-md">
                        <div className="h-20 flex items-center justify-center text-center">
                          Szablon Podstawowy - nagłówek, treść, przycisk, stopka
                        </div>
                      </TabsContent>
                      <TabsContent value="template2" className="p-2 border rounded-md">
                        <div className="h-20 flex items-center justify-center text-center">
                          Szablon Klasyczny - z tłem i ozdobnikami
                        </div>
                      </TabsContent>
                      <TabsContent value="template3" className="p-2 border rounded-md">
                        <div className="h-20 flex items-center justify-center text-center">
                          Szablon Minimalistyczny - prosty i elegancki
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button onClick={handleSave} className="gap-2">
                Zapisz szablon
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Eksportuj
                </Button>
                <Button variant="outline" onClick={handleSendTest} className="gap-2">
                  <Send className="h-4 w-4" />
                  Wyślij testową wiadomość
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Podgląd zaproszenia</h3>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Eye className="h-4 w-4" />
                    Pełny podgląd
                  </Button>
                </div>
                <Separator />

                <div className="p-4 border rounded-md shadow-sm overflow-hidden">
                  <div 
                    className="p-6 bg-white rounded-md"
                    style={{ 
                      borderTop: `5px solid ${brandColor}`,
                      fontFamily: invitationTemplate === "template3" ? "Arial, sans-serif" : "inherit"
                    }}
                  >
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1" style={{ color: brandColor }}>
                          {subject}
                        </h2>
                        <p className="text-gray-500 text-sm">Od: Organizator &lt;organizator@example.com&gt;</p>
                        <p className="text-gray-500 text-sm">Do: {`{Imię i Nazwisko} <{Email}>`}</p>
                      </div>
                      
                      <div className="whitespace-pre-wrap">
                        {content.split('\n').map((line, i) => (
                          <p key={i} className="my-2">
                            {line}
                          </p>
                        ))}
                      </div>
                      
                      <div className="text-center pt-4">
                        <button 
                          style={{ 
                            backgroundColor: brandColor,
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Potwierdzam udział
                        </button>
                      </div>
                      
                      <div className="text-center text-gray-400 text-sm pt-6">
                        <p>Jeśli masz problemy z wyświetlaniem tej wiadomości, kliknij <a href="#" style={{ color: brandColor }}>tutaj</a>.</p>
                        <p>© 2025 GateFlow. Wszystkie prawa zastrzeżone.</p>
                      </div>
                      
                      <div className="pt-4 text-center">
                        <img 
                          src="https://via.placeholder.com/150x50?text=Logo" 
                          alt="Logo" 
                          style={{ 
                            maxWidth: '150px', 
                            margin: '0 auto' 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default InvitationEditor;
