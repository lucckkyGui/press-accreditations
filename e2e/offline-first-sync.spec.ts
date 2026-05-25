import { expect, test, type Browser, type Page, type Route } from "@playwright/test";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const EVENT_ID = "00000000-0000-4000-8000-000000000101";
const GUEST_ALICE_ID = "00000000-0000-4000-8000-000000000201";
const GUEST_BOB_ID = "00000000-0000-4000-8000-000000000202";
const EVENT_TITLE = "PressConf E2E";
const LOCAL_DB_NAME = "press-accreditations-local";

interface MockGuest {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  ticket_type: string;
  zones: string[];
  status: string;
  email_status: string | null;
  qr_code: string;
  invitation_sent_at: string | null;
  invitation_opened_at: string | null;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RpcRequest {
  _qr_code: string;
  _event_id: string;
  _device_info: {
    deviceId?: string;
    localValidationResult?: string;
  };
  _client_scan_id: string;
  _scanned_at: string;
}

interface RpcResponse {
  success: boolean;
  status: "success" | "duplicate" | "invalid" | "wrong_event";
  message: string;
  checkedInAt: string | null;
  scanTime: string;
  scannedAt: string;
  clientScanId: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
    ticketType: string;
    zones: string[];
    status: string;
    qrCode: string;
    checkedInAt: string | null;
  } | null;
}

interface ServerScan {
  clientScanId: string;
  guestId: string | null;
  eventId: string;
  qrPayload: string;
  scannedAt: string;
  status: RpcResponse["status"];
  response: RpcResponse;
}

const createdAt = "2026-05-22T10:00:00.000Z";

const guests: MockGuest[] = [
  {
    id: GUEST_ALICE_ID,
    event_id: EVENT_ID,
    first_name: "Anna",
    last_name: "Kowalska",
    email: "anna@example.com",
    company: "Daily Press",
    phone: null,
    ticket_type: "media",
    zones: ["press", "stage"],
    status: "confirmed",
    email_status: "sent",
    qr_code: "QR-ALICE",
    invitation_sent_at: null,
    invitation_opened_at: null,
    checked_in_at: null,
    created_at: createdAt,
    updated_at: createdAt,
  },
  {
    id: GUEST_BOB_ID,
    event_id: EVENT_ID,
    first_name: "Jan",
    last_name: "Nowak",
    email: "jan@example.com",
    company: "Radio News",
    phone: null,
    ticket_type: "press",
    zones: ["press"],
    status: "confirmed",
    email_status: "sent",
    qr_code: "QR-BOB",
    invitation_sent_at: null,
    invitation_opened_at: null,
    checked_in_at: null,
    created_at: createdAt,
    updated_at: createdAt,
  },
];

class SupabaseMockServer {
  private scans: ServerScan[] = [];
  private requestsByClientScanId = new Map<string, number>();
  private checkedInAtByGuest = new Map<string, string>();

  get scanCount() {
    return this.scans.length;
  }

  getScans() {
    return this.scans.map((scan) => ({ ...scan }));
  }

  getRequestCount(clientScanId: string) {
    return this.requestsByClientScanId.get(clientScanId) ?? 0;
  }

  processScan(request: RpcRequest): RpcResponse {
    this.requestsByClientScanId.set(
      request._client_scan_id,
      this.getRequestCount(request._client_scan_id) + 1
    );

    const existingScan = this.scans.find((scan) => scan.clientScanId === request._client_scan_id);
    if (existingScan) {
      return existingScan.response;
    }

    const guest = guests.find((candidate) => candidate.qr_code === request._qr_code);
    const response = this.createResponse(request, guest);
    const scan: ServerScan = {
      clientScanId: request._client_scan_id,
      guestId: guest?.id ?? null,
      eventId: request._event_id,
      qrPayload: request._qr_code,
      scannedAt: request._scanned_at,
      status: response.status,
      response,
    };

    this.scans.push(scan);

    if (guest && response.status === "success") {
      this.demoteLaterSuccesses(guest.id, request._scanned_at, request._client_scan_id);
      this.checkedInAtByGuest.set(guest.id, request._scanned_at);
    }

    return response;
  }

