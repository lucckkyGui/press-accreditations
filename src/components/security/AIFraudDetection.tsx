
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface FraudAlert {
  id: string;
  guestId: string;
  guestName: string;
  riskScore: number;
  reasons: string[];
  timestamp: Date;
  status: 'pending' | 'resolved' | 'false_positive';
}

const AIFraudDetection: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([
    {
      id: '1',
      guestId: 'guest-123',
      guestName: 'Jan Kowalski',
      riskScore: 85,
      reasons: [
        'Duplikacja danych osobowych z innym kontem',
        'Nietypowy wzorzec zgłoszeń w krótkim czasie',
        'Email z domeny tymczasowej'
      ],
      timestamp: new Date(),
      status: 'pending'
    },
    {
      id: '2',
      guestId: 'guest-456',
      guestName: 'Anna Nowak',
      riskScore: 72,
      reasons: [
        'Zgłoszenie z VPN/Proxy',
        'Brak historii poprzednich wydarzeń',
        'Podejrzane metadane urządzenia'
      ],
      timestamp: new Date(Date.now() - 3600000),
      status: 'pending'
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Symulacja analizy AI
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('Analiza AI zakończona - wykryto 2 potencjalne zagrożenia');
    }, 3000);
  };

  const handleAlertAction = (alertId: string, action: 'approve' | 'block' | 'false_positive') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'approve' ? 'resolved' : 'false_positive' }
        : alert
    ));

    const actionText = {
      approve: 'zatwierdzono',
      block: 'zablokowano',
      false_positive: 'oznaczono jako fałszywy alarm'
    };

    toast.success(`Alert ${actionText[action]}`);
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'secondary';
    return 'default';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Wysokie ryzyko';
    if (score >= 60) return 'Średnie ryzyko';
    return 'Niskie ryzyko';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Fraud Detection</h2>
        <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
          <Shield className="h-4 w-4 mr-2" />
          {isAnalyzing ? 'Analizowanie...' : 'Uruchom analizę AI'}
        </Button>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alerty aktywne</p>
                <p className="text-2xl font-bold">{alerts.filter(a => a.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monitorowane konta</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dokładność AI</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zablokowane próby</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista alertów */}
      <Card>
        <CardHeader>
          <CardTitle>Alerty bezpieczeństwa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.filter(alert => alert.status === 'pending').map((alert) => (
            <Alert key={alert.id} className="border-l-4 border-l-orange-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{alert.guestName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {alert.timestamp.toLocaleString('pl-PL')}
                      </p>
                    </div>
                    <Badge variant={getRiskBadgeVariant(alert.riskScore)}>
                      {getRiskLabel(alert.riskScore)} ({alert.riskScore}%)
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Wykryte problemy:</p>
                    <ul className="text-sm space-y-1">
                      {alert.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-orange-500 rounded-full" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleAlertAction(alert.id, 'approve')}
                    >
                      Zatwierdź
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleAlertAction(alert.id, 'block')}
                    >
                      Zablokuj
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAlertAction(alert.id, 'false_positive')}
                    >
                      Fałszywy alarm
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
          
          {alerts.filter(alert => alert.status === 'pending').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Brak aktywnych alertów bezpieczeństwa</p>
              <p className="text-sm">System AI monitoruje wszystkie rejestracje</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFraudDetection;
