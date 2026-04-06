import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, TrendingUp, Clock, AlertTriangle, Target, Zap, FileText, Send, Loader2, BarChart3, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AIDashboard = () => {
  usePageTitle("AI Dashboard");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [prompt, setPrompt] = useState("");

  // Mock AI predictions
  const predictions = [
    { event: "Gala Medialna 2026", predicted: 342, confidence: 87, trend: "up" },
    { event: "Tech Press Summit", predicted: 189, confidence: 73, trend: "up" },
    { event: "Film Festival Press Day", predicted: 567, confidence: 91, trend: "stable" },
  ];

  const anomalies = [
    { time: "14:23", type: "Nietypowy wzorzec", desc: "50+ skanów w 2 minuty z jednego urządzenia", severity: "high" },
    { time: "15:01", type: "Duplikat QR", desc: "Kod QR użyty 3 razy na różnych wejściach", severity: "medium" },
    { time: "16:45", type: "Geograficzna anomalia", desc: "Login z nowego kraju: DE → US w 30 min", severity: "low" },
  ];

  const smartSchedule = [
    { day: "Poniedziałek", time: "10:00", openRate: 34, score: 72 },
    { day: "Wtorek", time: "09:00", openRate: 42, score: 88 },
    { day: "Środa", time: "11:00", openRate: 38, score: 79 },
    { day: "Czwartek", time: "10:30", openRate: 45, score: 94 },
    { day: "Piątek", time: "14:00", openRate: 29, score: 58 },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-support-chat", {
        body: { message: `Wygeneruj opis wydarzenia: ${prompt}`, context: "content_generation" },
      });
      if (error) throw error;
      setGeneratedContent(data?.reply || "Wygenerowany opis wydarzenia na podstawie podanych parametrów...");
      toast.success("Treść wygenerowana");
    } catch {
      setGeneratedContent(`# ${prompt}\n\nPrzygotuj się na wyjątkowe doświadczenie! To wydarzenie łączy w sobie innowację, networking i inspirację. Dołącz do grona wybitnych specjalistów z branży.\n\n## Agenda\n- Keynote speech od lidera branży\n- Panel dyskusyjny\n- Sesje networkingowe\n- Wieczorna gala\n\n## Dla kogo?\nDla dziennikarzy, redaktorów i przedstawicieli mediów zainteresowanych najnowszymi trendami.`);
      toast.success("Treść wygenerowana (demo)");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" /> AI Dashboard
        </h1>
        <p className="text-muted-foreground">Inteligentne narzędzia automatyzacji i analizy</p>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions"><TrendingUp className="h-4 w-4 mr-1" /> Prognozy</TabsTrigger>
          <TabsTrigger value="scheduling"><Clock className="h-4 w-4 mr-1" /> Smart Scheduling</TabsTrigger>
          <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" /> Generator treści</TabsTrigger>
          <TabsTrigger value="anomalies"><Shield className="h-4 w-4 mr-1" /> Anomalie</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Attendance</CardTitle>
              <CardDescription>Prognozowana frekwencja na podstawie historii i trendów</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Target className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{p.event}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold">{p.predicted}</span>
                        <span className="text-sm text-muted-foreground">prognozowanych uczestników</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={p.confidence} className="flex-1" />
                        <span className="text-sm font-medium">{p.confidence}%</span>
                      </div>
                    </div>
                    <Badge variant={p.trend === "up" ? "default" : "secondary"}>
                      {p.trend === "up" ? "↑ Rosnący" : "→ Stabilny"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle>Optymalny czas wysyłki</CardTitle>
              <CardDescription>AI analizuje historię otwierania e-maili i dobiera najlepszy czas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {smartSchedule.sort((a, b) => b.score - a.score).map((s, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 border rounded-lg ${i === 0 ? "border-primary bg-primary/5" : ""}`}>
                    <Clock className={`h-6 w-6 shrink-0 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="font-medium">{s.day} o {s.time}</p>
                      <p className="text-sm text-muted-foreground">Open rate: {s.openRate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{s.score}</p>
                      <p className="text-xs text-muted-foreground">wynik AI</p>
                    </div>
                    {i === 0 && <Badge className="bg-primary"><Sparkles className="h-3 w-3 mr-1" /> Rekomendacja</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> AI Content Generator</CardTitle>
              <CardDescription>Automatycznie generuj opisy wydarzeń i press releases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Opisz wydarzenie, np.: Gala medialna dla 200 dziennikarzy branży tech w Warszawie..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
              />
              <Button onClick={handleGenerate} disabled={generating || !prompt.trim()}>
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Generuj treść
              </Button>
              {generatedContent && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => { navigator.clipboard.writeText(generatedContent); toast.success("Skopiowano"); }}>
                    Kopiuj
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Wykrywanie anomalii</CardTitle>
              <CardDescription>AI monitoruje wzorce check-in i wykrywa nietypowe aktywności</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {anomalies.map((a, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 border rounded-lg ${a.severity === "high" ? "border-destructive/50 bg-destructive/5" : a.severity === "medium" ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20" : ""}`}>
                    <AlertTriangle className={`h-5 w-5 shrink-0 ${a.severity === "high" ? "text-destructive" : a.severity === "medium" ? "text-yellow-500" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="font-medium">{a.type}</p>
                      <p className="text-sm text-muted-foreground">{a.desc}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={a.severity === "high" ? "destructive" : a.severity === "medium" ? "secondary" : "outline"}>
                        {a.severity === "high" ? "Wysoki" : a.severity === "medium" ? "Średni" : "Niski"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIDashboard;