  private createResponse(request: RpcRequest, guest: MockGuest | undefined): RpcResponse {
    if (!guest) {
      return this.buildResponse(request, null, "invalid", "Nie znaleziono gościa z tym kodem QR", null);
    }

    if (guest.event_id !== request._event_id) {
      return this.buildResponse(request, guest, "wrong_event", "Kod QR jest dla innego wydarzenia", null);
    }

    const earliestSuccess = this.scans
      .filter((scan) => scan.guestId === guest.id && scan.status === "success")
      .sort((left, right) => left.scannedAt.localeCompare(right.scannedAt))[0];

    if (earliestSuccess && earliestSuccess.scannedAt <= request._scanned_at) {
      return this.buildResponse(
        request,
        guest,
        "duplicate",
        "Gość został już wcześniej zarejestrowany",
        earliestSuccess.scannedAt
      );
    }

    return this.buildResponse(
      request,
      guest,
      "success",
      "Gość został pomyślnie zarejestrowany",
      request._scanned_at
    );
  }

  private buildResponse(
    request: RpcRequest,
    guest: MockGuest | null,
    status: RpcResponse["status"],
    message: string,
    checkedInAt: string | null
  ): RpcResponse {
    return {
      success: status === "success",
      status,
      message,
      checkedInAt,
      scanTime: request._scanned_at,
      scannedAt: request._scanned_at,
      clientScanId: request._client_scan_id,
      guest: guest
        ? {
            id: guest.id,
            firstName: guest.first_name,
            lastName: guest.last_name,
            email: guest.email,
            company: guest.company,
            ticketType: guest.ticket_type,
            zones: guest.zones,
            status: checkedInAt ? "checked-in" : guest.status,
            qrCode: guest.qr_code,
            checkedInAt,
          }
        : null,
    };
  }

  private demoteLaterSuccesses(guestId: string, scannedAt: string, currentClientScanId: string) {
    this.scans.forEach((scan) => {
      if (
        scan.clientScanId !== currentClientScanId &&
        scan.guestId === guestId &&
        scan.status === "success" &&
        scan.scannedAt > scannedAt
      ) {
        scan.status = "duplicate";
        scan.response = {
          ...scan.response,
          success: false,
          status: "duplicate",
          message: "Gość został już wcześniej zarejestrowany",
          checkedInAt: scannedAt,
        };
      }
    });
  }
}

const sessionResponse = {
  access_token: "e2e-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "e2e-refresh-token",
  user: {
    id: USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "organizer@example.com",
    email_confirmed_at: createdAt,
    phone: "",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { first_name: "E2E", last_name: "Organizer" },
    identities: [],
    created_at: createdAt,
    updated_at: createdAt,
  },
};

const eventRow = {
  id: EVENT_ID,
  title: EVENT_TITLE,
  description: "E2E offline-first event",
  location: "Warszawa",
  start_date: "2026-06-01T10:00:00.000Z",
  end_date: "2026-06-01T18:00:00.000Z",
  is_published: true,
  organizer_id: USER_ID,
  category: "press",
  image_url: "",
  max_guests: 2,
  created_at: createdAt,
  updated_at: createdAt,
};

