import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  isOrganizer: boolean;
}

export default function EmptyState({ isOrganizer }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Calendar icon — dashed border */}
      <div className="relative w-16 h-16 mb-5 grid place-items-center">
        <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl opacity-60" />
        <div className="relative w-14 h-14 rounded-xl border-2 border-dashed border-border bg-muted/30 grid place-items-center text-muted-foreground">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 3v4M16 3v4" />
          </svg>
        </div>
      </div>

      <h3 className="text-[15px] font-semibold text-foreground mb-1">
        {isOrganizer ? 'Brak zgłoszeń mediów' : 'Nie złożyłeś jeszcze wniosku'}
      </h3>

      <p className="serif-italic text-sm text-muted-foreground mb-1">
        ale to się zaraz zmieni.
      </p>

      <p className="text-[12px] text-muted-foreground max-w-xs mb-6">
        {isOrganizer
          ? 'Żaden dziennikarz nie złożył jeszcze wniosku akredytacyjnego na to wydarzenie.'
          : 'Wypełnij formularz akredytacyjny, aby ubiegać się o dostęp prasowy.'}
      </p>

      {!isOrganizer && (
        <Button
          className="rounded-md gap-1.5 bg-primary hover:bg-primary/90 glow-accent"
          onClick={() => navigate('/accreditation')}
        >
          <Plus className="h-3.5 w-3.5" />
          Złóż wniosek
        </Button>
      )}
    </div>
  );
}
