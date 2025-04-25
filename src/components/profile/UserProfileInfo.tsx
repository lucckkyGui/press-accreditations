
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Building } from "lucide-react";
import { format } from "date-fns";
import UserRoleBadge from "./UserRoleBadge";

interface UserProfileInfoProps {
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role?: string;
    createdAt?: Date;
    company?: string;
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

  return (
    <Card className="overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-500/20 to-brand-600/20" />
      <CardHeader className="relative pt-8 pb-2">
        <CardTitle>Profil użytkownika</CardTitle>
        <CardDescription>Zarządzaj swoimi danymi osobowymi</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-semibold">{getFullName()}</h3>
              <UserRoleBadge role={user.role} />
            </div>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.company && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{user.company}</span>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Konto utworzone: {format(new Date(user.createdAt), "dd.MM.yyyy")}</span>
                </div>
              )}
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
