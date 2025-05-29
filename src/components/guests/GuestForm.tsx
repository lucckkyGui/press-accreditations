import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Guest, GuestZone, GuestStatus } from '@/types';

export interface GuestFormProps {
  guest?: Guest | null;
  eventId: string;
  onSubmit: (guest: Partial<Guest> & { eventId: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const GuestForm = ({ guest, eventId, onSubmit, onCancel, isSubmitting, isOpen, onOpenChange }: GuestFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    pesel: '',
    company: '',
    phone: '',
    zone: 'general' as GuestZone,
    status: 'invited' as GuestStatus,
    notes: ''
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        email: guest.email || '',
        pesel: guest.pesel || '',
        company: guest.company || '',
        phone: guest.phone || '',
        zone: guest.zone || 'general',
        status: guest.status || 'invited',
        notes: guest.notes || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        pesel: '',
        company: '',
        phone: '',
        zone: 'general',
        status: 'invited',
        notes: ''
      });
    }
  }, [guest, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, eventId });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{guest ? 'Edytuj gościa' : 'Dodaj nowego gościa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Imię *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nazwisko *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="pesel">PESEL</Label>
            <Input
              id="pesel"
              value={formData.pesel}
              onChange={(e) => handleInputChange('pesel', e.target.value)}
              placeholder="11 cyfr"
              maxLength={11}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Firma</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zone">Strefa</Label>
              <Select value={formData.zone} onValueChange={(value: GuestZone) => handleInputChange('zone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Ogólna</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="press">Press</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: GuestStatus) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invited">Zaproszony</SelectItem>
                  <SelectItem value="confirmed">Potwierdzony</SelectItem>
                  <SelectItem value="declined">Odrzucony</SelectItem>
                  <SelectItem value="checked-in">Obecny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Dodatkowe informacje o gościu..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : (guest ? 'Zaktualizuj' : 'Dodaj')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GuestForm;
