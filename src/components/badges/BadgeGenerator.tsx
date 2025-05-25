
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge, Download, QrCode, User } from 'lucide-react';
import { toast } from 'sonner';

interface BadgeGeneratorProps {
  registrationId: string;
  userInfo: {
    firstName: string;
    lastName: string;
    mediaOrganization: string;
    jobTitle: string;
  };
  eventInfo: {
    name: string;
    date: string;
    location: string;
  };
}

export default function BadgeGenerator({ registrationId, userInfo, eventInfo }: BadgeGeneratorProps) {
  const [badgeTemplate, setBadgeTemplate] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBadge, setGeneratedBadge] = useState<string | null>(null);

  const generateBadge = async () => {
    setIsGenerating(true);
    try {
      // Simulate badge generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate QR code data
      const qrData = JSON.stringify({
        registrationId,
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        organization: userInfo.mediaOrganization,
        eventId: 'event-123'
      });

      setGeneratedBadge(qrData);
      toast.success('Identyfikator został wygenerowany!');
    } catch (error) {
      toast.error('Błąd podczas generowania identyfikatora');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBadge = () => {
    if (!generatedBadge) return;
    
    // Simulate badge download
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw badge background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 600);
      
      // Draw border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 380, 580);
      
      // Draw header
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(10, 10, 380, 80);
      
      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(eventInfo.name, 200, 50);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`${userInfo.firstName} ${userInfo.lastName}`, 200, 150);
      
      ctx.font = '16px Arial';
      ctx.fillText(userInfo.mediaOrganization, 200, 180);
      ctx.fillText(userInfo.jobTitle, 200, 210);
      
      // QR Code placeholder
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(150, 280, 100, 100);
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.fillText('QR CODE', 200, 335);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `badge-${userInfo.lastName}-${userInfo.firstName}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
    
    toast.success('Identyfikator został pobrany!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge className="h-5 w-5" />
          Generator identyfikatorów
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="template">Szablon identyfikatora</Label>
            <select
              id="template"
              value={badgeTemplate}
              onChange={(e) => setBadgeTemplate(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="default">Domyślny</option>
              <option value="vip">VIP</option>
              <option value="press">Prasa</option>
              <option value="staff">Personel</option>
            </select>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Podgląd identyfikatora:</h4>
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 max-w-sm mx-auto">
            <div className="bg-blue-500 text-white p-3 rounded-t-lg text-center">
              <h3 className="font-bold">{eventInfo.name}</h3>
              <p className="text-sm">{eventInfo.date}</p>
            </div>
            <div className="p-4 text-center space-y-2">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="font-bold text-lg">{userInfo.firstName} {userInfo.lastName}</h4>
              <p className="text-sm text-gray-600">{userInfo.mediaOrganization}</p>
              <p className="text-xs text-gray-500">{userInfo.jobTitle}</p>
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <QrCode className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-xs mt-1">QR Code</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={generateBadge} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? 'Generowanie...' : 'Generuj identyfikator'}
          </Button>
          
          {generatedBadge && (
            <Button 
              onClick={downloadBadge}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Pobierz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
