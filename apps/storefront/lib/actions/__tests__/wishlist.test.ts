import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let authCookie: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "cantina_auth" && authCookie ? { name, value: authCookie } : undefined),
  }),
}));
const refreshMock = vi.fn();
vi.mock("next/cache", () => ({ refresh: () => refreshMock() }));

import { toggleWishlist } from "@/lib/actions/wishlist";
import { MAX_WISHLIST_ITEMS, parseWishlist } from "@/lib/data/wishlist";

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhY3Rvcl9pZCI6ImN1c19BIn0.c2ln";
const ROSSO = "prod_ROSSO";
const BIANCO = "prod_BIANCO";

let metadata: Record<string, unknown>;
let fetchMock: ReturnType<typeof vi.fn>;
let writes: unknown[];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function catalogProduct(id: string, handle: string) {
  return {
    id,
    title: handle,
    handle,
    categories: [{ id: "pcat", name: "Vini Rossi", handle: "vini-rossi" }],
    variants: [
      {
        id: `variant_${id}`,
        manage_inventory: true,
        inventory_quantity: 10,
        calculated_price: { calculated_amount: 9, calculated_amount_with_tax: 9, is_calculated_price_tax_inclusive: true, currency_code: "eur" },
      },
    ],
  };
}

function installBackend() {
  fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    if (url.pathname === "/store/regions") return json({ regions: [{ id: "reg_it", countries: [{ iso_2: "it" }] }] });
    if (url.pathname === "/store/products") return json({ products: [catalogProduct(ROSSO, "chiai-rosso"), catalogProduct(BIANCO, "chiai-bianco")] });
    const auth = (init?.headers as Record<string, string> | undefined)?.authorization;
    if (url.pathname === "/store/customers/me") {
      if (auth !== `Bearer ${TOKEN}`) return json({ message: "Unauthorized" }, 401);
      if (method === "POST") {
        const body = JSON.parse(String(init?.body));
        writes.push(body);
        metadata = body.metadata; // the fake replaces: our code must send everything back
      }
      return json({ customer: { id: "cus_A", metadata } });
    }
    return json({ message: "unexpected" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
}

beforeEach(() => {
  authCookie = TOKEN;
  metadata = { newsletter: true };
  writes = [];
  refreshMock.mockClear();
  installBackend();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("toggleWishlist", () => {
  it("adds a catalog product and keeps the customer's other metadata", async () => {
    expect(await toggleWishlist({ productId: ROSSO })).toEqual({ ok: true, inWishlist: true });
    expect(metadata).toEqual({ newsletter: true, wishlist: [ROSSO] });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("puts the newest product first and removes it on the second toggle", async () => {
    await toggleWishlist({ productId: ROSSO });
    await toggleWishlist({ productId: BIANCO });
    expect(metadata.wishlist).toEqual([BIANCO, ROSSO]);

    expect(await toggleWishlist({ productId: ROSSO })).toEqual({ ok: true, inWishlist: false });
    expect(metadata).toEqual({ newsletter: true, wishlist: [BIANCO] });
  });

  it("requires login: guests get unauthenticated and nothing is called", async () => {
    authCookie = undefined;
    expect(await toggleWishlist({ productId: ROSSO })).toEqual({ ok: false, error: "unauthenticated" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps an expired token to unauthenticated", async () => {
    authCookie = "eyJ.eyJ.expired";
    expect(await toggleWishlist({ productId: ROSSO })).toEqual({ ok: false, error: "unauthenticated" });
  });

  it("refuses a product that is not in the catalog, without writing", async () => {
    expect(await toggleWishlist({ productId: "prod_UNKNOWN" })).toEqual({ ok: false, error: "not_found" });
    expect(writes).toEqual([]);
  });

  it.each([[{ productId: "variant_1" }], [{ productId: "prod_1/../x" }], [{}], ["garbage"]])(
    "rejects invalid input %j without calling Medusa",
    async (input) => {
      expect(await toggleWishlist(input)).toEqual({ ok: false, error: "invalid_input" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("stops at the maximum number of favourites", async () => {
    metadata = { wishlist: Array.from({ length: MAX_WISHLIST_ITEMS }, (_, i) => `prod_X${i}`) };
    expect(await toggleWishlist({ productId: ROSSO })).toEqual({ ok: false, error: "limit_reached" });
    expect(writes).toEqual([]);
  });
});

describe("parseWishlist", () => {
  it("keeps only valid, unique product ids", () => {
    expect(parseWishlist({ wishlist: [ROSSO, ROSSO, "junk", 42, null, "prod_1/../x", BIANCO] })).toEqual([ROSSO, BIANCO]);
  });

  it("is empty for missing or malformed metadata", () => {
    expect(parseWishlist(null)).toEqual([]);
    expect(parseWishlist({ wishlist: "prod_ROSSO" })).toEqual([]);
    expect(parseWishlist([ROSSO])).toEqual([]);
  });
});
