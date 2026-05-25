
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, X, Download, Eye } from "lucide-react";

type AccreditationStatus = "pending" | "approved" | "rejected" | "expired";

interface AccreditationStatusCardProps {
  status: AccreditationStatus;
  eventName: string;
  requestDate: string;
  responseDate?: string;
  eventDate: string;
  comments?: string;
  onViewDetails: () => void;
}

const getStatusDetails = (status: AccreditationStatus) => {
  switch (status) {
    case "pending":
      return {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        icon: <Clock className="h-4 w-4" />,
        label: "Pending Review"
      };
    case "approved":
      return {
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: <Check className="h-4 w-4" />,
        label: "Approved"
      };
    case "rejected":
      return {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: <X className="h-4 w-4" />,
        label: "Rejected"
      };
    case "expired":
      return {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        icon: <Clock className="h-4 w-4" />,
        label: "Expired"
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        icon: <Clock className="h-4 w-4" />,
        label: "Unknown"
      };
  }
};

export const AccreditationStatusCard = ({
  status,
  eventName,
  requestDate,
  responseDate,
  eventDate,
  comments,
  onViewDetails
}: AccreditationStatusCardProps) => {
  const statusDetails = getStatusDetails(status);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{eventName}</CardTitle>
            <CardDescription>Request sent: {requestDate}</CardDescription>
          </div>
          <Badge className={`${statusDetails.color} flex items-center gap-1 px-2 py-1`}>
            {statusDetails.icon}
            {statusDetails.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Event date:</span> {eventDate}
        </div>
        {responseDate && (
          <div className="text-sm">
            <span className="font-medium">Response date:</span> {responseDate}
          </div>
        )}
        {comments && (
          <div className="text-sm mt-2">
            <span className="font-medium">Comments:</span>
            <p className="text-muted-foreground mt-1">{comments}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="gap-1" onClick={onViewDetails}>
          <Eye className="h-4 w-4" /> View Details
        </Button>
        {status === "approved" && (
          <Button size="sm" className="gap-1">
            <Download className="h-4 w-4" /> Download Badge
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

interface AccreditationListProps {
  accreditations: {
    id: string;
    eventName: string;
    status: AccreditationStatus;
    requestDate: string;
    responseDate?: string;
    eventDate: string;
    comments?: string;
  }[];
  onViewDetails: (id: string) => void;
}

const AccreditationList = ({ accreditations, onViewDetails }: AccreditationListProps) => {
  if (accreditations.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No accreditation requests found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accreditations.map((accreditation) => (
        <AccreditationStatusCard
          key={accreditation.id}
          status={accreditation.status}
          eventName={accreditation.eventName}
          requestDate={accreditation.requestDate}
          responseDate={accreditation.responseDate}
          eventDate={accreditation.eventDate}
          comments={accreditation.comments}
          onViewDetails={() => onViewDetails(accreditation.id)}
        />
      ))}
    </div>
  );
};

export default AccreditationList;
