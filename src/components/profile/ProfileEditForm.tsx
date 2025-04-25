
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User } from "lucide-react";

interface ProfileEditFormProps {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
    company?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: { firstName: string; lastName: string; company?: string }) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    company: user.company || "",
  });

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    } else if (formData.firstName) {
      return formData.firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj profil</DialogTitle>
          <DialogDescription>
            Zaktualizuj swoje dane osobowe. Kliknij Zapisz po zakończeniu.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="flex justify-center mb-2">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Wprowadź imię"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Wprowadź nazwisko"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Adres email nie może zostać zmieniony
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Firma/Organizacja</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Wprowadź nazwę firmy lub organizacji"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit">Zapisz zmiany</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditForm;
