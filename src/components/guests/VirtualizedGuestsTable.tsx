
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Guest } from '@/types';
import { Edit, Trash2 } from 'lucide-react';

interface VirtualizedGuestsTableProps {
  guests: Guest[];
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  selectedGuests: string[];
  setSelectedGuests: (ids: string[]) => void;
  isLoading: boolean;
}

interface RowData {
  guests: Guest[];
  selectedGuests: string[];
  onToggleGuest: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
}

const GuestRow: React.FC<{ index: number; style: any; data: RowData }> = ({
  index,
  style,
  data
}) => {
  const guest = data.guests[index];
  const isSelected = data.selectedGuests.includes(guest.id);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'invited': return 'secondary';
      case 'declined': return 'destructive';
      case 'checked-in': return 'outline';
      default: return 'secondary';
    }
  };

  const getZoneBadgeColor = (zone: string) => {
    switch (zone) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'press': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={style} className="flex items-center p-4 border-b hover:bg-muted/50">
      <div className="flex items-center space-x-4 flex-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => data.onToggleGuest(guest.id)}
        />
        
        <div className="grid grid-cols-6 gap-4 flex-1 items-center">
          <div className="font-medium">
            {guest.firstName} {guest.lastName}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {guest.email}
          </div>
          
          <div className="text-sm">
            {guest.company || '-'}
          </div>
          
          <div>
            <Badge variant={getStatusBadgeVariant(guest.status)}>
              {guest.status}
            </Badge>
          </div>
          
          <div>
            <Badge className={getZoneBadgeColor(guest.zone)}>
              {guest.zone}
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => data.onEdit(guest)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => data.onDelete(guest.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VirtualizedGuestsTable: React.FC<VirtualizedGuestsTableProps> = ({
  guests,
  onEdit,
  onDelete,
  selectedGuests,
  setSelectedGuests,
  isLoading
}) => {
  const handleToggleGuest = (id: string) => {
    setSelectedGuests(
      selectedGuests.includes(id)
        ? selectedGuests.filter(gId => gId !== id)
        : [...selectedGuests, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedGuests(
      selectedGuests.length === guests.length 
        ? [] 
        : guests.map(g => g.id)
    );
  };

  const rowData = useMemo(() => ({
    guests,
    selectedGuests,
    onToggleGuest: handleToggleGuest,
    onEdit,
    onDelete
  }), [guests, selectedGuests, onEdit, onDelete]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Goście ({guests.length})</span>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedGuests.length === guests.length && guests.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Zaznacz wszystkich
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b font-medium bg-muted">
          <div>Imię i nazwisko</div>
          <div>Email</div>
          <div>Firma</div>
          <div>Status</div>
          <div>Strefa</div>
          <div>Akcje</div>
        </div>

        {/* Virtualized List */}
        <List
          height={600}
          itemCount={guests.length}
          itemSize={80}
          itemData={rowData}
        >
          {GuestRow}
        </List>
      </CardContent>
    </Card>
  );
};

export default VirtualizedGuestsTable;
