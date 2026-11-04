import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// In-memory replacement for next/headers cookies() (the real one needs a Next request scope).
const cookieJar = new Map<string, { value: string; options?: Record<string, unknown> }>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      cookieJar.set(name, { value, options });
    },
  }),
}));

import { addToCart } from "@/lib/actions/cart";

const REGION_ID = "reg_italy";
const VARIANT_ID = "variant_01ROSSO";

interface BackendState {
  carts: Map<string, { id: string; completed_at: string | null; items: { id: string; variant_id: string; quantity: number }[] }>;
  stock: number;
  nextCartId: number;
  down: boolean;
}

let state: BackendState;
let fetchMock: ReturnType<typeof vi.fn>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function cartBody(id: string) {
  const cart = state.carts.get(id)!;
  return {
    cart: {
      ...cart,
      currency_code: "eur",
      item_total: cart.items.reduce((sum, item) => sum + item.quantity * 9, 0),
    },
  };
}

/** Tiny fake of the Medusa Store API endpoints the cart uses. */
function installBackend() {
  fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    if (state.down) throw new TypeError("fetch failed");
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;

    if (url.pathname === "/store/regions") {
      return json({ regions: [{ id: REGION_ID, countries: [{ iso_2: "it" }] }] });
    }
    if (url.pathname === "/store/carts" && method === "POST") {
      expect(body).toEqual({ region_id: REGION_ID });
      const id = `cart_${String(state.nextCartId++).padStart(4, "0")}`;
      state.carts.set(id, { id, completed_at: null, items: [] });
      return json(cartBody(id));
    }
    const lineItems = url.pathname.match(/^\/store\/carts\/([^/]+)\/line-items$/);
    if (lineItems && method === "POST") {
      const cart = state.carts.get(lineItems[1]);
      if (!cart) return json({ message: "Cart not found" }, 404);
      const already = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      if (already + body.quantity > state.stock) {
        return json({ type: "not_allowed", message: "Some variant does not have the required inventory" }, 400);
      }
      cart.items.push({ id: `item_${cart.items.length}`, variant_id: body.variant_id, quantity: body.quantity });
      return json(cartBody(cart.id));
    }
    const single = url.pathname.match(/^\/store\/carts\/([^/]+)$/);
    if (single && method === "GET") {
      return state.carts.has(single[1]) ? json(cartBody(single[1])) : json({ message: "Cart not found" }, 404);
    }
    return json({ message: "unexpected request" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
}

function cartRequests() {
  return fetchMock.mock.calls.map(([input, init]) => `${(init as RequestInit | undefined)?.method ?? "GET"} ${new URL(String(input)).pathname}`);
}

beforeEach(() => {
  cookieJar.clear();
  state = { carts: new Map(), stock: 60, nextCartId: 1, down: false };
  installBackend();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("addToCart", () => {
  it("creates a cart, stores its id in a secure httpOnly cookie and adds the item", async () => {
    const result = await addToCart({ variantId: VARIANT_ID, quantity: 2 });

    expect(result).toEqual({ ok: true, itemCount: 2 });
    const cookie = cookieJar.get("cantina_cart_id");
    expect(cookie?.value).toBe("cart_0001");
    expect(cookie?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(cookie?.options?.maxAge).toBe(60 * 60 * 24 * 30);
    expect(state.carts.get("cart_0001")?.items).toEqual([
      { id: "item_0", variant_id: VARIANT_ID, quantity: 2 },
    ]);
  });

  it("never caches cart requests", async () => {
    await addToCart({ variantId: VARIANT_ID, quantity: 1 });

    const cartCalls = fetchMock.mock.calls.filter(([input]) => String(input).includes("/store/carts"));
    expect(cartCalls.length).toBeGreaterThan(0);
    for (const [, init] of cartCalls) {
      expect((init as RequestInit).cache).toBe("no-store");
    }
  });

  it("reuses the cart from the cookie on the next add", async () => {
    await addToCart({ variantId: VARIANT_ID, quantity: 2 });
    const second = await addToCart({ variantId: VARIANT_ID, quantity: 3 });

    expect(second).toEqual({ ok: true, itemCount: 5 });
    expect(state.carts.size).toBe(1);
  });

  it("starts a new cart when the cookie points to a completed cart (already an order)", async () => {
    state.carts.set("cart_9999", { id: "cart_9999", completed_at: "2026-11-04T10:00:00Z", items: [] });
    cookieJar.set("cantina_cart_id", { value: "cart_9999" });

    const result = await addToCart({ variantId: VARIANT_ID, quantity: 1 });

    expect(result).toEqual({ ok: true, itemCount: 1 });
    expect(cookieJar.get("cantina_cart_id")?.value).toBe("cart_0001");
  });

  it("starts a new cart when the cookie points to a cart Medusa no longer has", async () => {
    cookieJar.set("cantina_cart_id", { value: "cart_GONE" });

    const result = await addToCart({ variantId: VARIANT_ID, quantity: 1 });

    expect(result.ok).toBe(true);
    expect(cookieJar.get("cantina_cart_id")?.value).toBe("cart_0001");
  });

  it("ignores a tampered cookie and never puts it in a URL", async () => {
    cookieJar.set("cantina_cart_id", { value: "../admin/users" });

    const result = await addToCart({ variantId: VARIANT_ID, quantity: 1 });

    expect(result.ok).toBe(true);
    expect(cartRequests().some((r) => r.includes(".."))).toBe(false);
    expect(cookieJar.get("cantina_cart_id")?.value).toBe("cart_0001");
  });

  it("reports out_of_stock when Medusa refuses for lack of inventory", async () => {
    state.stock = 5;
    await addToCart({ variantId: VARIANT_ID, quantity: 4 });

    const result = await addToCart({ variantId: VARIANT_ID, quantity: 2 });

    expect(result).toEqual({ ok: false, error: "out_of_stock" });
  });

  it.each([
    [{ variantId: VARIANT_ID, quantity: 0 }],
    [{ variantId: VARIANT_ID, quantity: 121 }],
    [{ variantId: VARIANT_ID, quantity: 1.5 }],
    [{ variantId: "not-a-variant", quantity: 1 }],
    [{ variantId: "variant_01/../../x", quantity: 1 }],
    [{ quantity: 1 }],
    ["garbage"],
  ])("rejects invalid input %j without calling Medusa", async (input) => {
    const result = await addToCart(input);

    expect(result).toEqual({ ok: false, error: "invalid_input" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cookieJar.size).toBe(0);
  });

  it("reports unavailable (and sets no cookie) when the backend is down", async () => {
    state.down = true;

    const result = await addToCart({ variantId: VARIANT_ID, quantity: 1 });

    expect(result).toEqual({ ok: false, error: "unavailable" });
    expect(cookieJar.size).toBe(0);
  });

  it("keeps the existing cookie when the backend is down (does not lose the cart)", async () => {
    await addToCart({ variantId: VARIANT_ID, quantity: 1 });
    state.down = true;

    const result = await addToCart({ variantId: VARIANT_ID, quantity: 1 });

    expect(result).toEqual({ ok: false, error: "unavailable" });
    expect(cookieJar.get("cantina_cart_id")?.value).toBe("cart_0001");
  });
});
