
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Settings } from 'lucide-react';
import { AccessZone } from '@/types/zones';

interface ZoneCardProps {
  zone: AccessZone;
  onEdit: (zoneId: string) => void;
  onDelete: (zoneId: string) => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone, onEdit, onDelete }) => {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: zone.color }}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{zone.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{zone.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(zone.id)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {zone.permissions.map((perm, idx) => (
            <Badge key={idx} variant={perm.allowed ? "default" : "secondary"}>
              {perm.action}
            </Badge>
          ))}
        </div>

        {zone.timeRestrictions && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{zone.timeRestrictions.length} ograniczeń czasowych</span>
          </div>
        )}

        {zone.capacity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Limit: {zone.capacity} osób</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(zone.id)}>
            Edytuj
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(zone.id)}
          >
            Usuń
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneCard;