const fulfillJson = (route: Route, body: unknown, status = 200, headers: Record<string, string> = {}) =>
  route.fulfill({
    status,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

const installSupabaseMocks = async (page: Page, server: SupabaseMockServer) => {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        },
      });
      return;
    }

    const isSupabase = url.hostname === "supabase.co" || url.hostname.endsWith(".supabase.co");
    if (!isSupabase) {
      await route.continue();
      return;
    }

    if (url.pathname.endsWith("/auth/v1/token")) {
      await fulfillJson(route, sessionResponse);
      return;
    }

    if (url.pathname.endsWith("/auth/v1/user")) {
      await fulfillJson(route, sessionResponse.user);
      return;
    }

    if (url.pathname.includes("/functions/v1/audit-logs")) {
      await fulfillJson(route, { id: "audit-e2e", created_at: new Date().toISOString() });
      return;
    }

    if (url.pathname.endsWith("/rest/v1/profiles")) {
      await fulfillJson(route, {
        id: USER_ID,
        first_name: "E2E",
        last_name: "Organizer",
        avatar_url: null,
        phone: null,
        organization_name: "E2E Media",
      });
      return;
    }

    if (url.pathname.endsWith("/rest/v1/user_roles")) {
      await fulfillJson(route, [{ role: "organizer" }]);
      return;
    }

    if (url.pathname.endsWith("/rest/v1/events")) {
      await fulfillJson(route, [eventRow], 200, { "content-range": "0-0/1" });
      return;
    }

    if (url.pathname.endsWith("/rest/v1/guests")) {
      await fulfillJson(route, guests, 200, { "content-range": `0-${guests.length - 1}/${guests.length}` });
      return;
    }

    if (url.pathname.endsWith("/rest/v1/rpc/process_qr_check_in")) {
      const body = request.postDataJSON() as RpcRequest;
      await fulfillJson(route, server.processScan(body));
      return;
    }

    await fulfillJson(route, []);
  });
};

const loginAsOrganizer = async (page: Page) => {
  await page.goto("/auth/login");
  await page.locator("#org-email").fill("organizer@example.com");
  await page.locator("#org-password").fill("password123");
  await page.getByRole("button", { name: /zaloguj|log in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
};

const openScannerAndDownloadManifest = async (page: Page) => {
  await page.goto("/scanner");
  await expect(page.getByRole("heading", { name: /skaner check-in/i })).toBeVisible();
  await page.getByTestId("event-select").click();
  await page.getByRole("option", { name: EVENT_TITLE }).click();
  await page.getByTestId("download-manifest").click();
  await expect(page.getByText("Gotowe offline")).toBeVisible();
  await expect(page.getByTestId("manual-qr-input")).toBeEnabled();
};

const scanQr = async (page: Page, qrCode: string, expectedGuestName: string) => {
  const input = page.getByTestId("manual-qr-input");
  await input.fill(qrCode);
  await expect(input).toHaveValue(qrCode);
  await input.press("Enter");
  await expect(page.getByTestId("scan-result")).toContainText("Zarejestrowano lokalnie");
  await expect(page.getByTestId("scan-result")).toContainText(expectedGuestName);
};

const readFirstClientScanId = (page: Page) =>
  page.evaluate((dbName) => new Promise<string>((resolve, reject) => {
    const openRequest = indexedDB.open(dbName);
    openRequest.onerror = () => reject(openRequest.error);
    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("scanQueue", "readonly");
      const store = transaction.objectStore("scanQueue");
      const cursorRequest = store.openCursor();

      cursorRequest.onerror = () => reject(cursorRequest.error);
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) {
          reject(new Error("No scanQueue entries found"));
          return;
        }

        const value = cursor.value as { clientScanId?: string };
        if (!value.clientScanId) {
          reject(new Error("scanQueue entry has no clientScanId"));
          return;
        }

        resolve(value.clientScanId);
      };
    };
  }), LOCAL_DB_NAME);

const markScanPending = (page: Page, clientScanId: string) =>
  page.evaluate(({ dbName, scanId }) => new Promise<void>((resolve, reject) => {
    const openRequest = indexedDB.open(dbName);
    openRequest.onerror = () => reject(openRequest.error);
    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("scanQueue", "readwrite");
      const store = transaction.objectStore("scanQueue");
      const getRequest = store.get(scanId);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const record = getRequest.result as { status?: string; nextRetryAt?: string; lastError?: string } | undefined;
        if (!record) {
          reject(new Error(`Missing scanQueue entry ${scanId}`));
          return;
        }

        record.status = "pending";
        record.nextRetryAt = undefined;
        record.lastError = undefined;
        const putRequest = store.put(record);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
    };
  }), { dbName: LOCAL_DB_NAME, scanId: clientScanId });

