import { localDb, type LocalGuest, type LocalScanQueueEntry } from "@/lib/db/localDb";

export interface OfflineCheckedInGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  ticketType: string | null;
  zones: string[];
  checkedInAt: string;
  localScanStatus: LocalScanQueueEntry["status"] | "unknown";
  serverStatus: string | null;
  clientScanId: string | null;
  scannedAt: string | null;
}

const CHECKED_IN_STATUS = "checked-in";

const sanitizeFilePart = (value: string) =>
  value
    .trim()
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "wydarzenie";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
};

const escapeCsv = (value: string) => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getEarliestScanByGuest = (scans: LocalScanQueueEntry[]) => {
  const scansByGuest = new Map<string, LocalScanQueueEntry>();

  scans.forEach((scan) => {
    if (!scan.guestId) return;

    const currentScan = scansByGuest.get(scan.guestId);
    if (!currentScan || scan.scannedAt < currentScan.scannedAt) {
      scansByGuest.set(scan.guestId, scan);
    }
  });

  return scansByGuest;
};

const isCheckedInGuest = (guest: LocalGuest) =>
  Boolean(guest.checked_in_at) || guest.status === CHECKED_IN_STATUS;

export const getOfflineCheckedInGuests = async (eventId: string): Promise<OfflineCheckedInGuest[]> => {
  const [guests, scans] = await Promise.all([
    localDb.guests.where("event_id").equals(eventId).filter(isCheckedInGuest).toArray(),
    localDb.scanQueue.where("eventId").equals(eventId).toArray(),
  ]);
  const scansByGuest = getEarliestScanByGuest(scans);

  return guests
    .map((guest) => {
      const scan = scansByGuest.get(guest.id);
      const localScanStatus: OfflineCheckedInGuest["localScanStatus"] = scan?.status ?? "unknown";

      return {
        id: guest.id,
        firstName: guest.first_name,
        lastName: guest.last_name,
        email: guest.email,
        company: guest.company,
        ticketType: guest.ticket_type,
        zones: guest.zones,
        checkedInAt: guest.checked_in_at ?? scan?.scannedAt ?? "",
        localScanStatus,
        serverStatus: scan?.serverStatus ?? null,
        clientScanId: scan?.clientScanId ?? null,
        scannedAt: scan?.scannedAt ?? null,
      };
    })
    .sort((left, right) => left.checkedInAt.localeCompare(right.checkedInAt));
};

export const countOfflineCheckedInGuests = async (eventId: string) =>
  localDb.guests.where("event_id").equals(eventId).filter(isCheckedInGuest).count();

export const exportOfflineCheckInsCsv = async (eventId: string, eventName: string) => {
  const guests = await getOfflineCheckedInGuests(eventId);
  const headers = [
    "Imię",
    "Nazwisko",
    "Email",
    "Firma",
    "Typ biletu",
    "Strefy",
    "Check-in",
    "Status lokalny",
    "Status serwera",
    "Client scan ID",
  ];
  const rows = guests.map((guest) => [
    guest.firstName,
    guest.lastName,
    guest.email ?? "",
    guest.company ?? "",
    guest.ticketType ?? "",
    guest.zones.join(" | "),
    formatDateTime(guest.checkedInAt),
    guest.localScanStatus,
    guest.serverStatus ?? "",
    guest.clientScanId ?? "",
  ]);
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map((value) => escapeCsv(String(value))).join(",")),
  ].join("\n");

  downloadBlob(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
    `checkiny_${sanitizeFilePart(eventName)}_${new Date().toISOString().slice(0, 10)}.csv`
  );

  return guests.length;
};

export const exportOfflineCheckInsPdf = async (eventId: string, eventName: string) => {
  const guests = await getOfflineCheckedInGuests(eventId);
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.text("Lista zarejestrowanych gości", pageWidth / 2, 16, { align: "center" });
  doc.setFontSize(10);
  doc.text(eventName, pageWidth / 2, 23, { align: "center" });
  doc.text(`Wygenerowano offline: ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, 29, { align: "center" });

  autoTable(doc, {
    startY: 36,
    head: [["Imię", "Nazwisko", "Email", "Firma", "Typ", "Strefy", "Check-in", "Status"]],
    body: guests.map((guest) => [
      guest.firstName,
      guest.lastName,
      guest.email ?? "",
      guest.company ?? "",
      guest.ticketType ?? "",
      guest.zones.join(", "),
      formatDateTime(guest.checkedInAt),
      guest.serverStatus ?? guest.localScanStatus,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
    },
  });

  doc.save(`checkiny_${sanitizeFilePart(eventName)}_${new Date().toISOString().slice(0, 10)}.pdf`);

  return guests.length;
};
