
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail } from "lucide-react";

interface UserProfileInfoProps {
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role?: string;
  };
  onEditProfile: () => void;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user, onEditProfile }) => {
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getFullName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    }
    return "Użytkownik";
  };

  const capitalizeRole = (role?: string) => {
    if (!role) return "Gość";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Profil użytkownika</CardTitle>
        <CardDescription>Zarządzaj swoimi danymi osobowymi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-semibold">{getFullName()}</h3>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Rola: {capitalizeRole(user.role)}</span>
            </div>
          </div>
          
          <Button onClick={onEditProfile} variant="outline" className="mt-4 sm:mt-0">
            Edytuj profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileInfo;
