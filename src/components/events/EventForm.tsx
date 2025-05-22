
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon, Clock, MapPin, Image, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/types";
import { toast } from "sonner";

// Form validation schema
const eventFormSchema = z.object({
  name: z.string().min(3, "Nazwa wydarzenia musi mieć co najmniej 3 znaki"),
  description: z.string().optional(),
  location: z.string().min(2, "Lokalizacja jest wymagana"),
  startDate: z.date({
    required_error: "Data wydarzenia jest wymagana",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Podaj czas w formacie HH:MM"),
  endDate: z.date().optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Podaj czas w formacie HH:MM").optional(),
  isPublished: z.boolean().default(false),
  imageUrl: z.string().url("Wprowadź prawidłowy adres URL").optional().or(z.literal('')),
  category: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ 
  event, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}) => {
  const isEditMode = !!event;

  // Initialize form with default values or event data
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name || "",
      description: event?.description || "",
      location: event?.location || "",
      startDate: event?.startDate || new Date(),
      startTime: event?.startDate 
        ? format(event.startDate, "HH:mm") 
        : "10:00",
      endDate: event?.endDate,
      endTime: event?.endDate 
        ? format(event.endDate, "HH:mm") 
        : undefined,
      isPublished: event?.isPublished || false,
      imageUrl: event?.imageUrl || "",
      category: event?.category || "konferencja",
      maxGuests: event?.maxGuests || 100,
    },
  });

  const handleSubmit = async (values: EventFormValues) => {
    try {
      // Combine date and time for start date
      const [startHours, startMinutes] = values.startTime.split(':').map(Number);
      const startDateTime = new Date(values.startDate);
      startDateTime.setHours(startHours, startMinutes, 0);
      
      // Combine date and time for end date if provided
      let endDateTime = undefined;
      if (values.endDate && values.endTime) {
        const [endHours, endMinutes] = values.endTime.split(':').map(Number);
        endDateTime = new Date(values.endDate);
        endDateTime.setHours(endHours, endMinutes, 0);
      }
      
      // Prepare event data
      const eventData = {
        name: values.name,
        description: values.description || "",
        location: values.location,
        startDate: startDateTime,
        endDate: endDateTime,
        isPublished: values.isPublished,
        imageUrl: values.imageUrl || undefined,
        category: values.category,
        maxGuests: values.maxGuests,
      };
      
      // Submit the form
      await onSubmit(eventData);
    } catch (error) {
      console.error('Error in event form submission:', error);
      toast.error('Wystąpił błąd podczas zapisywania wydarzenia. Spróbuj ponownie.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa wydarzenia</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Np. Konferencja Prasowa 2025" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typ wydarzenia</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ wydarzenia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="konferencja">Konferencja prasowa</SelectItem>
                  <SelectItem value="premiera">Premiera</SelectItem>
                  <SelectItem value="targi">Targi/Wystawa</SelectItem>
                  <SelectItem value="warsztat">Warsztat/Szkolenie</SelectItem>
                  <SelectItem value="inne">Inne</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data rozpoczęcia</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: pl })
                        ) : (
                          <span>Wybierz datę</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Godzina rozpoczęcia</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data zakończenia (opcjonalnie)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: pl })
                        ) : (
                          <span>Wybierz datę</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Godzina zakończenia (opcjonalnie)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time"
                      className="pl-9"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis wydarzenia</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Opisz cel i program wydarzenia"
                  className="min-h-[120px]"
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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokalizacja</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    placeholder="Np. Centrum Konferencyjne, Warszawa" 
                    {...field} 
                    />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL obrazu wydarzenia (opcjonalnie)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Image className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    placeholder="https://example.com/image.jpg" 
                    {...field}
                    value={field.value || ""}
                  />
                </div>
              </FormControl>
              <FormDescription>
                URL do obrazu, który będzie wyświetlany jako miniatura wydarzenia
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="maxGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maksymalna liczba gości</FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    type="number"
                    min={1}
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Limit uczestników, których możesz zaprosić na wydarzenie
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Opublikuj wydarzenie</FormLabel>
                <FormDescription>
                  Po opublikowaniu wydarzenie będzie widoczne dla gości
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Anuluj
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Zapisywanie..." : isEditMode ? "Zapisz zmiany" : "Utwórz wydarzenie"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
