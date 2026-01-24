
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { AccreditationForm } from "@/components/accreditation/AccreditationForm";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";

// Przykładowe dane wydarzenia
const getMockEvent = (eventId: string) => {
  // Tutaj normalnie pobralibyśmy dane z API na podstawie eventId
  return {
    id: eventId,
    title: "Summer Music Festival 2025",
    titlePl: "Letni Festiwal Muzyczny 2025",
    location: "Warsaw, Poland",
    locationPl: "Warszawa, Polska",
    startDate: "2025-06-15T10:00:00",
    endDate: "2025-06-17T22:00:00",
    description: "The biggest summer music festival in Eastern Europe",
    descriptionPl: "Największy letni festiwal muzyczny w Europie Wschodniej",
    deadline: "2025-05-15T23:59:59"
  };
};

const AccreditationRequest = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (eventId) {
      // W rzeczywistej aplikacji tutaj pobieramy dane wydarzenia z API
      setEventData(getMockEvent(eventId));
    }
  }, [eventId]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    
    // Symulacja wysyłania formularza
    try {
      // W rzeczywistej aplikacji tutaj wysyłamy dane do API
      console.log("Submitting accreditation form:", formData);
      
      // Symuluj opóźnienie wysyłania
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Oznacz formularz jako wysłany
      setIsSubmitted(true);
      
      // Wyświetl powiadomienie o sukcesie
      toast.success(t('accreditation.requestSubmitted'));
    } catch (error) {
      console.error("Error submitting accreditation form:", error);
      toast.error(t('accreditation.requestError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Jeśli formularz został wysłany, pokaż komunikat potwierdzający
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t('accreditation.thankYou')}</CardTitle>
              <CardDescription className="text-center">
                {t('accreditation.requestReceived')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                {t('accreditation.confirmationSent')}
              </p>
              
              <div className="flex justify-center gap-4 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/accreditation-categories")}
                >
                  {t('accreditation.browseMoreEvents')}
                </Button>
                <Button 
                  onClick={() => user ? navigate("/dashboard") : navigate("/")}
                >
                  {user ? t('navigation.dashboard') : t('common.backToHome')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Jeśli dane wydarzenia nie są jeszcze załadowane, pokaż loader
  if (!eventData) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'en' ? eventData.title : eventData.titlePl}
            </CardTitle>
            <CardDescription>
              {currentLanguage === 'en' ? eventData.location : eventData.locationPl}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{currentLanguage === 'en' ? eventData.description : eventData.descriptionPl}</p>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>{t('accreditation.deadlineAlert')}</AlertTitle>
              <AlertDescription>
                {t('accreditation.deadlineDescription', { 
                  date: new Date(eventData.deadline).toLocaleDateString(
                    currentLanguage === 'en' ? 'en-US' : 'pl-PL',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  ) 
                })}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{t('accreditation.requestForm')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('accreditation.fillForm')}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <AccreditationForm
              eventId={eventId || ""}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccreditationRequest;
