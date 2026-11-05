import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getProductByHandle, getProducts } from "@/lib/data/products";

const REGION_ID = "reg_italy";

interface PriceInput {
  amount: number;
  withTax?: number;
  taxInclusive?: boolean;
}

interface StockInput {
  manage?: boolean;
  qty?: number | null;
  backorder?: boolean;
}

function rawProduct(
  handle: string,
  price: PriceInput | null,
  extra: Record<string, unknown> = {},
  stock: StockInput = { manage: true, qty: 60 }
) {
  return {
    id: `prod_${handle}`,
    title: `Title ${handle}`,
    handle,
    description: "desc",
    thumbnail: null,
    images: [],
    categories: [{ id: "pcat_rossi", name: "Vini Rossi", handle: "vini-rossi" }],
    variants: [
      {
        id: `variant_${handle}`,
        sku: `SKU-${handle}`,
        manage_inventory: stock.manage ?? true,
        allow_backorder: stock.backorder ?? false,
        inventory_quantity: stock.qty,
        calculated_price: price
          ? {
              calculated_amount: price.amount,
              calculated_amount_with_tax: price.withTax ?? price.amount,
              is_calculated_price_tax_inclusive: price.taxInclusive ?? true,
              currency_code: "eur",
            }
          : null,
      },
    ],
    ...extra,
  };
}

const italyRegions = {
  regions: [
    { id: "reg_other", countries: [{ iso_2: "fr" }] },
    { id: REGION_ID, countries: [{ iso_2: "it" }] },
  ],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Mocks fetch: /store/regions → regions, /store/products → products. */
function mockBackend(options: {
  regions?: unknown;
  products?: unknown;
  productsStatus?: number;
}) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input : input.url);
    if (url.pathname === "/store/regions") {
      return jsonResponse(options.regions ?? italyRegions);
    }
    if (url.pathname === "/store/products") {
      return jsonResponse(options.products ?? { products: [] }, options.productsStatus ?? 200);
    }
    return jsonResponse({ message: "not found" }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function productsRequestUrl(fetchMock: ReturnType<typeof mockBackend>): URL {
  const call = fetchMock.mock.calls.find(([input]) => String(input).includes("/store/products"));
  if (!call) {
    throw new Error("no /store/products request");
  }
  return new URL(String(call[0]));
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getProducts", () => {
  it("asks Medusa for region-aware prices of the Italy region", async () => {
    const fetchMock = mockBackend({ products: { products: [rawProduct("chiai-rosso", { amount: 9 })] } });

    await getProducts();

    const url = productsRequestUrl(fetchMock);
    expect(url.searchParams.get("region_id")).toBe(REGION_ID);
    expect(url.searchParams.get("country_code")).toBe("it");
    expect(url.searchParams.get("fields")).toContain("*variants.calculated_price");
    expect(url.searchParams.get("fields")).toContain("+variants.inventory_quantity");
  });

  it("returns the IVA-included price and the variant id", async () => {
    mockBackend({ products: { products: [rawProduct("chiai-rosso", { amount: 9 })] } });

    const result = await getProducts();

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toMatchObject({
      handle: "chiai-rosso",
      price: 9,
      currencyCode: "EUR",
      variantId: "variant_chiai-rosso",
    });
  });

  it("uses the amount with tax when prices are tax-exclusive", async () => {
    mockBackend({
      products: {
        products: [rawProduct("chiai-rosso", { amount: 9, withTax: 10.98, taxInclusive: false })],
      },
    });

    const result = await getProducts();

    expect(result.status === "ok" && result.products[0].price).toBe(10.98);
  });

  it("never divides prices above 100 (no cents heuristic)", async () => {
    mockBackend({ products: { products: [rawProduct("riserva", { amount: 120 })] } });

    const result = await getProducts();

    expect(result.status === "ok" && result.products[0].price).toBe(120);
  });

  it("hides products without a price for the region instead of inventing one", async () => {
    mockBackend({
      products: {
        products: [rawProduct("chiai-rosso", { amount: 9 }), rawProduct("senza-prezzo", null)],
      },
    });

    const result = await getProducts();

    expect(result.status === "ok" && result.products.map((p) => p.handle)).toEqual(["chiai-rosso"]);
  });

  it("does not merge local fallback products into the backend results", async () => {
    mockBackend({ products: { products: [rawProduct("chiai-rosso", { amount: 9 })] } });

    const result = await getProducts();

    // FALLBACK_PRODUCTS holds 14 items: only the real backend product must be returned.
    expect(result.status === "ok" && result.products).toHaveLength(1);
  });

  it("filters out legacy Sardinian products", async () => {
    mockBackend({
      products: {
        products: [
          rawProduct("chiai-rosso", { amount: 9 }),
          rawProduct("cannonau-di-sardegna-doc-riserva", { amount: 20 }),
        ],
      },
    });

    const result = await getProducts();

    expect(result.status === "ok" && result.products.map((p) => p.handle)).toEqual(["chiai-rosso"]);
  });

  it("filters by category handle", async () => {
    mockBackend({
      products: {
        products: [
          rawProduct("chiai-rosso", { amount: 9 }),
          rawProduct("bianco-dolce", { amount: 10 }, {
            categories: [{ id: "pcat_dolci", name: "Vini Dolci", handle: "vini-dolci" }],
          }),
        ],
      },
    });

    const result = await getProducts("vini-dolci");

    expect(result.status === "ok" && result.products.map((p) => p.handle)).toEqual(["bianco-dolce"]);
  });

  it("is unavailable when the backend cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    expect(await getProducts()).toEqual({ status: "unavailable" });
  });

  it("is unavailable when Medusa answers with an error status", async () => {
    mockBackend({ products: { message: "boom" }, productsStatus: 500 });

    expect(await getProducts()).toEqual({ status: "unavailable" });
  });

  it("is unavailable when the response has an unexpected shape", async () => {
    mockBackend({ products: { products: [{ title: "no id" }] } });

    expect(await getProducts()).toEqual({ status: "unavailable" });
  });

  it("is unavailable when no region sells to Italy", async () => {
    const fetchMock = mockBackend({ regions: { regions: [{ id: "reg_fr", countries: [{ iso_2: "fr" }] }] } });

    expect(await getProducts()).toEqual({ status: "unavailable" });
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes("/store/products"))).toBe(false);
  });
});

