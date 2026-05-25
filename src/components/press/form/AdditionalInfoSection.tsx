
import React from 'react';
import { Control } from 'react-hook-form';
import { MediaRegistrationForm } from '@/types/pressRelease';

import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

interface AdditionalInfoSectionProps {
  control: Control<MediaRegistrationForm>;
}

export default function AdditionalInfoSection({ control }: AdditionalInfoSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
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
        control={control}
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
    </div>
  );
}
