import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let cookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "cantina_cart_id" && cookieValue ? { name, value: cookieValue } : undefined),
  }),
}));
const refreshMock = vi.fn();
vi.mock("next/cache", () => ({ refresh: () => refreshMock() }));

import { saveCheckoutDetails, selectShippingOptions } from "@/lib/actions/checkout";
import { groupShippingOptions, type MedusaShippingOption } from "@/lib/data/checkout";

const CART_ID = "cart_0001";
const GENERAL_PROFILE = "sp_DEFAULT";

const OPTIONS: MedusaShippingOption[] = [
  { id: "so_STANDARD", name: "Spedizione standard", amount: 9.9, shipping_profile_id: GENERAL_PROFILE, type: { code: "standard" } },
  { id: "so_PICKUP", name: "Ritiro in cantina", amount: 0, shipping_profile_id: GENERAL_PROFILE, type: { code: "pickup" } },
];

let fetchMock: ReturnType<typeof vi.fn>;
let lastBody: unknown;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const cartBody = { cart: { id: CART_ID, currency_code: "eur", email: "a@b.it", item_total: 18, total: 27.9, shipping_methods: [] } };

function installBackend(options: { down?: boolean; cartStatus?: number } = {}) {
  fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    if (options.down) throw new TypeError("fetch failed");
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    lastBody = init?.body ? JSON.parse(String(init.body)) : undefined;
    if (url.pathname === `/store/carts/${CART_ID}` && method === "POST") {
      return json(cartBody, options.cartStatus ?? 200);
    }
    if (url.pathname === "/store/shipping-options") {
      expect(url.searchParams.get("cart_id")).toBe(CART_ID);
      return json({ shipping_options: OPTIONS });
    }
    if (url.pathname === `/store/carts/${CART_ID}/shipping-methods` && method === "POST") {
      return json(cartBody);
    }
    return json({ message: "unexpected" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
}

const validAddress = {
  firstName: "Giuseppe",
  lastName: "Esposito",
  address1: "Via Roma 1",
  address2: "",
  postalCode: "84078",
  city: "Vallo della Lucania",
  province: "sa",
};

const validDetails = {
  email: "giuseppe@example.it",
  phone: "+39 333 1234567",
  shipping: validAddress,
  billingSameAsShipping: true,
};

function requests() {
  return fetchMock.mock.calls.map(([input, init]) => `${(init as RequestInit | undefined)?.method ?? "GET"} ${new URL(String(input)).pathname}`);
}

beforeEach(() => {
  cookieValue = CART_ID;
  refreshMock.mockClear();
  installBackend();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("saveCheckoutDetails", () => {
  it("saves email and addresses on the cookie's cart, always in Italy, and refreshes", async () => {
    const result = await saveCheckoutDetails({ ...validDetails, shipping: { ...validAddress, country: "fr" } });

    expect(result).toEqual({ ok: true });
    expect(requests()).toEqual([`POST /store/carts/${CART_ID}`]);
    const expectedAddress = {
      first_name: "Giuseppe",
      last_name: "Esposito",
      address_1: "Via Roma 1",
      address_2: "",
      city: "Vallo della Lucania",
      postal_code: "84078",
      province: "SA",
      country_code: "it",
      phone: "+39 333 1234567",
    };
    expect(lastBody).toEqual({ email: "giuseppe@example.it", shipping_address: expectedAddress, billing_address: expectedAddress });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("uses a separate billing address when requested", async () => {
    await saveCheckoutDetails({
      ...validDetails,
      billingSameAsShipping: false,
      billing: { ...validAddress, firstName: "Azienda", address1: "Via Mare 2" },
    });

    expect(lastBody).toMatchObject({
      shipping_address: { first_name: "Giuseppe", address_1: "Via Roma 1" },
      billing_address: { first_name: "Azienda", address_1: "Via Mare 2", country_code: "it" },
    });
  });

  it.each([
    ["bad email", { ...validDetails, email: "not-an-email" }, ["email"]],
    ["bad phone", { ...validDetails, phone: "abc" }, ["phone"]],
    ["bad CAP", { ...validDetails, shipping: { ...validAddress, postalCode: "8407" } }, ["shipping.postalCode"]],
    ["bad province", { ...validDetails, shipping: { ...validAddress, province: "Salerno" } }, ["shipping.province"]],
    ["empty name", { ...validDetails, shipping: { ...validAddress, firstName: "  " } }, ["shipping.firstName"]],
    ["missing billing", { ...validDetails, billingSameAsShipping: false }, ["billing"]],
  ])("rejects %s with the invalid field paths and no Medusa call", async (_label, input, fields) => {
    const result = await saveCheckoutDetails(input);

    expect(result).toEqual({ ok: false, error: "invalid_input", fields });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns not_found without a cart cookie", async () => {
    cookieValue = undefined;
    expect(await saveCheckoutDetails(validDetails)).toEqual({ ok: false, error: "not_found" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns unavailable when the backend is down", async () => {
    installBackend({ down: true });
    expect(await saveCheckoutDetails(validDetails)).toEqual({ ok: false, error: "unavailable" });
    expect(refreshMock).not.toHaveBeenCalled();
  });
});

describe("selectShippingOptions", () => {
  it("sets the chosen method (pickup at the cellar)", async () => {
    const result = await selectShippingOptions({ optionIds: ["so_PICKUP"] });

    expect(result).toEqual({ ok: true });
    expect(requests()).toEqual(["GET /store/shipping-options", `POST /store/carts/${CART_ID}/shipping-methods`]);
    expect(lastBody).toEqual([{ option_id: "so_PICKUP" }]);
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("refuses an option Medusa does not offer for this cart", async () => {
    expect(await selectShippingOptions({ optionIds: ["so_FOREIGN"] })).toEqual({ ok: false, error: "not_allowed" });
    expect(requests()).toEqual(["GET /store/shipping-options"]);
  });

  it("refuses two options for the same group (shipping profile)", async () => {
    expect(await selectShippingOptions({ optionIds: ["so_STANDARD", "so_PICKUP"] })).toEqual({ ok: false, error: "not_allowed" });
  });

  it.each([[{ optionIds: [] }], [{ optionIds: ["so_A", "so_A"] }], [{ optionIds: ["../x"] }], [{}], ["garbage"]])(
    "rejects invalid input %j without calling Medusa",
    async (input) => {
      expect(await selectShippingOptions(input)).toEqual({ ok: false, error: "invalid_input" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("returns not_found without a cart cookie", async () => {
    cookieValue = undefined;
    expect(await selectShippingOptions({ optionIds: ["so_STANDARD"] })).toEqual({ ok: false, error: "not_found" });
  });
});

describe("groupShippingOptions", () => {
  it("puts courier and pickup in one group for the wine-only catalog (ADR 043)", () => {
    expect(groupShippingOptions(OPTIONS)).toEqual([
      { profileId: GENERAL_PROFILE, options: [OPTIONS[0], OPTIONS[1]] },
    ]);
  });

  it("keeps one group per shipping profile if Medusa offers more than one", () => {
    const other: MedusaShippingOption = { id: "so_OTHER", name: "Other", amount: 0, shipping_profile_id: "sp_OTHER", type: { code: "other" } };
    expect(groupShippingOptions([...OPTIONS, other]).map((g) => [g.profileId, g.options.map((o) => o.id)])).toEqual([
      [GENERAL_PROFILE, ["so_STANDARD", "so_PICKUP"]],
      ["sp_OTHER", ["so_OTHER"]],
    ]);
  });

  it("is empty when Medusa offers nothing", () => {
    expect(groupShippingOptions([])).toEqual([]);
  });
});
