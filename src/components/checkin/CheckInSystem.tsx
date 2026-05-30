
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Users, Search, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface CheckInRecord {
  id: string;
  name: string;
  organization: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'checked-in' | 'checked-out';
}

export interface CheckInQueueEvent {
  guestId: string;
  guestName: string;
  action: 'check-in' | 'check-out';
}

interface CheckInSystemProps {
  onQueueEntry?: (entry: CheckInQueueEvent) => void;
}

export default function CheckInSystem({ onQueueEntry }: CheckInSystemProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([
    {
      id: '1',
      name: 'Anna Kowalska',
      organization: 'TVN24',
      checkInTime: new Date(),
      status: 'checked-in'
    },
    {
      id: '2', 
      name: 'Jan Nowak',
      organization: 'Gazeta Wyborcza',
      checkInTime: new Date(Date.now() - 3600000),
      checkOutTime: new Date(Date.now() - 1800000),
      status: 'checked-out'
    }
  ]);

  const handleCheckIn = (qrCode: string) => {
    // Simulate QR code scanning
    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      name: 'Nowy użytkownik',
      organization: 'Media',
      checkInTime: new Date(),
      status: 'checked-in'
    };
    
    setCheckInRecords(prev => [newRecord, ...prev]);
    onQueueEntry?.({
      guestId: newRecord.id,
      guestName: newRecord.name,
      action: 'check-in',
    });
    toast.success('Pomyślnie zarejestrowano wejście');
  };

  const handleCheckOut = (recordId: string) => {
    const recordToCheckOut = checkInRecords.find(record => record.id === recordId);
    setCheckInRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, checkOutTime: new Date(), status: 'checked-out' }
        : record
    ));
    if (recordToCheckOut) {
      onQueueEntry?.({
        guestId: recordToCheckOut.id,
        guestName: recordToCheckOut.name,
        action: 'check-out',
      });
    }
    toast.success('Pomyślnie zarejestrowano wyjście');
  };

  const filteredRecords = checkInRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalCheckedIn: checkInRecords.filter(r => r.status === 'checked-in').length,
    totalCheckedOut: checkInRecords.filter(r => r.status === 'checked-out').length,
    total: checkInRecords.length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Obecni</p>
                <p className="text-2xl font-bold">{stats.totalCheckedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wyszli</p>
                <p className="text-2xl font-bold">{stats.totalCheckedOut}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Łącznie</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Check-in/Check-out</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="records" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="records">Rejestr wejść</TabsTrigger>
              <TabsTrigger value="scanner">Skaner QR</TabsTrigger>
            </TabsList>
            
            <TabsContent value="records" className="space-y-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po nazwisku lub organizacji..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="space-y-2">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{record.name}</h4>
                      <p className="text-sm text-muted-foreground">{record.organization}</p>
                      <p className="text-xs text-muted-foreground">
                        Wejście: {record.checkInTime.toLocaleTimeString()}
                        {record.checkOutTime && ` | Wyjście: ${record.checkOutTime.toLocaleTimeString()}`}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'checked-in' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-foreground'
                      }`}>
                        {record.status === 'checked-in' ? 'Obecny' : 'Wyszedł'}
                      </span>
                      
                      {record.status === 'checked-in' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(record.id)}
                        >
                          Check-out
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="scanner" className="space-y-4">
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Skaner QR kodów</h3>
                <p className="text-muted-foreground mb-4">
                  Zeskanuj kod QR z identyfikatora uczestnika
                </p>
                <Button onClick={() => handleCheckIn('sample-qr')}>
                  Symuluj skanowanie
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