describe("availableQuantity (real Medusa stock)", () => {
  async function availabilityFor(stock: StockInput) {
    mockBackend({ products: { products: [rawProduct("chiai-rosso", { amount: 9 }, {}, stock)] } });
    const result = await getProducts();
    if (result.status !== "ok") throw new Error("expected ok");
    return result.products[0].availableQuantity;
  }

  it("is the Medusa inventory quantity when stock is managed", async () => {
    expect(await availabilityFor({ manage: true, qty: 37 })).toBe(37);
  });

  it("is 0 (sold out) when managed stock is empty, missing or negative", async () => {
    expect(await availabilityFor({ manage: true, qty: 0 })).toBe(0);
    expect(await availabilityFor({ manage: true, qty: null })).toBe(0);
    expect(await availabilityFor({ manage: true, qty: -3 })).toBe(0);
  });

  it("is null (no limit) when stock is not managed or backorders are allowed", async () => {
    expect(await availabilityFor({ manage: false, qty: 5 })).toBeNull();
    expect(await availabilityFor({ manage: true, qty: 5, backorder: true })).toBeNull();
  });

  it("never comes from the local editorial metadata", async () => {
    // chiai-rosso has local metadata; the stock must still be Medusa's value.
    expect(await availabilityFor({ manage: true, qty: 2 })).toBe(2);
  });
});

describe("getProductByHandle", () => {
  it("returns the product with its price and variant id", async () => {
    const fetchMock = mockBackend({ products: { products: [rawProduct("chiai-rosso", { amount: 9 })] } });

    const result = await getProductByHandle("chiai-rosso");

    expect(result).toMatchObject({ status: "ok", product: { price: 9, variantId: "variant_chiai-rosso" } });
    expect(productsRequestUrl(fetchMock).searchParams.get("handle")).toBe("chiai-rosso");
  });

  it("is not_found when Medusa has no product with that handle", async () => {
    mockBackend({ products: { products: [] } });

    expect(await getProductByHandle("non-esiste")).toEqual({ status: "not_found" });
  });

  it("is not_found when the product has no price for the region", async () => {
    mockBackend({ products: { products: [rawProduct("senza-prezzo", null)] } });

    expect(await getProductByHandle("senza-prezzo")).toEqual({ status: "not_found" });
  });

  it("is unavailable (not a 404) when the backend is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    expect(await getProductByHandle("chiai-rosso")).toEqual({ status: "unavailable" });
  });
});
