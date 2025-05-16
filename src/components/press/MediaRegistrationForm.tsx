
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMediaRegistrations } from '@/hooks/press';
import { useAuth } from '@/hooks/useAuth';
import { MediaRegistrationForm as RegistrationFormType } from '@/types/pressRelease';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formSchema = z.object({
  eventId: z.string().uuid(),
  mediaOrganization: z.string().min(2, 'Organization name is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  socialMedia: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
  previousAccreditation: z.boolean().optional(),
  coverageDescription: z.string().optional(),
});

interface MediaRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export default function MediaRegistrationForm({ eventId, onSuccess }: MediaRegistrationFormProps) {
  const { user } = useAuth();
  const { createMediaRegistration, isSubmitting } = useMediaRegistrations();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId,
      mediaOrganization: '',
      jobTitle: '',
      website: '',
      socialMedia: {
        twitter: '',
        linkedin: '',
        facebook: '',
        instagram: '',
        youtube: '',
      },
      previousAccreditation: false,
      coverageDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      return;
    }
    
    const formData: RegistrationFormType = {
      ...values,
      socialMedia: Object.fromEntries(
        Object.entries(values.socialMedia || {}).filter(([_, value]) => value)
      ),
    };
    
    createMediaRegistration(formData);
    form.reset();
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Media Accreditation Registration</CardTitle>
        <CardDescription>
          Complete this form to request media accreditation for the event. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Media Information</h3>
              
              <FormField
                control={form.control}
                name="mediaOrganization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Organization *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your media organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your role in the organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.com" {...field} />
                    </FormControl>
                    <FormDescription>Enter the full URL including http:// or https://</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <h3 className="text-lg font-semibold">Social Media Profiles</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="socialMedia.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter / X</FormLabel>
                      <FormControl>
                        <Input placeholder="@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="LinkedIn profile URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="Facebook page or profile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="YouTube channel URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <h3 className="text-lg font-semibold">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="previousAccreditation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Previous Accreditation</FormLabel>
                      <FormDescription>
                        Have you been accredited for our events before?
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
              
              <FormField
                control={form.control}
                name="coverageDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how you plan to cover the event" 
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Please include information about your audience, reach, and type of coverage you plan to produce.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
