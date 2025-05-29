
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Guest, GuestZone, GuestStatus } from "@/types";
import { toast } from "sonner";

// Form validation schema
const guestFormSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  lastName: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
  email: z.string().email("Podaj prawidłowy adres email"),
  pesel: z.string().optional().refine((pesel) => {
    if (!pesel) return true; // PESEL jest opcjonalny
    return /^\d{11}$/.test(pesel);
  }, "PESEL musi składać się z 11 cyfr"),
  phone: z.string().optional(),
  company: z.string().optional(),
  zone: z.enum(['vip', 'press', 'staff', 'general']),
  status: z.enum(['invited', 'confirmed', 'declined', 'checked-in']).default('invited'),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestFormProps {
  guest?: Guest;
  eventId: string;
  onSubmit: (guest: Partial<Guest> & { eventId: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const GuestForm: React.FC<GuestFormProps> = ({ 
  guest, 
  eventId,
  onSubmit, 
  onCancel,
  isSubmitting = false
}) => {
  const isEditMode = !!guest;

  // Initialize form with default values or guest data
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      firstName: guest?.firstName || "",
      lastName: guest?.lastName || "",
      email: guest?.email || "",
      pesel: guest?.pesel || "",
      phone: guest?.phone || "",
      company: guest?.company || "",
      zone: guest?.zone || "general",
      status: guest?.status || "invited",
    },
  });

  const handleSubmit = async (values: GuestFormValues) => {
    try {
      await onSubmit({
        ...values,
        eventId
      });
    } catch (error) {
      console.error('Error in guest form submission:', error);
      toast.error('Wystąpił błąd podczas zapisywania gościa. Spróbuj ponownie.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię</FormLabel>
                <FormControl>
                  <Input placeholder="Jan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwisko</FormLabel>
                <FormControl>
                  <Input placeholder="Kowalski" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="jan.kowalski@example.com" 
                  type="email"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="pesel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PESEL (opcjonalnie)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="80010112345" 
                    maxLength={11}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+48 123 456 789" 
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firma</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ABC Corp" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="zone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Strefa dostępu</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz strefę dostępu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">Ogólna</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="press">Press</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Strefa dostępu określa uprawnienia gościa podczas wydarzenia
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {isEditMode && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="invited">Zaproszony</SelectItem>
                      <SelectItem value="confirmed">Potwierdzony</SelectItem>
                      <SelectItem value="declined">Odrzucony</SelectItem>
                      <SelectItem value="checked-in">Obecny</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Status określa aktualny stan zaproszenia gościa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Anuluj
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Zapisywanie..." : isEditMode ? "Zapisz zmiany" : "Dodaj gościa"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GuestForm;