const prepareGate = async (page: Page, server: SupabaseMockServer) => {
  await installSupabaseMocks(page, server);
  await loginAsOrganizer(page);
  await openScannerAndDownloadManifest(page);
};

const createGate = async (browser: Browser, baseURL: string, server: SupabaseMockServer) => {
  const context = await browser.newContext({ baseURL, serviceWorkers: "block" });
  const page = await context.newPage();
  await prepareGate(page, server);

  return { context, page };
};

test("login, manifest download, online scan, offline scan, reconnect and sync", async ({ context, page }) => {
  const server = new SupabaseMockServer();
  await installSupabaseMocks(page, server);

  await loginAsOrganizer(page);
  await openScannerAndDownloadManifest(page);
  await scanQr(page, "QR-ALICE", "Anna Kowalska");

  await context.setOffline(true);
  await expect(page.getByText("Offline", { exact: true })).toBeVisible();
  await scanQr(page, "QR-BOB", "Jan Nowak");

  await context.setOffline(false);
  await page.goto("/diagnostics");
  await expect(page.getByTestId("diagnostics-page")).toBeVisible();

  if (server.scanCount < 2) {
    await page.getByTestId("diagnostics-sync-now").click();
  }

  await expect.poll(() => server.scanCount).toBe(2);
  await expect(page.getByTestId("diagnostics-pending-count")).toHaveText("0");
  await expect(page.getByTestId("diagnostics-manifest-count")).toHaveText("1");
  await expect(page.getByTestId("diagnostics-last-sync")).not.toHaveText("Brak danych");

  const statuses = server.getScans().map((scan) => scan.status).sort();
  expect(statuses).toEqual(["success", "success"]);
});

test("idempotency and earliest-scan conflict rule across two offline gates", async ({ browser }, testInfo) => {
  const server = new SupabaseMockServer();
  const baseURL = String(testInfo.project.use.baseURL ?? "http://127.0.0.1:4173");
  const gateA = await createGate(browser, baseURL, server);
  const gateB = await createGate(browser, baseURL, server);

  try {
    await gateA.context.setOffline(true);
    await gateB.context.setOffline(true);

    await scanQr(gateA.page, "QR-ALICE", "Anna Kowalska");
    const gateAClientScanId = await readFirstClientScanId(gateA.page);
    await gateA.page.waitForTimeout(25);
    await scanQr(gateB.page, "QR-ALICE", "Anna Kowalska");

    await gateB.context.setOffline(false);
    await expect.poll(() => server.scanCount).toBe(1);
    expect(server.getScans()[0].status).toBe("success");

    await gateA.context.setOffline(false);
    await expect.poll(() => server.scanCount).toBe(2);

    const aliceScans = server.getScans().filter((scan) => scan.guestId === GUEST_ALICE_ID);
    const successScans = aliceScans.filter((scan) => scan.status === "success");
    const duplicateScans = aliceScans.filter((scan) => scan.status === "duplicate");
    const earliestScan = aliceScans.reduce((earliest, scan) =>
      scan.scannedAt < earliest.scannedAt ? scan : earliest
    );

    expect(successScans).toHaveLength(1);
    expect(duplicateScans).toHaveLength(1);
    expect(successScans[0].clientScanId).toBe(earliestScan.clientScanId);
    expect(successScans[0].scannedAt).toBe(earliestScan.scannedAt);

    await markScanPending(gateA.page, gateAClientScanId);
    await gateA.page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect.poll(() => server.getRequestCount(gateAClientScanId)).toBeGreaterThan(1);
    expect(server.scanCount).toBe(2);
  } finally {
    await gateA.context.close();
    await gateB.context.close();
  }
});
