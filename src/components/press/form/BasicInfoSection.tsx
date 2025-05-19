
import React from 'react';
import { Control } from 'react-hook-form';
import { MediaRegistrationForm } from '@/types/pressRelease';

import { Input } from '@/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

interface BasicInfoSectionProps {
  control: Control<MediaRegistrationForm>;
}

export default function BasicInfoSection({ control }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
    </div>
  );
}
