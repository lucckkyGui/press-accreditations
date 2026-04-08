import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccreditationRequest {
  id: string;
  media_name: string;
  contact_email: string;
}

interface PendingAccreditationsCardProps {
  requests: AccreditationRequest[];
}

const PendingAccreditationsCard: React.FC<PendingAccreditationsCardProps> = ({ requests }) => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">Oczekujące akredytacje</CardTitle>
          <CardDescription className="mt-1">Prośby wymagające Twojej decyzji</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/guests')} className="text-primary gap-1 hover:bg-primary/10">
          Zobacz wszystkie
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-success/15 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <p className="font-medium text-foreground">Brak oczekujących akredytacji</p>
            <p className="text-sm mt-1">Wszystko jest na bieżąco 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 4).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 transition-colors">
                <div>
                  <p className="font-medium text-sm text-foreground">{request.media_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{request.contact_email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">Odrzuć</Button>
                  <Button size="sm" className="rounded-lg text-xs h-8">Zaakceptuj</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingAccreditationsCard;
