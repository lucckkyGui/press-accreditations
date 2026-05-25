
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Mail, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type AccreditationStatus = "pending" | "approved" | "rejected" | "expired";

interface AccreditationRequest {
  id: string;
  name: string;
  mediaOutlet: string;
  role: string;
  email: string;
  eventName: string;
  requestDate: string;
  status: AccreditationStatus;
}

interface AccreditationManagementProps {
  eventId?: string;
  title?: string;
  description?: string;
}

export const AccreditationManagement: React.FC<AccreditationManagementProps> = ({
  eventId,
  title = "Press Accreditation Requests",
  description = "Manage media accreditation requests for your events",
}) => {
  const [requests, setRequests] = useState<AccreditationRequest[]>([
    {
      id: "req-001",
      name: "John Smith",
      mediaOutlet: "Tech Today",
      role: "Reporter",
      email: "john@techtoday.com",
      eventName: "Tech Conference 2025",
      requestDate: "2025-03-01",
      status: "pending"
    },
    {
      id: "req-002",
      name: "Sarah Johnson",
      mediaOutlet: "City News",
      role: "Photographer",
      email: "sarah@citynews.com",
      eventName: "Tech Conference 2025",
      requestDate: "2025-03-02",
      status: "pending"
    },
    {
      id: "req-003",
      name: "Mike Williams",
      mediaOutlet: "Digital Media Hub",
      role: "Videographer",
      email: "mike@digitalmedia.com",
      eventName: "Tech Conference 2025",
      requestDate: "2025-03-03",
      status: "pending"
    }
  ]);
  
  const [selectedRequest, setSelectedRequest] = useState<AccreditationRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "view" | null>(null);
  const [comment, setComment] = useState("");
  
  const { playSoundEffect } = useSoundEffects();

  const handleView = (request: AccreditationRequest) => {
    setSelectedRequest(request);
    setActionType("view");
    setIsDialogOpen(true);
  };

  const handleApprove = (request: AccreditationRequest) => {
    setSelectedRequest(request);
    setActionType("approve");
    setComment("");
    setIsDialogOpen(true);
  };

  const handleReject = (request: AccreditationRequest) => {
    setSelectedRequest(request);
    setActionType("reject");
    setComment("");
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "view") {
      setIsDialogOpen(false);
      return;
    }

    // Update the request status
    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: actionType === "approve" ? "approved" as const : "rejected" as const
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setIsDialogOpen(false);

    // Show notification
    if (actionType === "approve") {
      playSoundEffect("success");
      toast.success("Accreditation request approved!", {
        description: `Approval notification sent to ${selectedRequest.name}`
      });
    } else {
      playSoundEffect("notification");
      toast.info("Accreditation request rejected", {
        description: `Notification sent to ${selectedRequest.name}`
      });
    }
  };

  const getStatusBadge = (status: AccreditationStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex gap-1 items-center"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600 flex gap-1 items-center"><Check className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex gap-1 items-center"><X className="h-3 w-3" /> Rejected</Badge>;
      case "expired":
        return <Badge variant="secondary" className="flex gap-1 items-center"><Clock className="h-3 w-3" /> Expired</Badge>;
    }
  };

  const filteredRequests = eventId 
    ? requests.filter(req => req.eventName.includes(eventId))
    : requests;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Media Outlet</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{request.mediaOutlet}</TableCell>
                    <TableCell>{request.role}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(request)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleApprove(request)} className="text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleReject(request)} className="text-red-600">
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
                  <TableCell colSpan={6} className="text-center py-6">No accreditation requests found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Accreditation Request" : 
               actionType === "reject" ? "Reject Accreditation Request" : 
               "Accreditation Request Details"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "view" ? 
                "View the details of this accreditation request" :
                "Add optional comments to include in the notification email"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <h4 className="text-sm font-medium">Name</h4>
                  <p className="text-sm">{selectedRequest.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Email</h4>
                  <p className="text-sm">{selectedRequest.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Media Outlet</h4>
                  <p className="text-sm">{selectedRequest.mediaOutlet}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Role</h4>
                  <p className="text-sm">{selectedRequest.role}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Event</h4>
                  <p className="text-sm">{selectedRequest.eventName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Request Date</h4>
                  <p className="text-sm">{selectedRequest.requestDate}</p>
                </div>
              </div>

              {actionType !== "view" && (
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium mb-1">
                    Comments (optional)
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Add comments to include in the notification email..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {actionType === "view" ? (
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmAction} 
                  variant={actionType === "approve" ? "default" : "destructive"}
                  className="gap-2"
                >
                  {actionType === "approve" ? (
                    <>
                      <Check className="h-4 w-4" /> Approve Request
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" /> Reject Request
                    </>
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
