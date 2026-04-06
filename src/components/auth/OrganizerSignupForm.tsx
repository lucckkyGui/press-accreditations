import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building, User, Mail, Lock, Phone, Globe } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";

interface OrganizerSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  jobTitle: string;
  phone?: string;
  website?: string;
  organizationType: string;
  description?: string;
}

export const OrganizerSignupForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [formData, setFormData] = useState<OrganizerSignupData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    jobTitle: "",
    phone: "",
    website: "",
    organizationType: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useI18n();

  const handleChange = (field: keyof OrganizerSignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) { toast.error("Imię jest wymagane"); return false; }
    if (!formData.lastName.trim()) { toast.error("Nazwisko jest wymagane"); return false; }
    if (!formData.email.trim()) { toast.error("Email jest wymagany"); return false; }
    if (!formData.password) { toast.error("Hasło jest wymagane"); return false; }
    if (formData.password !== formData.confirmPassword) { toast.error("Hasła nie są zgodne"); return false; }
    if (formData.password.length < 6) { toast.error("Hasło musi mieć co najmniej 6 znaków"); return false; }
    if (!formData.organizationName.trim()) { toast.error("Nazwa organizacji jest wymagana"); return false; }
    if (!formData.jobTitle.trim()) { toast.error("Stanowisko jest wymagane"); return false; }
    if (!formData.organizationType) { toast.error("Typ organizacji jest wymagany"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: 'organizer'
      });
      if (result && result.error) throw result.error;
      toast.success("Rejestracja zakończona! Sprawdź swój email w celu weryfikacji.");
    } catch (error: unknown) {
      toast.error(error.message || "Rejestracja nie powiodła się");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "h-11 rounded-xl border-border/60 focus:border-primary/40 transition-colors";

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border/40">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Dane osobowe
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm">Imię *</Label>
              <Input id="firstName" type="text" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className={inputClasses} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm">Nazwisko *</Label>
              <Input id="lastName" type="text" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className={inputClasses} required />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Adres email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={`pl-10 ${inputClasses}`} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Hasło *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className={`pl-10 ${inputClasses}`} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm">Potwierdź hasło *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className={`pl-10 ${inputClasses}`} required />
              </div>
            </div>
          </div>
        </div>

        {/* Organization Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border/40">
            <div className="p-1.5 rounded-lg bg-secondary/10">
              <Building className="h-4 w-4 text-secondary" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">
              Organizacja
            </h3>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="organizationName" className="text-sm">Nazwa organizacji *</Label>
            <Input id="organizationName" type="text" value={formData.organizationName} onChange={(e) => handleChange('organizationName', e.target.value)} className={inputClasses} required />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle" className="text-sm">Stanowisko *</Label>
              <Input id="jobTitle" type="text" value={formData.jobTitle} onChange={(e) => handleChange('jobTitle', e.target.value)} placeholder="np. Event Manager" className={inputClasses} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="organizationType" className="text-sm">Typ organizacji *</Label>
              <Select value={formData.organizationType} onValueChange={(value) => handleChange('organizationType', value)}>
                <SelectTrigger className={inputClasses}>
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Korporacja</SelectItem>
                  <SelectItem value="nonprofit">NGO</SelectItem>
                  <SelectItem value="government">Instytucja rządowa</SelectItem>
                  <SelectItem value="education">Edukacja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+48 123 456 789" className={`pl-10 ${inputClasses}`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-sm">Strona www</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input id="website" type="url" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://..." className={`pl-10 ${inputClasses}`} />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm">Opis organizacji</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Krótki opis organizacji i potrzeb w zakresie eventów..." rows={3} className="rounded-xl border-border/60 focus:border-primary/40 transition-colors" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col gap-3 pt-2">
        <Button type="submit" className="w-full h-11 rounded-xl font-medium shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Tworzenie konta...
            </>
          ) : (
            "Utwórz konto organizatora"
          )}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Button variant="link" size="sm" className="p-0 h-auto text-primary font-medium" onClick={onSwitchToLogin}>
            Zaloguj się
          </Button>
        </div>
      </CardFooter>
    </form>
  );
};
