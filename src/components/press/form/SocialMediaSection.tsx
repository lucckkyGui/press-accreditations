
import React from 'react';
import { Control } from 'react-hook-form';
import { MediaRegistrationForm } from '@/types/pressRelease';

import { Input } from '@/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

interface SocialMediaSectionProps {
  control: Control<MediaRegistrationForm>;
}

export default function SocialMediaSection({ control }: SocialMediaSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Social Media Profiles</h3>
      
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
  );
}
