
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Event } from '@/types';
import { Users, AlertTriangle, CheckCircle, Clock, Mail } from 'lucide-react';

interface EventCapacityValidatorProps {
  event: Event;
  currentGuestCount: number;
  maxCapacity?: number;
  emailQuotaUsed?: number;
  emailQuotaLimit?: number;
}

interface CapacityLimits {
  guests: {
    soft: number;
    hard: number;
    current: number;
  };
  emails: {
    hourly: number;
    daily: number;
    monthly: number;
    used: number;
  };
  storage: {
    invitations: number;
    qrCodes: number;
    totalMB: number;
  };
}

const EventCapacityValidator: React.FC<EventCapacityValidatorProps> = ({
  event,
  currentGuestCount,
  maxCapacity = 5000,
  emailQuotaUsed = 0,
  emailQuotaLimit = 10000
}) => {
  // Symulacja limitów systemu
  const limits: CapacityLimits = {
    guests: {
      soft: Math.floor(maxCapacity * 0.8), // 80% soft limit
      hard: maxCapacity,
      current: currentGuestCount
    },
    emails: {
      hourly: 500,
      daily: 2000,
      monthly: emailQuotaLimit,
      used: emailQuotaUsed
    },
    storage: {
      invitations: currentGuestCount * 0.5, // ~0.5MB per invitation
      qrCodes: currentGuestCount * 0.1, // ~0.1MB per QR code
      totalMB: currentGuestCount * 0.6
    }
  };

  const getGuestCapacityStatus = () => {
    const percentage = (limits.guests.current / limits.guests.hard) * 100;
    
    if (percentage >= 100) return { status: 'critical', color: 'destructive', message: 'Osiągnięto maksymalną pojemność' };
    if (percentage >= 80) return { status: 'warning', color: 'secondary', message: 'Blisko limitu pojemności' };
    if (percentage >= 60) return { status: 'caution', color: 'outline', message: 'Umiarkowane wykorzystanie' };
    return { status: 'good', color: 'default', message: 'Dobre wykorzystanie pojemności' };
  };

  const getEmailQuotaStatus = () => {
    const percentage = (limits.emails.used / limits.emails.monthly) * 100;
    
    if (percentage >= 90) return { status: 'critical', color: 'destructive' };
    if (percentage >= 70) return { status: 'warning', color: 'secondary' };
    return { status: 'good', color: 'default' };
  };

  const estimateEmailTime = (guestCount: number) => {
    const batchSize = guestCount > 2000 ? 100 : guestCount > 1000 ? 75 : 50;
    const batchDelay = guestCount > 2000 ? 3 : 2.5; // sekundy
    const emailsPerSecond = batchSize / batchDelay;
    return Math.ceil(guestCount / emailsPerSecond / 60); // minuty
  };

  const guestStatus = getGuestCapacityStatus();
  const emailStatus = getEmailQuotaStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Validator Pojemności Wydarzenia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pojemność gości */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pojemność gości</span>
            <Badge variant={guestStatus.color as any}>
              {limits.guests.current}/{limits.guests.hard}
            </Badge>
          </div>
          <Progress 
            value={(limits.guests.current / limits.guests.hard) * 100} 
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            {guestStatus.message}
          </div>

          {/* Ostrzeżenia pojemności */}
          {limits.guests.current >= limits.guests.soft && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Osiągnięto {Math.round((limits.guests.current / limits.guests.hard) * 100)}% pojemności. 
                Pozostało miejsc: {limits.guests.hard - limits.guests.current}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Quota emaili */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quota emaili (miesięczna)</span>
            <Badge variant={emailStatus.color as any}>
              {limits.emails.used}/{limits.emails.monthly}
            </Badge>
          </div>
          <Progress 
            value={(limits.emails.used / limits.emails.monthly) * 100} 
            className="w-full"
          />
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium">{limits.emails.hourly}</div>
              <div className="text-muted-foreground">Na godzinę</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{limits.emails.daily}</div>
              <div className="text-muted-foreground">Na dzień</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{limits.emails.monthly - limits.emails.used}</div>
              <div className="text-muted-foreground">Pozostało</div>
            </div>
          </div>
        </div>

        {/* Estymacja czasu wysyłki */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Estymacja wysyłki</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {estimateEmailTime(limits.guests.current)}min
              </div>
              <div className="text-xs text-muted-foreground">Obecni goście</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {estimateEmailTime(1000)}min
              </div>
              <div className="text-xs text-muted-foreground">1k gości</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {estimateEmailTime(3000)}min
              </div>
              <div className="text-xs text-muted-foreground">3k gości</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {estimateEmailTime(5000)}min
              </div>
              <div className="text-xs text-muted-foreground">5k gości</div>
            </div>
          </div>
        </div>

        {/* Wykorzystanie storage */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm font-medium">Wykorzystanie storage</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-purple-600">
                {limits.storage.invitations.toFixed(1)}MB
              </div>
              <div className="text-xs text-muted-foreground">Zaproszenia</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {limits.storage.qrCodes.toFixed(1)}MB
              </div>
              <div className="text-xs text-muted-foreground">QR kody</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {limits.storage.totalMB.toFixed(1)}MB
              </div>
              <div className="text-xs text-muted-foreground">Łącznie</div>
            </div>
          </div>
        </div>

        {/* Rekomendacje */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Rekomendacje:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
              <li>Dla grup większych niż 2000 gości użyj strategii Enterprise retry</li>
              <li>Planuj wysyłkę w godzinach o niskim ruchu (2:00-6:00)</li>
              <li>Monitoruj delivery rate - cel: powyżej 95%</li>
              <li>Przygotuj backup plan dla failed emaili</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EventCapacityValidator;
