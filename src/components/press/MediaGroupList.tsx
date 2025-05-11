
import React, { useState } from 'react';
import { useMediaGroups } from '@/hooks/press';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash, Users } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface MediaGroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    contactCount: number;
    tags?: string[];
    createdAt: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewContacts: (id: string) => void;
}

const MediaGroupCard: React.FC<MediaGroupCardProps> = ({ 
  group, 
  onEdit, 
  onDelete, 
  onViewContacts 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
        {group.description && (
          <CardDescription>{group.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm mb-4">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{group.contactCount} kontaktów</span>
        </div>
        
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {group.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onViewContacts(group.id)}
        >
          Kontakty
        </Button>
        
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(group.id)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(group.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const MediaGroupList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  const { mediaGroups, deleteMediaGroup, isLoading } = useMediaGroups();
  
  const handleDelete = (id: string) => {
    setSelectedGroupId(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedGroupId) {
      deleteMediaGroup(selectedGroupId);
      setDeleteDialogOpen(false);
      setSelectedGroupId(null);
    }
  };
  
  const handleEdit = (id: string) => {
    // Tu powinna być implementacja edycji grupy
    console.log("Edit group", id);
  };
  
  const handleViewContacts = (id: string) => {
    // Tu powinna być implementacja podglądu kontaktów w grupie
    console.log("View contacts in group", id);
  };
  
  const filteredGroups = mediaGroups?.filter(group => {
    return !searchTerm || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (group.tags && group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Grupy mediów</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Nowa grupa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowa grupa mediów</DialogTitle>
            </DialogHeader>
            {/* Tu powinien być formularz tworzenia grupy mediów */}
            <p className="text-center text-muted-foreground py-8">Formularz tworzenia grupy mediów</p>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Szukaj grup..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p>Ładowanie grup mediów...</p>
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <MediaGroupCard 
              key={group.id} 
              group={group}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewContacts={handleViewContacts}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Brak grup mediów</p>
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę grupę mediów?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Grupa zostanie usunięta wraz z powiązaniami do kontaktów (same kontakty nie zostaną usunięte).
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

export default MediaGroupList;
