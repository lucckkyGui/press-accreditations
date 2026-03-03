
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
import { CalendarIcon, Clock, MapPin, Image, Users, FileText, Settings2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/types";
import { toast } from "sonner";

const eventFormSchema = z.object({
  name: z.string().min(3, "Nazwa wydarzenia musi mieć co najmniej 3 znaki"),
  description: z.string().optional(),
  location: z.string().min(2, "Lokalizacja jest wymagana"),
  startDate: z.date({ required_error: "Data wydarzenia jest wymagana" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Podaj czas w formacie HH:MM"),
  gateOpenTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Podaj czas w formacie HH:MM").optional().or(z.literal('')),
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

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel, isSubmitting = false }) => {
  const isEditMode = !!event;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name || "",
      description: event?.description || "",
      location: event?.location || "",
      startDate: event?.startDate || new Date(),
      startTime: event?.startDate ? format(event.startDate, "HH:mm") : "10:00",
      endDate: event?.endDate,
      gateOpenTime: "",
      endTime: event?.endDate ? format(event.endDate, "HH:mm") : undefined,
      isPublished: event?.isPublished || false,
      imageUrl: event?.imageUrl || "",
      category: event?.category || "konferencja",
      maxGuests: event?.maxGuests || 100,
    },
  });

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const [startHours, startMinutes] = values.startTime.split(':').map(Number);
      const startDateTime = new Date(values.startDate);
      startDateTime.setHours(startHours, startMinutes, 0);

      let endDateTime = undefined;
      if (values.endDate && values.endTime) {
        const [endHours, endMinutes] = values.endTime.split(':').map(Number);
        endDateTime = new Date(values.endDate);
        endDateTime.setHours(endHours, endMinutes, 0);
      }

      await onSubmit({
        name: values.name,
        description: values.description || "",
        location: values.location,
        startDate: startDateTime,
        endDate: endDateTime,
        isPublished: values.isPublished,
        imageUrl: values.imageUrl || undefined,
        category: values.category,
        maxGuests: values.maxGuests,
      });
    } catch (error) {
      console.error('Error in event form submission:', error);
      toast.error('Wystąpił błąd podczas zapisywania wydarzenia. Spróbuj ponownie.');
    }
  };

  const inputClasses = "h-11 rounded-xl border-border/60 focus:border-primary/40 transition-colors";

  const SectionHeader = ({ icon: Icon, label, color = "primary" }: { icon: React.ElementType; label: string; color?: string }) => (
    <div className="flex items-center gap-2 pb-1 border-b border-border/40 mb-4">
      <div className={`p-1.5 rounded-lg bg-${color}/10`}>
        <Icon className={`h-4 w-4 text-${color}`} />
      </div>
      <h3 className={`text-xs font-semibold uppercase tracking-widest text-${color}`}>{label}</h3>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic info */}
        <div>
          <SectionHeader icon={FileText} label="Informacje podstawowe" />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Nazwa wydarzenia *</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Konferencja Prasowa 2025" {...field} className={inputClasses} />
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
                  <FormLabel className="text-sm font-medium">Typ wydarzenia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder="Wybierz typ wydarzenia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="konferencja">Konferencja prasowa</SelectItem>
                      <SelectItem value="premiera">Premiera</SelectItem>
                      <SelectItem value="koncert">Koncert</SelectItem>
                      <SelectItem value="targi">Targi</SelectItem>
                      <SelectItem value="wystawa">Wystawa</SelectItem>
                      <SelectItem value="warsztat">Warsztat</SelectItem>
                      <SelectItem value="szkolenie">Szkolenie</SelectItem>
                      <SelectItem value="inne">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Opis wydarzenia</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opisz cel i program wydarzenia"
                      className="min-h-[100px] rounded-xl border-border/60 focus:border-primary/40 transition-colors"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Date & time */}
        <div>
          <SectionHeader icon={CalendarIcon} label="Data i czas" color="secondary" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Data rozpoczęcia *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              inputClasses,
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" locale={pl} weekStartsOn={1} defaultMonth={field.value || undefined} />
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
                    <FormLabel className="text-sm font-medium">Godzina rozpoczęcia *</FormLabel>
                    <FormControl>
                      <Input type="time" className={inputClasses} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gateOpenTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Godzina otwarcia bramek</FormLabel>
                  <FormControl>
                    <Input type="time" className={inputClasses} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Data zakończenia</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              inputClasses,
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" locale={pl} weekStartsOn={1} defaultMonth={field.value || undefined} />
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
                    <FormLabel className="text-sm font-medium">Godzina zakończenia</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className={inputClasses}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Location & details */}
        <div>
          <SectionHeader icon={Settings2} label="Szczegóły" color="accent" />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Lokalizacja *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input className={`pl-10 ${inputClasses}`} placeholder="Np. Centrum Konferencyjne, Warszawa" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">URL obrazu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input className={`pl-10 ${inputClasses}`} placeholder="https://..." {...field} value={field.value || ""} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Maks. gości</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                          className={`pl-10 ${inputClasses}`}
                          type="number"
                          min={1}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
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
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/60 p-4 bg-primary/5">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Opublikuj wydarzenie</FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Po opublikowaniu wydarzenie będzie widoczne dla gości
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border/40">
          <Button variant="outline" onClick={onCancel} type="button" className="rounded-xl">
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : isEditMode ? "Zapisz zmiany" : "Utwórz wydarzenie"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
