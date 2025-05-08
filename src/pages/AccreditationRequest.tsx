
import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/hooks/useI18n";
import { ArrowLeft, Upload, Check, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  mediaOutlet: z.string().min(2, "Media outlet name is required"),
  role: z.string().min(2, "Your role in the media outlet is required"),
  eventId: z.string().optional(),
  pressCardId: z.string().optional(),
  description: z.string().min(10, "Please provide a brief description of your coverage plans"),
  previousCoverage: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const AccreditationRequest = () => {
  const navigate = useNavigate();
  const { playSoundEffect } = useSoundEffects();
  const { t } = useI18n();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.user_metadata?.first_name || "",
      lastName: user?.user_metadata?.last_name || "",
      email: user?.email || "",
      phone: "",
      mediaOutlet: "",
      role: "",
      eventId: "",
      pressCardId: "",
      description: "",
      previousCoverage: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Here you would submit the data to your backend
      console.log("Submitting accreditation request:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      playSoundEffect("success");
      toast.success("Your accreditation request has been submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      playSoundEffect("error");
      toast.error("Failed to submit accreditation request. Please try again.");
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Request Press Accreditation</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Media Accreditation Form</CardTitle>
            <CardDescription>
              Fill out this form to request press credentials for an event. 
              All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
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
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mediaOutlet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media Outlet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of publication/channel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="reporter">Reporter</SelectItem>
                            <SelectItem value="photographer">Photographer</SelectItem>
                            <SelectItem value="videographer">Videographer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="producer">Producer</SelectItem>
                            <SelectItem value="social_media">Social Media Manager</SelectItem>
                            <SelectItem value="blogger">Blogger/Influencer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Event</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl className="flex-1">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an event" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="event1">Tech Conference 2025</SelectItem>
                              <SelectItem value="event2">Music Festival 2025</SelectItem>
                              <SelectItem value="event3">Film Premiere: New Horizons</SelectItem>
                              <SelectItem value="event4">Sports Championship Finals</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <Button variant="outline" size="icon" type="button" onClick={() => navigate('/events')}>
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pressCardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Press Card ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your press card ID if available" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Coverage *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe your intended coverage (e.g., article, photo essay, interview, etc.)" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previousCoverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Coverage Examples</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Links to your previous work or coverage (optional)" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-start space-x-2 pt-2">
                  <Button variant="outline" size="icon" type="button" disabled>
                    <Upload className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Document upload feature coming soon. You will be able to upload press credentials or work samples.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none">
                          I accept the terms and conditions *
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          By submitting this form, I confirm that the information provided is accurate and I agree to the accreditation terms and conditions.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              className="gap-2"
            >
              <Check className="h-4 w-4" /> Submit Application
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AccreditationRequest;
