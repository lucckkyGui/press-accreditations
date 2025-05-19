
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMediaRegistrations } from '@/hooks/press';
import { MediaRegistrationForm as MediaRegistrationFormType, SocialMedia } from '@/types/pressRelease';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MediaRegistrationFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export default function MediaRegistrationForm({ eventId, onSuccess }: MediaRegistrationFormProps) {
  const { createMediaRegistration, isSubmitting } = useMediaRegistrations();
  const form = useForm<MediaRegistrationFormType>({
    defaultValues: {
      eventId: eventId,
      mediaOrganization: '',
      jobTitle: '',
      website: '',
      socialMedia: {
        twitter: '',
        linkedin: '',
        instagram: '',
      },
      previousAccreditation: false,
      coverageDescription: '',
    },
  });

  const onSubmit = (data: MediaRegistrationFormType) => {
    // Clean up social media fields - remove empty values
    const socialMedia: SocialMedia = {};
    
    Object.entries(data.socialMedia || {}).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim() !== '') {
        socialMedia[key] = value.trim();
      }
    });

    const formData: MediaRegistrationFormType = {
      ...data,
      eventId: eventId,  // Ensure eventId is set
      socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
    };
    
    createMediaRegistration(formData);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mediaOrganization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media Organization</FormLabel>
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
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your role at the organization" {...field} />
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
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your media organization's official website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-md font-medium">Social Media Profiles</h3>
              
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
            </div>
            
            <FormField
              control={form.control}
              name="previousAccreditation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Previous Accreditation</FormLabel>
                    <FormDescription>
                      Have you been accredited for a similar event before?
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
                      placeholder="Describe how you plan to cover this event"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please explain what kind of content you plan to create and which aspects of the event you will be covering.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={onSuccess}
              >
                Cancel
              </Button>
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
