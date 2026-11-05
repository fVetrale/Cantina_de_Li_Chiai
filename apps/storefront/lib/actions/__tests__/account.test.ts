import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let authCookie: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "cantina_auth" && authCookie ? { name, value: authCookie } : undefined),
  }),
}));
const refreshMock = vi.fn();
vi.mock("next/cache", () => ({ refresh: () => refreshMock() }));

import { deleteAddress, saveAddress, updateProfile } from "@/lib/actions/account";
import { listAddresses, listOrders, retrieveOwnOrder } from "@/lib/data/account";

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhY3Rvcl9pZCI6ImN1c19BIn0.c2ln";
const OWN_ADDRESS = "cuaddr_OWN";
const FOREIGN_ADDRESS = "cuaddr_FOREIGN";
const OWN_ORDER = "order_OWN";

let fetchMock: ReturnType<typeof vi.fn>;
let down = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/** Fake Medusa scoped to customer A: like the real one, other customers' resources are 404. */
function installBackend() {
  fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    if (down) throw new TypeError("fetch failed");
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    const auth = (init?.headers as Record<string, string> | undefined)?.authorization;
    if (auth !== `Bearer ${TOKEN}`) return json({ message: "Unauthorized" }, 401);

    if (url.pathname === "/store/customers/me" && method === "POST") {
      return json({ customer: { id: "cus_A", email: "a@example.it", first_name: "Anna", last_name: "A", phone: null } });
    }
    if (url.pathname === "/store/customers/me/addresses" && method === "POST") {
      return json({ customer: { id: "cus_A" } });
    }
    if (url.pathname === "/store/customers/me/addresses" && method === "GET") {
      return json({
        addresses: [
          { id: "cuaddr_2", first_name: "Anna", address_1: "Via B", country_code: "it", is_default_shipping: false },
          { id: "cuaddr_FR", first_name: "Anna", address_1: "Rue C", country_code: "fr", is_default_shipping: false },
          { id: "cuaddr_1", first_name: "Anna", address_1: "Via A", country_code: "it", is_default_shipping: true },
        ],
      });
    }
    const address = url.pathname.match(/^\/store\/customers\/me\/addresses\/([^/]+)$/);
    if (address) {
      if (address[1] !== OWN_ADDRESS) return json({ message: "Address not found" }, 404);
      return method === "DELETE" ? json({ id: OWN_ADDRESS, deleted: true }) : json({ customer: { id: "cus_A" } });
    }
    if (url.pathname === "/store/orders") {
      const id = url.searchParams.get("id");
      const orders = [
        { id: OWN_ORDER, display_id: 7, created_at: "2026-11-05T10:00:00Z", status: "pending", fulfillment_status: "shipped", total: 33.9, items: [{ id: "i1", quantity: 2 }] },
      ];
      return json({ orders: id ? orders.filter((o) => o.id === id) : orders });
    }
    return json({ message: "unexpected" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
}

function calls() {
  return fetchMock.mock.calls.map(([input, init]) => ({
    method: (init as RequestInit | undefined)?.method ?? "GET",
    url: new URL(String(input)),
    body: (init as RequestInit | undefined)?.body ? JSON.parse(String((init as RequestInit).body)) : undefined,
  }));
}

const address = {
  firstName: "Anna",
  lastName: "A",
  address1: "Via Roma 1",
  postalCode: "84100",
  city: "Salerno",
  province: "sa",
};

beforeEach(() => {
  authCookie = TOKEN;
  down = false;
  refreshMock.mockClear();
  installBackend();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("reserved-area actions require the login cookie", () => {
  it.each([
    ["updateProfile", () => updateProfile({ firstName: "Anna", lastName: "A" })],
    ["saveAddress", () => saveAddress({ address })],
    ["deleteAddress", () => deleteAddress({ id: OWN_ADDRESS })],
  ])("%s without cookie → unauthenticated, no Medusa call", async (_name, action) => {
    authCookie = undefined;
    expect(await action()).toEqual({ ok: false, error: "unauthenticated" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps an expired token (Medusa 401) to unauthenticated", async () => {
    authCookie = "eyJ.eyJ.expired";
    expect(await updateProfile({ firstName: "Anna", lastName: "A" })).toEqual({ ok: false, error: "unauthenticated" });
  });
});

describe("updateProfile", () => {
  it("updates name and phone only (never the email)", async () => {
    expect(await updateProfile({ firstName: " Anna ", lastName: "A", phone: "333 1234567", email: "evil@example.it" })).toEqual({ ok: true });
    expect(calls()[0].body).toEqual({ first_name: "Anna", last_name: "A", phone: "333 1234567" });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid input with the field paths", async () => {
    expect(await updateProfile({ firstName: "", lastName: "A", phone: "abc" })).toEqual({
      ok: false,
      error: "invalid_input",
      fields: ["firstName", "phone"],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("saveAddress / deleteAddress", () => {
  it("creates an address, always in Italy, ignoring extra keys from the client", async () => {
    expect(await saveAddress({ address: { ...address, country: "fr" }, isDefault: true, customer_id: "cus_B" })).toEqual({ ok: true });
    const call = calls()[0];
    expect(call.method).toBe("POST");
    expect(call.url.pathname).toBe("/store/customers/me/addresses");
    expect(call.body).toEqual({
      first_name: "Anna",
      last_name: "A",
      address_1: "Via Roma 1",
      address_2: "",
      city: "Salerno",
      postal_code: "84100",
      province: "SA",
      country_code: "it",
      phone: null,
      is_default_shipping: true,
    });
  });

  it("updates the customer's own address", async () => {
    expect(await saveAddress({ id: OWN_ADDRESS, address })).toEqual({ ok: true });
    expect(calls()[0].url.pathname).toBe(`/store/customers/me/addresses/${OWN_ADDRESS}`);
  });

  it("cannot update or delete another customer's address (Medusa 404 → not_found)", async () => {
    expect(await saveAddress({ id: FOREIGN_ADDRESS, address })).toEqual({ ok: false, error: "not_found" });
    expect(await deleteAddress({ id: FOREIGN_ADDRESS })).toEqual({ ok: false, error: "not_found" });
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it.each([
    ["path traversal id", { id: "cuaddr_1/../../orders", address }],
    ["wrong prefix", { id: "addr_1", address }],
    ["bad CAP", { address: { ...address, postalCode: "123" } }],
  ])("rejects %s without calling Medusa", async (_label, input) => {
    expect((await saveAddress(input)).ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes the customer's own address", async () => {
    expect(await deleteAddress({ id: OWN_ADDRESS })).toEqual({ ok: true });
    expect(calls()[0]).toMatchObject({ method: "DELETE" });
  });
});

describe("account data", () => {
  it("lists only Italian addresses, default first", async () => {
    const result = await listAddresses(TOKEN);
    expect(result.ok && result.data.map((a) => a.id)).toEqual(["cuaddr_1", "cuaddr_2"]);
  });

  it("lists orders with a customer-facing status", async () => {
    const result = await listOrders(TOKEN);
    expect(result.ok && result.data).toEqual([
      { id: OWN_ORDER, displayId: 7, createdAt: "2026-11-05T10:00:00Z", status: "shipped", total: 33.9, itemCount: 2 },
    ]);
  });

  it("reads an order through the customer-scoped list, never the public GET /store/orders/:id", async () => {
    const result = await retrieveOwnOrder(TOKEN, OWN_ORDER);
    expect(result.ok).toBe(true);
    const call = calls()[0];
    expect(call.url.pathname).toBe("/store/orders");
    expect(call.url.searchParams.get("id")).toBe(OWN_ORDER);
  });

  it("returns not_found for an order of someone else (empty customer-scoped list)", async () => {
    expect(await retrieveOwnOrder(TOKEN, "order_SOMEONEELSE")).toEqual({ ok: false, error: "not_found" });
  });

  it("returns not_found for a malformed order id without calling Medusa", async () => {
    expect(await retrieveOwnOrder(TOKEN, "order_1/../carts")).toEqual({ ok: false, error: "not_found" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("is unavailable when the backend is down", async () => {
    down = true;
    expect(await listOrders(TOKEN)).toEqual({ ok: false, error: "unavailable" });
  });
});
