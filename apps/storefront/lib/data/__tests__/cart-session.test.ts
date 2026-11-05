import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let cookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "cantina_cart_id" && cookieValue ? { name, value: cookieValue } : undefined),
  }),
}));

import { getCurrentCartSummary, getCurrentCartView } from "@/lib/data/cart-session";

const CART_ID = "cart_0001";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const wineLine = {
  id: "cali_0001",
  variant_id: "variant_ROSSO",
  product_id: "prod_ROSSO",
  product_handle: "chiai-rosso",
  product_title: "Chiai Rosso",
  variant_title: "Bottiglia 0,75 l",
  thumbnail: null,
  unit_price: 9,
  quantity: 2,
};
const whiteLine = {
  id: "cali_0002",
  variant_id: "variant_BIANCO",
  product_id: "prod_BIANCO",
  product_handle: "chiai-bianco",
  product_title: "Chiai Bianco",
  variant_title: "Bottiglia 0,75 l",
  thumbnail: null,
  unit_price: 15,
  quantity: 1,
};

function installBackend(options: { cart?: unknown; cartStatus?: number; products?: unknown; down?: boolean } = {}) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    if (options.down) throw new TypeError("fetch failed");
    const url = new URL(String(input));
    if (url.pathname === `/store/carts/${CART_ID}`) {
      return json(options.cart ?? { cart: { id: CART_ID, currency_code: "eur", item_total: 33, items: [wineLine, whiteLine] } }, options.cartStatus ?? 200);
    }
    if (url.pathname === "/store/products") {
      return json(
        options.products ?? {
          products: [
            {
              id: "prod_ROSSO",
              variants: [{ id: "variant_ROSSO", manage_inventory: true, allow_backorder: false, inventory_quantity: 58 }],
            },
            {
              id: "prod_BIANCO",
              variants: [{ id: "variant_BIANCO", manage_inventory: true, allow_backorder: false, inventory_quantity: 9 }],
            },
          ],
        }
      );
    }
    return json({ message: "unexpected" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  cookieValue = CART_ID;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getCurrentCartSummary (Navbar counter)", () => {
  it("counts units and the IVA-included items total", async () => {
    installBackend();
    expect(await getCurrentCartSummary()).toEqual({ id: CART_ID, itemCount: 3, itemTotal: 33, currencyCode: "EUR" });
  });

  it("is null without a cookie, without calling Medusa", async () => {
    cookieValue = undefined;
    const fetchMock = installBackend();
    expect(await getCurrentCartSummary()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("is null (never throws) when the backend is down", async () => {
    installBackend({ down: true });
    expect(await getCurrentCartSummary()).toBeNull();
  });

  it("is null for a completed cart (already an order)", async () => {
    installBackend({ cart: { cart: { id: CART_ID, currency_code: "eur", completed_at: "2026-11-04T10:00:00Z", items: [wineLine] } } });
    expect(await getCurrentCartSummary()).toBeNull();
  });
});

describe("getCurrentCartView (/carrello)", () => {
  it("maps lines with live stock, line totals and local images", async () => {
    const fetchMock = installBackend();

    const view = await getCurrentCartView();

    expect(view.status).toBe("ok");
    if (view.status !== "ok") return;
    expect(view.cart).toMatchObject({ itemCount: 3, itemTotal: 33, currencyCode: "EUR" });
    expect(view.cart.lines).toEqual([
      expect.objectContaining({ id: "cali_0001", handle: "chiai-rosso", quantity: 2, unitPrice: 9, lineTotal: 18, available: 58 }),
      expect.objectContaining({ id: "cali_0002", handle: "chiai-bianco", lineTotal: 15, available: 9 }),
    ]);
    expect(view.cart.lines[0].image).toMatch(/^\/images\//);

    const productsCall = fetchMock.mock.calls.find(([input]) => String(input).includes("/store/products"));
    const url = new URL(String(productsCall?.[0]));
    expect(url.searchParams.getAll("id[]").sort()).toEqual(["prod_BIANCO", "prod_ROSSO"]);
    expect(url.searchParams.get("fields")).toContain("+variants.inventory_quantity");
  });

  it("still renders the cart (without stock limits) if the stock lookup fails", async () => {
    installBackend({ products: { unexpected: true } });

    const view = await getCurrentCartView();

    expect(view.status === "ok" && view.cart.lines.map((l) => l.available)).toEqual([null, null]);
  });

  it("is empty without a cookie, for a cart with no items, or for a cart Medusa no longer has", async () => {
    cookieValue = undefined;
    installBackend();
    expect(await getCurrentCartView()).toEqual({ status: "empty" });

    cookieValue = CART_ID;
    installBackend({ cart: { cart: { id: CART_ID, currency_code: "eur", items: [] } } });
    expect(await getCurrentCartView()).toEqual({ status: "empty" });

    installBackend({ cart: { message: "not found" }, cartStatus: 404 });
    expect(await getCurrentCartView()).toEqual({ status: "empty" });
  });

  it("is unavailable when the backend is down", async () => {
    installBackend({ down: true });
    expect(await getCurrentCartView()).toEqual({ status: "unavailable" });
  });

  it("ignores a tampered cookie (never sent in a URL)", async () => {
    cookieValue = "../../admin";
    const fetchMock = installBackend();
    expect(await getCurrentCartView()).toEqual({ status: "empty" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
