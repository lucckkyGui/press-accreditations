
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  
  // Media Outlet Information
  mediaOutlet: z.string().min(1, "Media outlet name is required"),
  mediaType: z.string().min(1, "Media type is required"),
  position: z.string().min(1, "Position is required"),
  
  // Request Details
  accessType: z.string().min(1, "Access type is required"),
  equipment: z.string().optional(),
  
  // Additional Information
  previousAccreditation: z.boolean().default(false),
  previousEvent: z.string().optional(),
  comments: z.string().optional(),
  
  // Agreements
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  privacyAgreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AccreditationFormProps {
  eventId: string;
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
}

export const AccreditationForm: React.FC<AccreditationFormProps> = ({
  eventId,
  onSubmit,
  isLoading
}) => {
  const { t, currentLanguage } = useI18n();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      mediaOutlet: "",
      mediaType: "",
      position: "",
      accessType: "",
      equipment: "",
      previousAccreditation: false,
      previousEvent: "",
      comments: "",
      termsAgreed: false,
      privacyAgreed: false,
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('accreditation.personalInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pages.guests.firstName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('pages.guests.firstName')} {...field} />
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
                  <FormLabel>{t('pages.guests.lastName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('pages.guests.lastName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pages.guests.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
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
                  <FormLabel>{t('accreditation.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder="+48 123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('accreditation.mediaInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mediaOutlet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accreditation.mediaOutlet')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('accreditation.mediaOutletPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mediaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accreditation.mediaType')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('accreditation.selectMediaType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="press">{t('accreditation.press')}</SelectItem>
                      <SelectItem value="television">{t('accreditation.television')}</SelectItem>
                      <SelectItem value="radio">{t('accreditation.radio')}</SelectItem>
                      <SelectItem value="online">{t('accreditation.online')}</SelectItem>
                      <SelectItem value="photographer">{t('accreditation.photographer')}</SelectItem>
                      <SelectItem value="other">{t('accreditation.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('accreditation.position')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('accreditation.positionPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('accreditation.requestDetails')}</h2>
          <FormField
            control={form.control}
            name="accessType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('accreditation.accessType')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="standard" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t('accreditation.standardAccess')}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="photo" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t('accreditation.photoAccess')}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pressCenter" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t('accreditation.pressCenterAccess')}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="mixZone" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t('accreditation.mixZoneAccess')}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('accreditation.equipment')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('accreditation.equipmentPlaceholder')}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('accreditation.additionalInfo')}</h2>
          <FormField
            control={form.control}
            name="previousAccreditation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('accreditation.previouslyAccredited')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch("previousAccreditation") && (
            <FormField
              control={form.control}
              name="previousEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accreditation.previousEvent')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('accreditation.previousEventPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('accreditation.comments')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('accreditation.commentsPlaceholder')}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('accreditation.agreements')}</h2>
          <FormField
            control={form.control}
            name="termsAgreed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('accreditation.termsAgreement')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacyAgreed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('accreditation.privacyAgreement')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('common.submitting') : t('accreditation.submitRequest')}
        </Button>
      </form>
    </Form>
  );
};
