import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AccreditationRequest {
  id: string;
  media_organization: string | null;
  email: string;
}

interface PendingAccreditationsCardProps {
  requests: AccreditationRequest[];
}

const PendingAccreditationsCard: React.FC<PendingAccreditationsCardProps> = ({ requests }) => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-foreground">Oczekujące akredytacje</CardTitle>
            <Badge variant={requests.length ? "default" : "secondary"} className="rounded-md">
              {requests.length}
            </Badge>
          </div>
          <CardDescription className="mt-1">Prośby wymagające Twojej decyzji</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/guests')} className="gap-1 rounded-lg text-primary hover:bg-primary/10">
          Otwórz
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-8 text-center text-muted-foreground">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-success/15">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <p className="font-medium text-foreground">Brak oczekujących akredytacji</p>
            <p className="mt-1 text-sm">Kolejka decyzji jest aktualnie czysta.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 4).map((request) => (
              <div key={request.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3.5 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{request.media_organization}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{request.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/guests')} className="h-8 shrink-0 rounded-lg text-xs">
                  Przejdź do obsługi
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingAccreditationsCard;
