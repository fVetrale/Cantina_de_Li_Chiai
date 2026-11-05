import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let cookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "cantina_last_order" && cookieValue ? { name, value: cookieValue } : undefined),
  }),
}));

import { getLastOrderView } from "@/lib/data/order-session";

const ORDER_ID = "order_0001";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function installBackend(options: { status?: number; down?: boolean } = {}) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    if (options.down) throw new TypeError("fetch failed");
    const url = new URL(String(input));
    if (url.pathname === `/store/orders/${ORDER_ID}`) {
      return json(
        {
          order: {
            id: ORDER_ID,
            display_id: 7,
            email: "buyer@example.it",
            currency_code: "eur",
            item_total: 24,
            shipping_total: 9.9,
            total: 33.9,
            items: [
              { id: "ordli_1", product_title: "Chiai Rosso", product_handle: "chiai-rosso", variant_title: "Bottiglia 0,75 l", quantity: 1, unit_price: 9 },
              { id: "ordli_2", product_title: "Chiai Bianco", product_handle: "chiai-bianco", variant_title: "Bottiglia 0,75 l", quantity: 1, unit_price: 15 },
            ],
            shipping_methods: [
              { id: "osm_1", name: "Spedizione standard", amount: 9.9 },
              { id: "osm_2", name: "Ritiro in cantina", amount: 0 },
            ],
          },
        },
        options.status ?? 200
      );
    }
    return json({ message: "unexpected" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  cookieValue = ORDER_ID;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getLastOrderView", () => {
  it("shows the order from the buyer's own cookie, with Medusa totals", async () => {
    installBackend();
    const view = await getLastOrderView();

    expect(view.status).toBe("ok");
    if (view.status !== "ok") return;
    expect(view.order).toMatchObject({ displayId: 7, email: "buyer@example.it", itemTotal: 24, shippingTotal: 9.9, total: 33.9 });
    expect(view.order.lines.map((l) => [l.title, l.quantity, l.lineTotal])).toEqual([
      ["Chiai Rosso", 1, 9],
      ["Chiai Bianco", 1, 15],
    ]);
    expect(view.order.lines[0].image).toMatch(/^\/images\//);
  });

  it("requests only the fields it shows: no addresses, phone or metadata", async () => {
    const fetchMock = installBackend();
    await getLastOrderView();

    const fields = new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("fields") ?? "";
    for (const forbidden of ["address", "phone", "metadata", "customer"]) {
      expect(fields).not.toContain(forbidden);
    }
  });

  it("shows nothing without the order cookie (no id is ever taken from the URL)", async () => {
    cookieValue = undefined;
    const fetchMock = installBackend();
    expect(await getLastOrderView()).toEqual({ status: "none" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ignores a tampered cookie without calling Medusa", async () => {
    cookieValue = "../carts/cart_0001";
    const fetchMock = installBackend();
    expect(await getLastOrderView()).toEqual({ status: "none" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows nothing for an order Medusa does not know, and unavailable when it is down", async () => {
    installBackend({ status: 404 });
    expect(await getLastOrderView()).toEqual({ status: "none" });
    installBackend({ down: true });
    expect(await getLastOrderView()).toEqual({ status: "unavailable" });
  });
});
