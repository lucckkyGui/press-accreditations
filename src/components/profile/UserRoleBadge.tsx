
import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Building, Crown } from "lucide-react";

interface UserRoleBadgeProps {
  role?: string;
  className?: string;
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role, className = "" }) => {
  const getRoleBadge = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return (
          <Badge variant="destructive" className={`flex gap-1 items-center ${className}`}>
            <Crown className="h-3 w-3" />
            <span>Admin</span>
          </Badge>
        );
      case 'organizer':
        return (
          <Badge variant="default" className={`bg-amber-500 hover:bg-amber-600 flex gap-1 items-center ${className}`}>
            <Building className="h-3 w-3" />
            <span>Organizator</span>
          </Badge>
        );
      case 'staff':
        return (
          <Badge variant="secondary" className={`flex gap-1 items-center ${className}`}>
            <User className="h-3 w-3" />
            <span>Staff</span>
          </Badge>
        );
      case 'guest':
      default:
        return (
          <Badge variant="outline" className={`flex gap-1 items-center ${className}`}>
            <User className="h-3 w-3" />
            <span>Gość</span>
          </Badge>
        );
    }
  };

  return getRoleBadge();
};

export default UserRoleBadge;
