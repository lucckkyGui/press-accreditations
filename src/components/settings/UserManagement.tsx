
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit2, MoreHorizontal, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "pending" | "disabled";
  lastLogin?: Date;
};

const mockUsers: User[] = [];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "viewer" as "admin" | "editor" | "viewer",
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "pending",
    };

    setUsers([...users, user]);
    toast.success(`Zaproszenie zostało wysłane do ${newUser.email}`);
    setIsAddUserOpen(false);
    setNewUser({
      name: "",
      email: "",
      role: "viewer",
    });
  };

  const handleEditUser = () => {
    if (!currentUser) return;

    setUsers(
      users.map((user) => (user.id === currentUser.id ? currentUser : user))
    );
    toast.success(`Zaktualizowano dane użytkownika ${currentUser.name}`);
    setIsEditUserOpen(false);
    setCurrentUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((user) => user.id === userId);
    if (!userToDelete) return;

    if (
      window.confirm(
        `Czy na pewno chcesz usunąć użytkownika ${userToDelete.name}?`
      )
    ) {
      setUsers(users.filter((user) => user.id !== userId));
      toast.success(`Użytkownik ${userToDelete.name} został usunięty`);
    }
  };

  const handleResendInvitation = (userId: string) => {
    const userToResend = users.find((user) => user.id === userId);
    if (!userToResend) return;

    toast.success(
      `Ponownie wysłano zaproszenie do użytkownika ${userToResend.email}`
    );
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          const newStatus = user.status === "active" ? "disabled" : "active";
          return { ...user, status: newStatus };
        }
        return user;
      })
    );

    const user = users.find((u) => u.id === userId);
    if (user) {
      const action = user.status === "active" ? "dezaktywowano" : "aktywowano";
      toast.success(`Użytkownik ${user.name} został ${action}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Zarządzanie użytkownikami</h3>
        <Button onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Zaproś użytkownika
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rola</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ostatnie logowanie</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${
                    user.role === "admin"
                      ? "border-primary text-primary"
                      : user.role === "editor"
                      ? "border-blue-500 text-blue-500"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  {user.role === "admin"
                    ? "Administrator"
                    : user.role === "editor"
                    ? "Edytor"
                    : "Przeglądający"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.status === "active"
                      ? "default"
                      : user.status === "pending"
                      ? "outline"
                      : "secondary"
                  }
                >
                  {user.status === "active"
                    ? "Aktywny"
                    : user.status === "pending"
                    ? "Oczekujący"
                    : "Dezaktywowany"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLogin
                  ? user.lastLogin.toLocaleString()
                  : "Nigdy nie zalogowany"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setCurrentUser(user);
                        setIsEditUserOpen(true);
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edytuj
                    </DropdownMenuItem>
                    {user.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() => handleResendInvitation(user.id)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Wyślij ponownie
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleToggleUserStatus(user.id)}
                    >
                      {user.status === "active" ? (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Dezaktywuj
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Aktywuj
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaproś nowego użytkownika</DialogTitle>
            <DialogDescription>
              Zaproszenie zostanie wysłane na podany adres email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Imię i nazwisko</Label>
              <Input
                id="name"
                placeholder="Jan Kowalski"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jan@example.com"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rola</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "admin" | "editor" | "viewer") =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Wybierz rolę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="editor">Edytor</SelectItem>
                  <SelectItem value="viewer">Przeglądający</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddUserOpen(false)}
            >
              Anuluj
            </Button>
            <Button onClick={handleAddUser}>Zaproś</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj użytkownika</DialogTitle>
            <DialogDescription>
              Zmień dane lub uprawnienia użytkownika.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Imię i nazwisko</Label>
                <Input
                  id="edit-name"
                  value={currentUser.name}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rola</Label>
                <Select
                  value={currentUser.role}
                  onValueChange={(value: "admin" | "editor" | "viewer") =>
                    setCurrentUser({ ...currentUser, role: value })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="editor">Edytor</SelectItem>
                    <SelectItem value="viewer">Przeglądający</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={currentUser.status}
                  onValueChange={(value: "active" | "pending" | "disabled") =>
                    setCurrentUser({ ...currentUser, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywny</SelectItem>
                    <SelectItem value="pending">Oczekujący</SelectItem>
                    <SelectItem value="disabled">Dezaktywowany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditUserOpen(false)}
            >
              Anuluj
            </Button>
            <Button onClick={handleEditUser}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
