
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Database, CheckCircle, ChevronDown, File } from "lucide-react";

export function IntegrationGuide() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Integracja z Supabase
        </CardTitle>
        <CardDescription>
          Przygotuj swoją aplikację do integracji z Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">Modele danych</h3>
              <p className="text-xs text-muted-foreground">
                Modele danych są już przygotowane do integracji z Supabase.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">Service API</h3>
              <p className="text-xs text-muted-foreground">
                Interfejsy serwisów API są gotowe do implementacji z Supabase.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">Obsługa offline</h3>
              <p className="text-xs text-muted-foreground">
                Aplikacja wspiera tryb offline z synchronizacją danych.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">PWA</h3>
              <p className="text-xs text-muted-foreground">
                Aplikacja działa jako Progressive Web App.
              </p>
            </div>
          </div>
        </div>

        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">
              Potrzebujesz więcej informacji?
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md bg-muted p-4">
              <h5 className="mb-2 font-medium">Kroki integracji z Supabase</h5>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                <li>Utwórz projekt w Supabase</li>
                <li>Zaimplementuj uwierzytelnianie użytkowników</li>
                <li>Skonfiguruj tabele bazy danych zgodnie z modelami</li>
                <li>Utwórz RLS polityki dostępu</li>
                <li>Zaimplementuj Edge Functions dla zaawansowanej logiki</li>
                <li>Skonfiguruj Storage dla plików</li>
                <li>Migruj dane z localStorage do Supabase</li>
              </ol>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center text-xs gap-1">
                  <File className="h-3 w-3" />
                  <span>supabase.ts</span>
                </div>
                <Button variant="outline" size="sm">
                  Zobacz przykład
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Rozpocznij integrację z Supabase</Button>
      </CardFooter>
    </Card>
  );
}
