
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Download, Eye, File, Image, Layout, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import InvitationTemplates, { TemplateType } from "@/components/invitations/InvitationTemplates";

const InvitationEditor = () => {
  const [subject, setSubject] = useState("Zaproszenie na Event XYZ");
  const [content, setContent] = useState(
    `Szanowni Państwo,

Z przyjemnością zapraszamy na Event XYZ, który odbędzie się dnia 25.05.2025 o godzinie 18:00 w Hotelu ABC w Warszawie.

Prosimy o potwierdzenie przybycia poprzez kliknięcie w przycisk poniżej.

Z poważaniem,
Zespół Organizacyjny`
  );
  
  const [invitationTemplate, setInvitationTemplate] = useState<TemplateType>("basic");
  const [brandColor, setBrandColor] = useState("#1EAEDB");
  const [activeTab, setActiveTab] = useState("content");
  const [logoUrl, setLogoUrl] = useState("https://via.placeholder.com/150x50?text=Logo");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const handleSendTest = () => {
    if (!testEmail) {
      toast.error("Wprowadź adres email do wysyłki testowej");
      return;
    }
    toast.success(`Wysłano testowe zaproszenie na adres ${testEmail}`);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edytor zaproszeń</h1>
            <p className="text-muted-foreground">
              Personalizuj treść i wygląd zaproszeń dla gości.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Eksportuj
            </Button>
            <Button variant="outline" onClick={() => setShowFullPreview(true)} className="gap-2">
              <Eye className="h-4 w-4" />
              Podgląd
            </Button>
            <Button onClick={handleSave}>
              Zapisz
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full border-b rounded-none justify-start">
            <TabsTrigger value="content" className="gap-2">
              <File className="h-4 w-4" />
              Treść
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <Layout className="h-4 w-4" />
              Szablon
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Image className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <Mail className="h-4 w-4" />
              Test
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <TabsContent value="content" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Treść zaproszenia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        className="min-h-[300px]"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-2">Dostępne zmienne:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-muted text-xs px-2 py-1 rounded">{"{firstName}"}</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded">{"{lastName}"}</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded">{"{email}"}</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded">{"{eventName}"}</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded">{"{eventDate}"}</span>
                        <span className="bg-muted text-xs px-2 py-1 rounded">{"{eventLocation}"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="template" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Wybierz szablon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InvitationTemplates 
                      selectedTemplate={invitationTemplate}
                      onSelectTemplate={setInvitationTemplate}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="branding" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding i personalizacja</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      <Label htmlFor="logoUrl">URL Logo (opcjonalnie)</Label>
                      <Input
                        id="logoUrl"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <p className="text-sm font-medium mb-2">Podgląd logo</p>
                      <div className="flex justify-center border p-4 bg-white">
                        <img 
                          src={logoUrl} 
                          alt="Logo" 
                          className="max-h-20 max-w-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/150x50?text=Invalid+Image";
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="test" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Wyślij testowe zaproszenie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="testEmail">Adres email</Label>
                      <Input
                        id="testEmail"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="twoj@email.com"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSendTest} 
                      className="gap-2 w-full"
                    >
                      <Send className="h-4 w-4" />
                      Wyślij testową wiadomość
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            <Card className="lg:sticky lg:top-24 self-start">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Podgląd zaproszenia</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowFullPreview(true)}>
                    <Eye className="h-4 w-4" />
                    Pełny podgląd
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="p-4 border rounded-md shadow-sm overflow-hidden">
                  <div 
                    className="p-6 bg-white rounded-md"
                    style={{ 
                      borderTop: invitationTemplate !== "minimal" ? `5px solid ${brandColor}` : undefined,
                      fontFamily: invitationTemplate === "minimal" ? "Arial, sans-serif" : 
                                 invitationTemplate === "elegant" ? "Georgia, serif" : 
                                 invitationTemplate === "corporate" ? "Helvetica, Arial, sans-serif" : 
                                 "inherit"
                    }}
                  >
                    <div className="space-y-6">
                      {invitationTemplate === "elegant" && (
                        <div 
                          className="h-1 w-32 mx-auto mb-4"
                          style={{ backgroundColor: brandColor }}
                        />
                      )}
                      
                      {(invitationTemplate === "basic" || invitationTemplate === "corporate") && (
                        <div className="text-center mb-4">
                          <img 
                            src={logoUrl} 
                            alt="Logo" 
                            className="max-h-16 mx-auto" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/150x50?text=Logo";
                            }}
                          />
                        </div>
                      )}
                      
                      <div>
                        <h2 
                          className={`text-xl font-bold mb-1 ${
                            invitationTemplate === "minimal" ? "" : 
                            invitationTemplate === "elegant" ? "text-center font-serif" : 
                            invitationTemplate === "casual" ? "text-2xl" : ""
                          }`} 
                          style={{ color: brandColor }}
                        >
                          {subject}
                        </h2>
                        <p className="text-gray-500 text-sm">Od: Organizator &lt;organizator@example.com&gt;</p>
                        <p className="text-gray-500 text-sm">Do: {`{Imię i Nazwisko} <{Email}>`}</p>
                      </div>
                      
                      <div className={`whitespace-pre-wrap ${
                        invitationTemplate === "elegant" ? "text-center" : ""
                      }`}>
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
                            borderRadius: invitationTemplate === "minimal" ? '0' : '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          {invitationTemplate === "casual" ? "Jasne, będę!" : "Potwierdzam udział"}
                        </button>
                      </div>
                      
                      <div className="text-center text-gray-400 text-sm pt-6">
                        <p>Jeśli masz problemy z wyświetlaniem tej wiadomości, kliknij <a href="#" style={{ color: brandColor }}>tutaj</a>.</p>
                        <p>© 2025 GateFlow. Wszystkie prawa zastrzeżone.</p>
                      </div>
                      
                      {(invitationTemplate === "minimal" || invitationTemplate === "elegant" || invitationTemplate === "casual") && (
                        <div className="pt-4 text-center">
                          <img 
                            src={logoUrl} 
                            alt="Logo" 
                            style={{ 
                              maxWidth: '150px', 
                              margin: '0 auto',
                              opacity: invitationTemplate === "minimal" ? 0.7 : 1
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
      
      {/* Dialog z pełnym podglądem */}
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Pełny podgląd zaproszenia</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto p-4 border rounded-md">
            <div 
              className="p-6 bg-white rounded-md"
              style={{ 
                borderTop: invitationTemplate !== "minimal" ? `5px solid ${brandColor}` : undefined,
                fontFamily: invitationTemplate === "minimal" ? "Arial, sans-serif" : 
                           invitationTemplate === "elegant" ? "Georgia, serif" : 
                           invitationTemplate === "corporate" ? "Helvetica, Arial, sans-serif" : 
                           "inherit"
              }}
            >
              <div className="space-y-6">
                {/* Taki sam kod jak w podglądzie */}
                {invitationTemplate === "elegant" && (
                  <div 
                    className="h-1 w-32 mx-auto mb-4"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
                
                {(invitationTemplate === "basic" || invitationTemplate === "corporate") && (
                  <div className="text-center mb-4">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="max-h-16 mx-auto" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/150x50?text=Logo";
                      }}
                    />
                  </div>
                )}
                
                <div>
                  <h2 
                    className={`text-xl font-bold mb-1 ${
                      invitationTemplate === "minimal" ? "" : 
                      invitationTemplate === "elegant" ? "text-center font-serif" : 
                      invitationTemplate === "casual" ? "text-2xl" : ""
                    }`} 
                    style={{ color: brandColor }}
                  >
                    {subject}
                  </h2>
                  <p className="text-gray-500 text-sm">Od: Organizator &lt;organizator@example.com&gt;</p>
                  <p className="text-gray-500 text-sm">Do: Jan Kowalski &lt;jan.kowalski@example.com&gt;</p>
                </div>
                
                <div className={`whitespace-pre-wrap ${
                  invitationTemplate === "elegant" ? "text-center" : ""
                }`}>
                  {content.split('\n').map((line, i) => (
                    <p key={i} className="my-2">
                      {line.replace(/{firstName}/g, "Jan").replace(/{lastName}/g, "Kowalski")}
                    </p>
                  ))}
                </div>
                
                <div className="text-center pt-4">
                  <button 
                    style={{ 
                      backgroundColor: brandColor,
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: invitationTemplate === "minimal" ? '0' : '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {invitationTemplate === "casual" ? "Jasne, będę!" : "Potwierdzam udział"}
                  </button>
                </div>
                
                <div className="text-center text-gray-400 text-sm pt-6">
                  <p>Jeśli masz problemy z wyświetlaniem tej wiadomości, kliknij <a href="#" style={{ color: brandColor }}>tutaj</a>.</p>
                  <p>© 2025 GateFlow. Wszystkie prawa zastrzeżone.</p>
                </div>
                
                {(invitationTemplate === "minimal" || invitationTemplate === "elegant" || invitationTemplate === "casual") && (
                  <div className="pt-4 text-center">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      style={{ 
                        maxWidth: '150px', 
                        margin: '0 auto',
                        opacity: invitationTemplate === "minimal" ? 0.7 : 1
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setShowFullPreview(false)}>Zamknij</Button>
            <Button className="gap-2" onClick={() => toast.success("Zaproszenie przygotowane do wysłania")}>
              <Check className="h-4 w-4" /> Wygląda dobrze
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default InvitationEditor;
