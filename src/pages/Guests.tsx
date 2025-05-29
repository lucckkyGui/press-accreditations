import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Guest, GuestStatus, GuestZone } from "@/types";
import { Download, Mail, Plus, Search, Trash2, Upload, UserCheck, Users, X, FileDown } from "lucide-react";
import GuestTable from "@/components/guests/GuestTable";
import ImportGuestsDialog from "@/components/guests/ImportGuestsDialog";
import GuestDetails from "@/components/guests/GuestDetails";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { AdvancedFilters, FilterOption, FilterValues } from "@/components/common/AdvancedFilters";
import { BulkActions } from "@/components/common/BulkActions";
import BulkEmailSender from "@/components/guests/BulkEmailSender";
import EnhancedBulkGuestImport from "@/components/guests/EnhancedBulkGuestImport";
import EmailTemplateEditor from "@/components/guests/EmailTemplateEditor";

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
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
  
  const [emailSenderOpen, setEmailSenderOpen] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Opcje dla zaawansowanych filtrów
  const filterOptions: FilterOption[] = [
    { 
      id: "company", 
      label: "Firma", 
      type: "text"
    },
    { 
      id: "invitationDate", 
      label: "Data zaproszenia", 
      type: "date"
    },
    { 
      id: "confirmationStatus", 
      label: "Status potwierdzenia", 
      type: "select",
      options: [
        { value: "confirmed", label: "Potwierdzeni" },
        { value: "pending", label: "Oczekujący" },
        { value: "declined", label: "Odrzuceni" }
      ]
    },
    { 
      id: "emailStatus", 
      label: "Status emaila", 
      type: "select",
      options: [
        { value: "sent", label: "Wysłany" },
        { value: "opened", label: "Otwarty" },
        { value: "failed", label: "Błąd" },
        { value: "not_sent", label: "Nie wysłany" }
      ]
    }
  ];

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
    
    // Sprawdzenie zaawansowanych filtrów
    let matchesAdvancedFilters = true;
    for (const [key, value] of Object.entries(advancedFilters)) {
      if (value !== null && value !== '') {
        if (key === "company" && guest.company) {
          matchesAdvancedFilters = matchesAdvancedFilters && 
            guest.company.toLowerCase().includes((value as string).toLowerCase());
        } else if (key === "invitationDate" && guest.invitationSentAt) {
          const filterDate = new Date(value as Date);
          const guestDate = new Date(guest.invitationSentAt);
          matchesAdvancedFilters = matchesAdvancedFilters && 
            filterDate.getDate() === guestDate.getDate() &&
            filterDate.getMonth() === guestDate.getMonth() &&
            filterDate.getFullYear() === guestDate.getFullYear();
        } else if (key === "confirmationStatus") {
          matchesAdvancedFilters = matchesAdvancedFilters && guest.status === value;
        } else if (key === "emailStatus" && guest.emailStatus) {
          matchesAdvancedFilters = matchesAdvancedFilters && guest.emailStatus === value;
        } else if (key === "emailStatus" && value === "not_sent") {
          matchesAdvancedFilters = matchesAdvancedFilters && !guest.invitationSentAt;
        }
      }
    }

    return matchesSearch && matchesZone && matchesStatus && matchesAdvancedFilters;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuestIds(filteredGuests.map(g => g.id));
    } else {
      setSelectedGuestIds([]);
    }
  };

  const handleSelectGuest = (guestId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuestIds([...selectedGuestIds, guestId]);
    } else {
      setSelectedGuestIds(selectedGuestIds.filter(id => id !== guestId));
    }
  };

  const handleImportGuests = (importedGuests: Guest[]) => {
    setGuests([...guests, ...importedGuests]);
    toast.success(`Zaimportowano ${importedGuests.length} gości`);
  };

  const handleSendBulkEmails = () => {
    if (selectedGuestIds.length === 0) {
      toast.error('Nie wybrano żadnych gości');
      return;
    }
    setEmailSenderOpen(true);
  };

  const handleEmailSent = () => {
    // Aktualizuj status email dla wybranych gości
    setGuests(guests.map(guest => 
      selectedGuestIds.includes(guest.id) 
        ? { ...guest, emailStatus: 'sent', invitationSentAt: new Date() }
        : guest
    ));
    setSelectedGuestIds([]);
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

  // Zaktualizowane masowe operacje
  const bulkActions = [
    {
      id: "sendEmails",
      label: "Wyślij zaproszenia",
      icon: <Mail className="h-4 w-4" />,
      onClick: handleSendBulkEmails
    },
    {
      id: "changeZone",
      label: "Zmień strefę",
      icon: <UserCheck className="h-4 w-4" />,
      onClick: (ids: string[]) => {
        toast.success(`Zmieniono strefę dla ${ids.length} gości`);
        setSelectedGuestIds([]);
      }
    },
    {
      id: "export",
      label: "Eksportuj do CSV",
      icon: <Download className="h-4 w-4" />,
      onClick: (ids: string[]) => {
        toast.success(`Eksportowano dane ${ids.length} gości`);
      }
    },
    {
      id: "delete",
      label: "Usuń gości",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive" as const,
      onClick: (ids: string[]) => {
        setGuests(guests.filter(g => !ids.includes(g.id)));
        toast.success(`Usunięto ${ids.length} gości`);
        setSelectedGuestIds([]);
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goście</h1>
          <p className="text-muted-foreground">
            Zarządzaj listą gości, wysyłaj zaproszenia z QR kodami.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setTemplateEditorOpen(true)}
            className="whitespace-nowrap"
          >
            <Mail className="mr-2 h-4 w-4" />
            Szablony email
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setImportDialogOpen(true)}
            className="whitespace-nowrap"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importuj z pliku
          </Button>
          <Button variant="outline" className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj gościa
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
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

        <AdvancedFilters 
          filterOptions={filterOptions}
          onFilterChange={setAdvancedFilters}
        />
        
        <BulkActions 
          selectedIds={selectedGuestIds} 
          actions={bulkActions}
          onSelectionClear={() => setSelectedGuestIds([])}
        />
      </div>
      
      <div className="overflow-hidden rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-[40px] px-4 py-3 text-left">
                <Checkbox 
                  checked={selectedGuestIds.length > 0 && selectedGuestIds.length === filteredGuests.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Gość</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Firma</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Strefa</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest) => (
              <tr key={guest.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Checkbox 
                    checked={selectedGuestIds.includes(guest.id)}
                    onCheckedChange={(checked) => handleSelectGuest(guest.id, !!checked)}
                  />
                </td>
                <td 
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleViewDetails(guest)}
                >
                  <div className="font-medium">{guest.firstName} {guest.lastName}</div>
                  <div className="text-xs text-muted-foreground">{guest.phone || "Brak numeru"}</div>
                </td>
                <td className="px-4 py-3">{guest.email}</td>
                <td className="px-4 py-3">{guest.company || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    guest.zone === "vip" ? "bg-amber-100 text-amber-800" :
                    guest.zone === "press" ? "bg-blue-100 text-blue-800" :
                    guest.zone === "staff" ? "bg-purple-100 text-purple-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {guest.zone === "vip" ? "VIP" :
                     guest.zone === "press" ? "Press" :
                     guest.zone === "staff" ? "Staff" : "Ogólna"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    guest.status === "invited" ? "bg-blue-100 text-blue-800" :
                    guest.status === "confirmed" ? "bg-green-100 text-green-800" :
                    guest.status === "declined" ? "bg-red-100 text-red-800" :
                    guest.status === "checked-in" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {guest.status === "invited" ? "Zaproszony" :
                     guest.status === "confirmed" ? "Potwierdzony" :
                     guest.status === "declined" ? "Odrzucony" :
                     guest.status === "checked-in" ? "Obecny" : guest.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleViewQR(guest)}>
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleResendInvite(guest)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditGuest(guest)}>
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteGuest(guest)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredGuests.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  Brak gości spełniających kryteria wyszukiwania
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                  <FileDown className="h-32 w-32 text-primary" />
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

      {/* Nowe dialogi */}
      <BulkEmailSender
        open={emailSenderOpen}
        onOpenChange={setEmailSenderOpen}
        selectedGuests={guests.filter(g => selectedGuestIds.includes(g.id))}
        eventId="mock-event-id"
        onEmailSent={handleEmailSent}
      />

      <EnhancedBulkGuestImport
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportGuests}
        eventId="mock-event-id"
      />

      <EmailTemplateEditor
        open={templateEditorOpen}
        onOpenChange={setTemplateEditorOpen}
        onTemplateSave={(template) => {
          console.log('Saved template:', template);
          toast.success('Szablon został zapisany');
        }}
      />
    </div>
  );
};

export default Guests;
