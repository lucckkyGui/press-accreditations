
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Guest, GuestStatus, GuestZone } from "@/types";
import { Plus, Search, QrCode } from "lucide-react";
import GuestTable from "@/components/guests/GuestTable";
import ImportGuestsDialog from "@/components/guests/ImportGuestsDialog";
import GuestDetails from "@/components/guests/GuestDetails";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { InputWithIcon } from "@/components/ui/input-with-icon";

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@example.com",
      company: "ABC Corp",
      phone: "+48123456789",
      zone: "vip",
      status: "confirmed",
      qrCode: "mock-qr-code-1",
      invitationSentAt: new Date(2023, 3, 1),
      invitationOpenedAt: new Date(2023, 3, 2),
    },
    {
      id: "2",
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna.nowak@example.com",
      company: "XYZ Media",
      zone: "press",
      status: "invited",
      qrCode: "mock-qr-code-2",
      invitationSentAt: new Date(2023, 3, 1),
    },
    {
      id: "3",
      firstName: "Piotr",
      lastName: "Wiśniewski",
      email: "piotr.wisniewski@example.com",
      company: "Event Staff",
      zone: "staff",
      status: "checked-in",
      qrCode: "mock-qr-code-3",
      invitationSentAt: new Date(2023, 3, 1),
      invitationOpenedAt: new Date(2023, 3, 1),
      checkedInAt: new Date(2023, 3, 10, 9, 30),
    },
    {
      id: "4",
      firstName: "Marta",
      lastName: "Zielińska",
      email: "marta.zielinska@example.com",
      company: "",
      zone: "general",
      status: "declined",
      qrCode: "mock-qr-code-4",
      invitationSentAt: new Date(2023, 3, 1),
      invitationOpenedAt: new Date(2023, 3, 3),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentQRGuest, setCurrentQRGuest] = useState<Guest | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      searchQuery === "" ||
      `${guest.firstName} ${guest.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.company &&
        guest.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZone =
      zoneFilter === "all" || guest.zone === zoneFilter;

    const matchesStatus =
      statusFilter === "all" || guest.status === statusFilter;

    return matchesSearch && matchesZone && matchesStatus;
  });

  const handleImportGuests = (importedGuests: Guest[]) => {
    setGuests([...guests, ...importedGuests]);
    toast.success(`Zaimportowano ${importedGuests.length} gości`);
  };

  const handleViewQR = (guest: Guest) => {
    setCurrentQRGuest(guest);
    setQrDialogOpen(true);
  };

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setDetailsDialogOpen(true);
  };

  const handleEditGuest = (guest: Guest) => {
    console.log("Edycja gościa:", guest);
    // W rzeczywistej aplikacji tutaj byłoby otwieranie formularza edycji
    toast.info("Funkcja edycji gościa będzie dostępna w pełnej wersji");
  };

  const handleDeleteGuest = (guest: Guest) => {
    if (window.confirm(`Czy na pewno chcesz usunąć gościa ${guest.firstName} ${guest.lastName}?`)) {
      setGuests(guests.filter((g) => g.id !== guest.id));
      toast.success("Gość został usunięty");
    }
  };

  const handleResendInvite = (guest: Guest) => {
    console.log("Ponowna wysyłka zaproszenia do:", guest);
    // W rzeczywistej aplikacji tutaj byłaby logika ponownej wysyłki
    toast.success(`Zaproszenie wysłane ponownie do ${guest.firstName} ${guest.lastName}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goście</h1>
            <p className="text-muted-foreground">
              Zarządzaj listą gości, wysyłaj zaproszenia.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
            <ImportGuestsDialog onImport={handleImportGuests} />
            <Button variant="outline" className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj gościa
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-72">
            <InputWithIcon
              placeholder="Szukaj po nazwisku, emailu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Wszystkie strefy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie strefy</SelectItem>
                <SelectItem value="general">Ogólna</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="press">Press</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Wszystkie statusy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                <SelectItem value="invited">Zaproszeni</SelectItem>
                <SelectItem value="confirmed">Potwierdzeni</SelectItem>
                <SelectItem value="declined">Odrzuceni</SelectItem>
                <SelectItem value="checked-in">Obecni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <GuestTable 
          guests={filteredGuests}
          onViewQR={handleViewQR}
          onEdit={handleEditGuest}
          onDelete={handleDeleteGuest}
          onResendInvite={handleResendInvite}
          onViewDetails={handleViewDetails}
        />
      </div>
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kod QR gościa</DialogTitle>
          </DialogHeader>
          
          {currentQRGuest && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-md">
                {/* W rzeczywistej aplikacji tutaj byłby rzeczywisty kod QR */}
                <div className="h-48 w-48 bg-gray-200 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-primary" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-medium">
                  {currentQRGuest.firstName} {currentQRGuest.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentQRGuest.email}
                </p>
                {currentQRGuest.company && (
                  <p className="text-sm text-muted-foreground">
                    {currentQRGuest.company}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <GuestDetails 
        guest={selectedGuest} 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen} 
      />
    </MainLayout>
  );
};

export default Guests;
