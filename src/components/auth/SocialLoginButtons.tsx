
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Provider = "google" | "facebook" | "linkedin_oidc";

export const SocialLoginButtons = () => {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleSocialLogin = async (provider: Provider) => {
    setLoadingProvider(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: Error | unknown) {
      toast.error(`Nie udało się zalogować przez ${getProviderName(provider)}. ${error.message || ''}`);
      setLoadingProvider(null);
    }
  };

  const getProviderName = (provider: Provider) => {
    switch (provider) {
      case "google":
        return "Google";
      case "facebook":
        return "Facebook";
      case "linkedin_oidc":
        return "LinkedIn";
      default:
        return provider;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialLogin("google")}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === "google" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg 
            viewBox="0 0 48 48" 
            className="h-5 w-5" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M47.532 24.553c0-1.632-.132-3.254-.401-4.857H24.265v9.2h13.08c-.558 3.033-2.28 5.615-4.843 7.326v6.063h7.842c4.588-4.22 7.23-10.434 7.23-17.732Z" fill="#4285F4"/>
            <path d="M24.265 48c6.553 0 12.032-2.149 16.039-5.816l-7.842-6.063c-2.169 1.464-4.951 2.325-8.197 2.325-6.33 0-11.686-4.264-13.596-9.994H2.516v6.255C6.488 42.452 14.709 48 24.265 48Z" fill="#34A853"/>
            <path d="M10.669 28.452c-.486-1.464-.761-3.034-.761-4.64 0-1.607.275-3.177.76-4.64v-6.256H2.517C.907 16.558 0 20.427 0 24.352c0 3.926.907 7.794 2.517 11.196l8.152-7.096Z" fill="#FBBC05"/>
            <path d="M24.265 9.719c3.567 0 6.768 1.221 9.28 3.635l6.953-6.926C36.436 2.478 30.957 0 24.266 0 14.71 0 6.488 5.547 2.516 13.292l8.153 6.256c1.91-5.73 7.266-9.829 13.596-9.829Z" fill="#EA4335"/>
          </svg>
        )}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialLogin("facebook")}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === "facebook" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg 
            className="h-5 w-5 text-[#1877F2]" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.286C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
          </svg>
        )}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialLogin("linkedin_oidc")}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === "linkedin_oidc" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg 
            className="h-5 w-5 text-[#0A66C2]" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )}
      </Button>
    </div>
  );
};
