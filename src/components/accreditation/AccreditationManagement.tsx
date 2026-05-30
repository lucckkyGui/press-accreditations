import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, CheckCircle, XCircle, Clock, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type AccreditationStatus = "pending" | "approved" | "rejected" | "expired";

interface AccreditationRequest {
  id: string;
  media_name: string;
  media_type: string;
  contact_email: string;
  contact_phone: string | null;
  website_url: string | null;
  request_notes: string | null;
  approval_notes: string | null;
  status: AccreditationStatus;
  created_at: string | null;
  event_id: string;
}

interface AccreditationManagementProps {
  eventId?: string;
  title?: string;
  description?: string;
}

const STATUS_MAP: Record<AccreditationStatus, React.ReactNode> = {
  pending:  <Badge variant="outline"    className="flex gap-1 items-center"><Clock       className="h-3 w-3" /> Oczekuje</Badge>,
  approved: <Badge className="flex gap-1 items-center bg-green-600 hover:bg-green-600"><Check className="h-3 w-3" /> Zatwierdzone</Badge>,
  rejected: <Badge variant="destructive" className="flex gap-1 items-center"><X          className="h-3 w-3" /> Odrzucone</Badge>,
  expired:  <Badge variant="secondary"  className="flex gap-1 items-center"><Clock       className="h-3 w-3" /> Wygasłe</Badge>,
};

export const AccreditationManagement: React.FC<AccreditationManagementProps> = ({
  eventId,
  title = "Wnioski akredytacyjne",
  description = "Zarządzaj wnioskami o akredytację prasową dla swoich wydarzeń",
}) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { playSoundEffect } = useSoundEffects();

  const [selectedRequest, setSelectedRequest] = useState<AccreditationRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "view" | null>(null);
  const [comment, setComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryKey = ["accreditation_requests", eventId ?? "all"];

  const { data: requests = [], isLoading } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("accreditation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventId) q = q.eq("event_id", eventId);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AccreditationRequest[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      approval_notes,
    }: {
      id: string;
      status: "approved" | "rejected";
      approval_notes: string;
    }) => {
      const { error } = await supabase
        .from("accreditation_requests")
        .update({
          status,
          approval_notes: approval_notes || null,
          approved_by: user!.id,
          approval_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status, id }) => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ["sidebarCounts"] });
      setIsDialogOpen(false);
      if (status === "approved") {
        playSoundEffect("success");
        toast.success("Wniosek zatwierdzony", {
          description: `Powiadomienie wysłane do wnioskodawcy.`,
        });
      } else {
        playSoundEffect("notification");
        toast.info("Wniosek odrzucony", {
          description: `Powiadomienie wysłane do wnioskodawcy.`,
        });
      }
    },
    onError: (err) => {
      toast.error("Błąd aktualizacji", { description: String(err) });
    },
  });

  const openDialog = (req: AccreditationRequest, action: "approve" | "reject" | "view") => {
    setSelectedRequest(req);
    setActionType(action);
    setComment("");
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType || actionType === "view") {
      setIsDialogOpen(false);
      return;
    }
    updateMutation.mutate({
      id: selectedRequest.id,
      status: actionType === "approve" ? "approved" : "rejected",
      approval_notes: comment,
    });
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medium / outlet</TableHead>
                  <TableHead>Typ mediów</TableHead>
                  <TableHead>E-mail kontaktowy</TableHead>
                  <TableHead>Data wniosku</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.media_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{req.media_type}</TableCell>
                      <TableCell className="text-sm">{req.contact_email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(req.created_at)}</TableCell>
                      <TableCell>{STATUS_MAP[req.status] ?? <Badge variant="outline">{req.status}</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDialog(req, "view")} title="Podgląd">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.website_url && (
                            <Button variant="ghost" size="sm" asChild title="Strona medium">
                              <a href={req.website_url} target="_blank" rel="noreferrer">
                                <Globe className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {req.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => openDialog(req, "approve")}
                                title="Zatwierdź"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => openDialog(req, "reject")}
                                title="Odrzuć"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      Brak wniosków akredytacyjnych
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Zatwierdź wniosek akredytacyjny"
                : actionType === "reject"
                ? "Odrzuć wniosek akredytacyjny"
                : "Szczegóły wniosku"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "view"
                ? "Podgląd szczegółów wniosku"
                : "Dodaj opcjonalny komentarz dołączony do powiadomienia e-mail"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground mb-0.5">Medium</p>
                  <p>{selectedRequest.media_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-0.5">Typ</p>
                  <p>{selectedRequest.media_type}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-0.5">E-mail</p>
                  <p>{selectedRequest.contact_email}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-0.5">Telefon</p>
                  <p>{selectedRequest.contact_phone || "—"}</p>
                </div>
                {selectedRequest.website_url && (
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground mb-0.5">Strona</p>
                    <a
                      href={selectedRequest.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2 break-all"
                    >
                      {selectedRequest.website_url}
                    </a>
                  </div>
                )}
                {selectedRequest.request_notes && (
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground mb-0.5">Uwagi wnioskodawcy</p>
                    <p className="text-muted-foreground">{selectedRequest.request_notes}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-muted-foreground mb-0.5">Data złożenia</p>
                  <p>{formatDate(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-0.5">Status</p>
                  <p>{STATUS_MAP[selectedRequest.status]}</p>
                </div>
              </div>

              {actionType !== "view" && (
                <div>
                  <label htmlFor="approval-comment" className="block text-sm font-medium mb-1.5">
                    Komentarz (opcjonalny)
                  </label>
                  <Textarea
                    id="approval-comment"
                    placeholder="Dodaj komentarz do powiadomienia e-mail…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {actionType === "view" ? (
              <Button onClick={() => setIsDialogOpen(false)}>Zamknij</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={updateMutation.isPending}>
                  Anuluj
                </Button>
                <Button
                  onClick={confirmAction}
                  variant={actionType === "approve" ? "default" : "destructive"}
                  disabled={updateMutation.isPending}
                  className="gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : actionType === "approve" ? (
                    <><Check className="h-4 w-4" /> Zatwierdź</>
                  ) : (
                    <><X className="h-4 w-4" /> Odrzuć</>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccreditationManagement;
