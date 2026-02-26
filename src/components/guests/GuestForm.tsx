import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Guest, GuestZone, GuestStatus } from '@/types';
import { User, Mail, Building, Phone, Shield, StickyNote, Fingerprint } from 'lucide-react';

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
        firstName: '', lastName: '', email: '', pesel: '',
        company: '', phone: '', zone: 'general', status: 'invited', notes: ''
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

  const inputClasses = "h-11 rounded-xl border-border/60 focus:border-primary/40 transition-colors";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-5 border-b border-border/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {guest ? 'Edytuj gościa' : 'Dodaj nowego gościa'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {guest ? 'Zaktualizuj dane gościa poniżej.' : 'Wypełnij dane nowego gościa wydarzenia.'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Personal info section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Dane osobowe</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm">Imię *</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={inputClasses} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm">Nazwisko *</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={inputClasses} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`pl-10 ${inputClasses}`} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pesel" className="text-sm">PESEL</Label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input id="pesel" value={formData.pesel} onChange={(e) => handleInputChange('pesel', e.target.value)} placeholder="11 cyfr" maxLength={11} className={`pl-10 ${inputClasses}`} />
              </div>
            </div>
          </div>

          {/* Contact & company */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-secondary/10">
                <Building className="h-3.5 w-3.5 text-secondary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Kontakt i firma</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-sm">Firma</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input id="company" value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} className={`pl-10 ${inputClasses}`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={`pl-10 ${inputClasses}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Access settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-accent/10">
                <Shield className="h-3.5 w-3.5 text-accent" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Dostęp i status</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="zone" className="text-sm">Strefa</Label>
                <Select value={formData.zone} onValueChange={(value: GuestZone) => handleInputChange('zone', value)}>
                  <SelectTrigger className={inputClasses}>
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
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-sm">Status</Label>
                <Select value={formData.status} onValueChange={(value: GuestStatus) => handleInputChange('status', value)}>
                  <SelectTrigger className={inputClasses}>
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
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-muted-foreground/60" />
              Notatki
            </Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Dodatkowe informacje o gościu..." className="rounded-xl border-border/60 focus:border-primary/40 transition-colors" rows={3} />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-border/40 px-6 py-4 bg-muted/20 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
            Anuluj
          </Button>
          <Button onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }} disabled={isSubmitting} className="rounded-xl shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all">
            {isSubmitting ? 'Zapisywanie...' : (guest ? 'Zaktualizuj' : 'Dodaj gościa')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestForm;
