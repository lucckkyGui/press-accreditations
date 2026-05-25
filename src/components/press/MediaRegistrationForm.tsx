
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMediaRegistrations } from '@/hooks/press';
import { MediaRegistrationForm as MediaRegistrationFormType, SocialMedia } from '@/types/pressRelease';

import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import form section components
import BasicInfoSection from './form/BasicInfoSection';
import SocialMediaSection from './form/SocialMediaSection';
import AdditionalInfoSection from './form/AdditionalInfoSection';
import FormActions from './form/FormActions';

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
        socialMedia[key as keyof SocialMedia] = value.trim();
      }
    });

    const formData: MediaRegistrationFormType = {
      ...data,
      eventId, // Fix here: Just use the value directly, not as a function call
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
            <BasicInfoSection control={form.control} />
            <SocialMediaSection control={form.control} />
            <AdditionalInfoSection control={form.control} />
            <FormActions isSubmitting={isSubmitting} onCancel={onSuccess} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
