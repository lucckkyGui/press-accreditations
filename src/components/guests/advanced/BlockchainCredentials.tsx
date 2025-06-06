
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { QrCode, Shield, Check, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BlockchainCredential {
  id: string;
  guestName: string;
  eventName: string;
  credentialHash: string;
  blockchainTxId: string;
  issuedAt: Date;
  verificationUrl: string;
  status: 'issued' | 'verified' | 'revoked';
}

const BlockchainCredentials: React.FC = () => {
  const [credentials, setCredentials] = useState<BlockchainCredential[]>([
    {
      id: 'cred-001',
      guestName: 'Anna Kowalska',
      eventName: 'Tech Conference 2024',
      credentialHash: '0x1a2b3c4d5e6f7890abcdef1234567890',
      blockchainTxId: '0xabcdef1234567890123456789abcdef0123456789',
      issuedAt: new Date(),
      verificationUrl: 'https://verify.accreditation.com/cred-001',
      status: 'issued'
    },
    {
      id: 'cred-002',
      guestName: 'Jan Nowak',
      eventName: 'Business Forum 2024',
      credentialHash: '0x9876543210fedcba0987654321fedcba',
      blockchainTxId: '0x9876543210abcdef9876543210abcdef98765432',
      issuedAt: new Date(Date.now() - 86400000),
      verificationUrl: 'https://verify.accreditation.com/cred-002',
      status: 'verified'
    }
  ]);

  const [verificationHash, setVerificationHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  const issueNewCredential = async () => {
    setIsIssuing(true);
    
    // Symulacja procesu blockchain
    setTimeout(() => {
      const newCredential: BlockchainCredential = {
        id: `cred-${Date.now()}`,
        guestName: 'Nowy Gość',
        eventName: 'Nowe Wydarzenie',
        credentialHash: `0x${Math.random().toString(16).substr(2, 32)}`,
        blockchainTxId: `0x${Math.random().toString(16).substr(2, 40)}`,
        issuedAt: new Date(),
        verificationUrl: `https://verify.accreditation.com/cred-${Date.now()}`,
        status: 'issued'
      };
      
      setCredentials(prev => [newCredential, ...prev]);
      setIsIssuing(false);
      toast.success('Akredytacja blockchain została wystawiona!');
    }, 3000);
  };

  const verifyCredential = async () => {
    if (!verificationHash) {
      toast.error('Wprowadź hash do weryfikacji');
      return;
    }

    setIsVerifying(true);
    
    // Symulacja weryfikacji blockchain
    setTimeout(() => {
      const isValid = Math.random() > 0.2; // 80% szans na prawidłową weryfikację
      
      if (isValid) {
        toast.success('Akredytacja została zweryfikowana w blockchain!');
        // Oznacz jako zweryfikowaną
        setCredentials(prev => 
          prev.map(cred => 
            cred.credentialHash === verificationHash 
              ? { ...cred, status: 'verified' as const }
              : cred
          )
        );
      } else {
        toast.error('Akredytacja nie została znaleziona lub jest nieprawidłowa');
      }
      
      setIsVerifying(false);
      setVerificationHash('');
    }, 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} skopiowany do schowka`);
  };

  const getStatusBadge = (status: BlockchainCredential['status']) => {
    switch (status) {
      case 'issued':
        return <Badge variant="secondary">Wystawiona</Badge>;
      case 'verified':
        return <Badge variant="default">Zweryfikowana</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Unieważniona</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blockchain Credentials</h2>
        <Button onClick={issueNewCredential} disabled={isIssuing}>
          <Shield className="h-4 w-4 mr-2" />
          {isIssuing ? 'Wystawianie...' : 'Wystaw nową akredytację'}
        </Button>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Łączne akredytacje</p>
                <p className="text-2xl font-bold">{credentials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zweryfikowane</p>
                <p className="text-2xl font-bold">
                  {credentials.filter(c => c.status === 'verified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <QrCode className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oczekujące</p>
                <p className="text-2xl font-bold">
                  {credentials.filter(c => c.status === 'issued').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ExternalLink className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blockchain</p>
                <p className="text-sm font-medium">Ethereum</p>
                <p className="text-xs text-muted-foreground">Mainnet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weryfikacja */}
      <Card>
        <CardHeader>
          <CardTitle>Weryfikacja akredytacji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Wprowadź hash akredytacji do weryfikacji..."
              value={verificationHash}
              onChange={(e) => setVerificationHash(e.target.value)}
              className="flex-1"
            />
            <Button onClick={verifyCredential} disabled={isVerifying}>
              {isVerifying ? 'Weryfikowanie...' : 'Weryfikuj'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Wprowadź hash akredytacji aby zweryfikować jej autentyczność w blockchain
          </p>
        </CardContent>
      </Card>

      {/* Lista akredytacji */}
      <Card>
        <CardHeader>
          <CardTitle>Wystawione akredytacje blockchain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {credentials.map((credential) => (
            <div key={credential.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{credential.guestName}</h4>
                  <p className="text-sm text-muted-foreground">{credential.eventName}</p>
                  <p className="text-xs text-muted-foreground">
                    Wystawiono: {credential.issuedAt.toLocaleString('pl-PL')}
                  </p>
                </div>
                {getStatusBadge(credential.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Hash:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                    {credential.credentialHash}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credential.credentialHash, 'Hash')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">TX ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                    {credential.blockchainTxId}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credential.blockchainTxId, 'Transaction ID')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Weryfikacja:</span>
                  <a 
                    href={credential.verificationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex-1"
                  >
                    {credential.verificationUrl}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(credential.verificationUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Informacje o blockchain */}
      <Card>
        <CardHeader>
          <CardTitle>Informacje o technologii blockchain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">• Akredytacje są przechowywane w rozproszonej sieci blockchain</p>
          <p className="text-sm">• Każda akredytacja ma unikalny hash niemożliwy do sfałszowania</p>
          <p className="text-sm">• Weryfikacja odbywa się w czasie rzeczywistym poprzez sieć węzłów</p>
          <p className="text-sm">• Historia wszystkich transakcji jest publicznie dostępna i niemożliwa do modyfikacji</p>
          <p className="text-sm">• Smart contract automatycznie zarządza cyklem życia akredytacji</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainCredentials;
