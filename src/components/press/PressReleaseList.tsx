
import React, { useState } from 'react';
import { PressRelease, PressReleaseStatus, PressReleaseType } from '@/types/pressRelease';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChartBar, Send, Calendar, Copy, Pencil, Trash, Mail } from 'lucide-react';
import { usePressReleases } from '@/hooks/press';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PressReleaseCardProps {
  pressRelease: PressRelease;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onSchedule: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const statusColors: Record<PressReleaseStatus, string> = {
  draft: 'bg-gray-200 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sent: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: Record<PressReleaseStatus, string> = {
  draft: 'Szkic',
  scheduled: 'Zaplanowany',
  sent: 'Wysłany',
  cancelled: 'Anulowany'
};

const typeLabels: Record<PressReleaseType, string> = {
  announcement: 'Ogłoszenie',
  invitation: 'Zaproszenie',
  statement: 'Oświadczenie',
  other: 'Inne'
};

const PressReleaseCard: React.FC<PressReleaseCardProps> = ({ 
  pressRelease, 
  onView, 
  onEdit, 
  onDelete, 
  onSend, 
  onSchedule, 
  onDuplicate 
}) => {
  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: pl });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="pr-8">
            <CardTitle className="text-lg font-semibold mb-1">{pressRelease.title}</CardTitle>
            <CardDescription>
              {typeLabels[pressRelease.type]}
            </CardDescription>
          </div>
          <Badge className={statusColors[pressRelease.status]}>{statusLabels[pressRelease.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {pressRelease.content}
        </p>
        
        <div className="flex flex-col space-y-2 text-xs text-muted-foreground">
          {pressRelease.sentAt && (
            <div className="flex items-center">
              <Send className="h-3.5 w-3.5 mr-2" />
              <span>Wysłano: {getFormattedDate(pressRelease.sentAt)}</span>
            </div>
          )}
          {pressRelease.scheduledFor && pressRelease.status === 'scheduled' && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              <span>Zaplanowano na: {getFormattedDate(pressRelease.scheduledFor)}</span>
            </div>
          )}
          {pressRelease.metrics && (
            <div className="flex items-center">
              <ChartBar className="h-3.5 w-3.5 mr-2" />
              <span>
                Otwarte: {pressRelease.metrics.openCount}/{pressRelease.metrics.deliveredCount} 
                ({Math.round((pressRelease.metrics.openCount / pressRelease.metrics.deliveredCount) * 100)}%)
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onView(pressRelease.id)} 
          className="text-xs"
        >
          Szczegóły
        </Button>
        
        <div className="flex space-x-1">
          {pressRelease.status === 'draft' && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(pressRelease.id)} 
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSend(pressRelease.id)} 
                className="h-8 w-8"
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSchedule(pressRelease.id)} 
                className="h-8 w-8"
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(pressRelease.id)} 
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
          {pressRelease.status === 'scheduled' && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(pressRelease.id)} 
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSend(pressRelease.id)} 
                className="h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(pressRelease.id)} 
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
          {pressRelease.status === 'sent' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDuplicate(pressRelease.id)} 
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const PressReleaseList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<PressReleaseType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<PressReleaseStatus | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPressReleaseId, setSelectedPressReleaseId] = useState<string | null>(null);
  
  const { pressReleases, deletePressRelease, sendPressRelease, isLoading } = usePressReleases();
  
  const handleDelete = (id: string) => {
    setSelectedPressReleaseId(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedPressReleaseId) {
      deletePressRelease(selectedPressReleaseId);
      setDeleteDialogOpen(false);
      setSelectedPressReleaseId(null);
    }
  };
  
  const handleSend = (id: string) => {
    sendPressRelease(id);
  };
  
  const handleSchedule = (id: string) => {
    // Tu powinna być implementacja planowania komunikatu prasowego
    console.log("Schedule press release", id);
  };
  
  const handleDuplicate = (id: string) => {
    // Tu powinna być implementacja duplikowania komunikatu prasowego
    console.log("Duplicate press release", id);
  };
  
  const handleEdit = (id: string) => {
    // Tu powinna być implementacja edycji komunikatu prasowego
    console.log("Edit press release", id);
  };
  
  const handleView = (id: string) => {
    // Tu powinna być implementacja podglądu komunikatu prasowego
    console.log("View press release", id);
  };
  
  const filteredPressReleases = pressReleases?.filter(pr => {
    // Filtruj po statusie
    const matchesStatus = activeTab === 'all' || pr.status === activeTab;
    
    // Filtruj po tytule
    const matchesSearch = !searchTerm || pr.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtruj po typie
    const matchesType = typeFilter === 'all' || pr.type === typeFilter;
    
    return matchesStatus && matchesSearch && matchesType;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Komunikaty prasowe</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Nowy komunikat</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy komunikat prasowy</DialogTitle>
            </DialogHeader>
            {/* Tu powinien być formularz tworzenia komunikatu prasowego */}
            <p className="text-center text-muted-foreground py-8">Formularz tworzenia komunikatu prasowego</p>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Szukaj komunikatów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/4">
          <Select 
            value={typeFilter} 
            onValueChange={(value) => setTypeFilter(value as PressReleaseType | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtruj po typie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              <SelectItem value="announcement">Ogłoszenie</SelectItem>
              <SelectItem value="invitation">Zaproszenie</SelectItem>
              <SelectItem value="statement">Oświadczenie</SelectItem>
              <SelectItem value="other">Inne</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as PressReleaseStatus | 'all')}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          <TabsTrigger value="draft">Szkice</TabsTrigger>
          <TabsTrigger value="scheduled">Zaplanowane</TabsTrigger>
          <TabsTrigger value="sent">Wysłane</TabsTrigger>
          <TabsTrigger value="cancelled">Anulowane</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p>Ładowanie komunikatów...</p>
            </div>
          ) : filteredPressReleases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPressReleases.map(pressRelease => (
                <PressReleaseCard 
                  key={pressRelease.id} 
                  pressRelease={pressRelease}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSend={handleSend}
                  onSchedule={handleSchedule}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Brak komunikatów prasowych</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten komunikat prasowy?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Komunikat prasowy zostanie całkowicie usunięty z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PressReleaseList;
