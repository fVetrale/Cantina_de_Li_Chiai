import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cookie jar replacing next/headers cookies().
const jar = new Map<string, { value: string; options?: Record<string, unknown> }>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: Record<string, unknown>) => jar.set(name, { value, options }),
    delete: (name: string) => jar.delete(name),
  }),
}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));
class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`redirect:${url}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url);
  },
}));

import { placeOrder } from "@/lib/actions/checkout";

const CART_ID = "cart_0001";
const ORDER_ID = "order_0001";
const BIRTH_DATE = "1990-04-17";

interface Backend {
  cartComplete: boolean;
  completeResponse: { status: number; body: unknown };
  down: boolean;
}
let backend: Backend;
let fetchMock: ReturnType<typeof vi.fn>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function cartBody() {
  return {
    cart: {
      id: CART_ID,
      currency_code: "eur",
      email: backend.cartComplete ? "buyer@example.it" : null,
      shipping_address: backend.cartComplete ? { address_1: "Via Roma 1", country_code: "it" } : null,
      shipping_methods: backend.cartComplete ? [{ id: "sm_1", shipping_option_id: "so_STANDARD" }] : [],
    },
  };
}

function installBackend() {
  fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    if (backend.down) throw new TypeError("fetch failed");
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    if (url.pathname === `/store/carts/${CART_ID}`) return json(cartBody());
    if (url.pathname === "/store/payment-collections" && method === "POST") return json({ payment_collection: { id: "pay_col_1" } });
    if (url.pathname === "/store/payment-collections/pay_col_1/payment-sessions") return json({ payment_collection: { id: "pay_col_1" } });
    if (url.pathname === `/store/carts/${CART_ID}/complete`) return json(backend.completeResponse.body, backend.completeResponse.status);
    return json({ message: "unexpected" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
}

function calls() {
  return fetchMock.mock.calls.map(([input, init]) => ({
    method: (init as RequestInit | undefined)?.method ?? "GET",
    url: String(input),
    path: new URL(String(input)).pathname,
    body: (init as RequestInit | undefined)?.body ? JSON.parse(String((init as RequestInit).body)) : undefined,
  }));
}

const validInput = { birthDate: BIRTH_DATE, declaredAdult: true, acceptTerms: true, locale: "it" };

async function run(input: unknown) {
  try {
    return { result: await placeOrder(input), redirectedTo: null as string | null };
  } catch (e) {
    if (e instanceof RedirectSignal) return { result: null, redirectedTo: e.url };
    throw e;
  }
}

beforeEach(() => {
  jar.clear();
  jar.set("cantina_cart_id", { value: CART_ID });
  backend = { cartComplete: true, completeResponse: { status: 200, body: { type: "order", order: { id: ORDER_ID } } }, down: false };
  installBackend();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("placeOrder", () => {
  it("places the order, swaps the cart cookie for an httpOnly order cookie and redirects", async () => {
    const { redirectedTo } = await run(validInput);

    expect(redirectedTo).toBe("/ordine/confermato");
    expect(calls().map((c) => `${c.method} ${c.path}`)).toEqual([
      `GET /store/carts/${CART_ID}`,
      `POST /store/carts/${CART_ID}`,
      "POST /store/payment-collections",
      "POST /store/payment-collections/pay_col_1/payment-sessions",
      `POST /store/carts/${CART_ID}/complete`,
    ]);
    expect(calls()[3].body).toEqual({ provider_id: "pp_system_default" });
    expect(jar.has("cantina_cart_id")).toBe(false);
    expect(jar.get("cantina_last_order")).toMatchObject({
      value: ORDER_ID,
      options: { httpOnly: true, sameSite: "lax", path: "/", maxAge: 86400 },
    });
  });

  it("stores only a declaration without personal data, and never sends the date of birth", async () => {
    await run(validInput);

    const metadataCall = calls().find((c) => c.method === "POST" && c.path === `/store/carts/${CART_ID}`);
    expect(metadataCall?.body).toEqual({
      metadata: {
        age_verification: {
          method: "self_declaration",
          declared_adult: true,
          minimum_age: 18,
          declared_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        },
      },
    });
    const everythingSent = JSON.stringify(calls());
    expect(everythingSent).not.toContain(BIRTH_DATE);
    expect(everythingSent).not.toContain("1990");
  });

  it("redirects to the English confirmation page", async () => {
    expect((await run({ ...validInput, locale: "en" })).redirectedTo).toBe("/ordine/confermato?lang=en");
  });

  it("refuses an under-18 buyer before contacting Medusa", async () => {
    const eighteenTomorrow = new Date();
    eighteenTomorrow.setFullYear(eighteenTomorrow.getFullYear() - 18);
    eighteenTomorrow.setDate(eighteenTomorrow.getDate() + 2);
    const birthDate = eighteenTomorrow.toISOString().slice(0, 10);

    expect((await run({ ...validInput, birthDate })).result).toEqual({ ok: false, error: "underage" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(jar.get("cantina_cart_id")?.value).toBe(CART_ID);
  });

  it.each([
    ["impossible date", { ...validInput, birthDate: "1990-02-30" }],
    ["wrong format", { ...validInput, birthDate: "17/04/1990" }],
    ["future date", { ...validInput, birthDate: "2099-01-01" }],
    ["no declaration", { ...validInput, declaredAdult: false }],
    ["terms not accepted", { ...validInput, acceptTerms: false }],
    ["unknown locale", { ...validInput, locale: "fr" }],
    ["garbage", "garbage"],
  ])("rejects %s as invalid input without contacting Medusa", async (_label, input) => {
    expect((await run(input)).result).toEqual({ ok: false, error: "invalid_input" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns not_found without a cart cookie", async () => {
    jar.clear();
    expect((await run(validInput)).result).toEqual({ ok: false, error: "not_found" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns incomplete (and writes nothing) when details or shipping are missing", async () => {
    backend.cartComplete = false;
    expect((await run(validInput)).result).toEqual({ ok: false, error: "incomplete" });
    expect(calls().map((c) => c.method)).toEqual(["GET"]);
  });

  it("maps the backend age-verification refusal and keeps the cart", async () => {
    backend.completeResponse = {
      status: 400,
      body: { type: "not_allowed", message: "Age verification required: the buyer must declare to be at least 18 years old." },
    };
    expect((await run(validInput)).result).toEqual({ ok: false, error: "age_rejected" });
    expect(jar.get("cantina_cart_id")?.value).toBe(CART_ID);
    expect(jar.has("cantina_last_order")).toBe(false);
  });

  it("maps out-of-stock at completion", async () => {
    backend.completeResponse = { status: 400, body: { message: "Some variant does not have the required inventory" } };
    expect((await run(validInput)).result).toEqual({ ok: false, error: "out_of_stock" });
  });

  it("maps other completion refusals (e.g. a shipping profile not covered)", async () => {
    backend.completeResponse = {
      status: 400,
      body: { type: "invalid_data", message: "The cart items require shipping profiles that are not satisfied by the current shipping methods" },
    };
    expect((await run(validInput)).result).toEqual({ ok: false, error: "rejected" });
  });

  it("maps a payment error returned as a cart", async () => {
    backend.completeResponse = { status: 200, body: { type: "cart", error: { message: "Payment authorization failed" } } };
    expect((await run(validInput)).result).toEqual({ ok: false, error: "payment_failed" });
    expect(jar.get("cantina_cart_id")?.value).toBe(CART_ID);
  });

  it("returns unavailable when the backend is down", async () => {
    backend.down = true;
    expect((await run(validInput)).result).toEqual({ ok: false, error: "unavailable" });
  });
});
