
import React, { useState } from 'react';
import { useMediaContacts } from '@/hooks/press';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash, Mail, Phone, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMediaGroups } from '@/hooks/press';

const MediaContactList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  const { mediaContacts, deleteMediaContact, isLoading } = useMediaContacts();
  const { mediaGroups } = useMediaGroups();
  
  const handleDelete = (id: string) => {
    setSelectedContactId(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedContactId) {
      deleteMediaContact(selectedContactId);
      setDeleteDialogOpen(false);
      setSelectedContactId(null);
    }
  };
  
  const handleEdit = (id: string) => {
    // Tu powinna być implementacja edycji kontaktu
    console.log("Edit contact", id);
  };
  
  const filteredContacts = mediaContacts?.filter(contact => {
    // Filtruj po grupie
    const matchesGroup = groupFilter === 'all' || contact.groups.includes(groupFilter);
    
    // Filtruj po tekście wyszukiwania
    const matchesSearch = !searchTerm || 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.mediaOutlet.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesGroup && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Kontakty medialne</h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Import kontaktów</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import kontaktów</DialogTitle>
              </DialogHeader>
              {/* Tu powinien być formularz importu kontaktów */}
              <p className="text-center text-muted-foreground py-8">Formularz importu kontaktów</p>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Nowy kontakt</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nowy kontakt medialny</DialogTitle>
              </DialogHeader>
              {/* Tu powinien być formularz tworzenia kontaktu */}
              <p className="text-center text-muted-foreground py-8">Formularz tworzenia kontaktu</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Szukaj kontaktów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/4">
          <Select 
            value={groupFilter} 
            onValueChange={setGroupFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtruj po grupie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie grupy</SelectItem>
              {mediaGroups?.map(group => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p>Ładowanie kontaktów...</p>
            </div>
          ) : filteredContacts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwisko i imię</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead>Grupy</TableHead>
                    <TableHead className="w-[100px]">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map(contact => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {contact.lastName} {contact.firstName}
                        {contact.position && (
                          <div className="text-xs text-muted-foreground">{contact.position}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{contact.mediaOutlet}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.groups.map(groupId => {
                            const group = mediaGroups?.find(g => g.id === groupId);
                            return group ? (
                              <Badge key={groupId} variant="outline" className="text-xs">{group.name}</Badge>
                            ) : null;
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(contact.id)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(contact.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Brak kontaktów medialnych</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten kontakt?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Kontakt zostanie całkowicie usunięty z systemu.
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

export default MediaContactList;
