import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jar = new Map<string, { value: string; options?: Record<string, unknown> }>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: Record<string, unknown>) => jar.set(name, { value, options }),
    delete: (name: string) => jar.delete(name),
  }),
}));
const refreshMock = vi.fn();
vi.mock("next/cache", () => ({ refresh: () => refreshMock() }));

import { login, logout, register } from "@/lib/actions/auth";
import { getCurrentCustomer } from "@/lib/data/auth-session";

// Fake JWTs (three base64url parts).
const LOGIN_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhY3Rvcl9pZCI6ImN1c18xIn0.c2lnbmF0dXJl";
const REGISTRATION_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJyZWdpc3RyYXRpb24iOnRydWV9.cmVnLXNpZw";
const PASSWORD = "Una-password-lunga!";

interface Backend {
  users: Map<string, string>; // email -> password
  down: boolean;
}
let backend: Backend;
let fetchMock: ReturnType<typeof vi.fn>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function installBackend() {
  fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    if (backend.down) throw new TypeError("fetch failed");
    const url = new URL(String(input));
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const auth = (init?.headers as Record<string, string> | undefined)?.authorization;
    switch (url.pathname) {
      case "/auth/customer/emailpass":
        return backend.users.get(body.email) === body.password
          ? json({ token: LOGIN_TOKEN })
          : json({ type: "unauthorized", message: "Invalid email or password" }, 401);
      case "/auth/customer/emailpass/register":
        if (backend.users.has(body.email)) return json({ type: "unauthorized", message: "Identity with email already exists" }, 401);
        backend.users.set(body.email, body.password);
        return json({ token: REGISTRATION_TOKEN });
      case "/store/customers":
        if (auth !== `Bearer ${REGISTRATION_TOKEN}`) return json({ message: "Unauthorized" }, 401);
        return json({ customer: { id: "cus_1", email: body.email, first_name: body.first_name, last_name: body.last_name } });
      case "/store/customers/me":
        if (auth !== `Bearer ${LOGIN_TOKEN}`) return json({ message: "Unauthorized" }, 401);
        return json({ customer: { id: "cus_1", email: "maria@example.it", first_name: "Maria", last_name: "Rossi" } });
      case "/store/carts/cart_GUEST/customer":
        return auth === `Bearer ${LOGIN_TOKEN}`
          ? json({ cart: { id: "cart_GUEST", currency_code: "eur", items: [] } })
          : json({ message: "Unauthorized" }, 401);
      default:
        return json({ message: "unexpected" }, 500);
    }
  });
  vi.stubGlobal("fetch", fetchMock);
}

function calls() {
  return fetchMock.mock.calls.map(([input, init]) => ({
    url: String(input),
    path: new URL(String(input)).pathname,
    auth: ((init as RequestInit | undefined)?.headers as Record<string, string> | undefined)?.authorization,
  }));
}

beforeEach(() => {
  jar.clear();
  refreshMock.mockClear();
  backend = { users: new Map([["maria@example.it", PASSWORD]]), down: false };
  installBackend();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("login", () => {
  it("stores the token only in a secure httpOnly cookie and never returns it", async () => {
    const result = await login({ email: "Maria@Example.it", password: PASSWORD });

    expect(result).toEqual({ ok: true });
    expect(JSON.stringify(result)).not.toContain(LOGIN_TOKEN);
    expect(jar.get("cantina_auth")).toEqual({
      value: LOGIN_TOKEN,
      options: { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 86400 },
    });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("links the guest cart to the customer with the new token", async () => {
    jar.set("cantina_cart_id", { value: "cart_GUEST" });

    await login({ email: "maria@example.it", password: PASSWORD });

    expect(calls()).toContainEqual(expect.objectContaining({ path: "/store/carts/cart_GUEST/customer", auth: `Bearer ${LOGIN_TOKEN}` }));
  });

  it("gives the same generic error for a wrong password and an unknown email", async () => {
    expect(await login({ email: "maria@example.it", password: "sbagliata-123" })).toEqual({ ok: false, error: "invalid_credentials" });
    expect(await login({ email: "nessuno@example.it", password: PASSWORD })).toEqual({ ok: false, error: "invalid_credentials" });
    expect(jar.has("cantina_auth")).toBe(false);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it.each([
    [{ email: "non-email", password: PASSWORD }, ["email"]],
    [{ email: "maria@example.it", password: "" }, ["password"]],
    [{ email: "maria@example.it", password: "x".repeat(129) }, ["password"]],
  ])("rejects invalid input %j without calling Medusa", async (input, fields) => {
    expect(await login(input)).toEqual({ ok: false, error: "invalid_input", fields });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never puts the email or the password in a URL", async () => {
    await login({ email: "maria@example.it", password: PASSWORD });
    for (const call of calls()) {
      expect(call.url).not.toContain("maria");
      expect(call.url).not.toContain(PASSWORD);
    }
  });

  it("reports unavailable when the backend is down", async () => {
    backend.down = true;
    expect(await login({ email: "maria@example.it", password: PASSWORD })).toEqual({ ok: false, error: "unavailable" });
  });
});

describe("register", () => {
  const valid = {
    firstName: " Luca ",
    lastName: "Bianchi",
    email: "Luca@Example.it",
    password: PASSWORD,
    ageConfirmed: true,
    privacyAccepted: true,
  };

  it("creates identity and customer, then logs in and sets the cookie", async () => {
    expect(await register(valid)).toEqual({ ok: true });

    expect(calls().map((c) => [c.path, c.auth])).toEqual([
      ["/auth/customer/emailpass/register", undefined],
      ["/store/customers", `Bearer ${REGISTRATION_TOKEN}`],
      ["/auth/customer/emailpass", undefined],
    ]);
    expect(backend.users.get("luca@example.it")).toBe(PASSWORD);
    expect(jar.get("cantina_auth")?.value).toBe(LOGIN_TOKEN);
  });

  it("does not reveal that an email is already registered", async () => {
    expect(await register({ ...valid, email: "maria@example.it" })).toEqual({ ok: false, error: "rejected" });
    expect(jar.has("cantina_auth")).toBe(false);
  });

  it.each([
    ["short password", { password: "corta" }, ["password"]],
    ["missing first name", { firstName: "  " }, ["firstName"]],
    ["age not confirmed", { ageConfirmed: false }, ["ageConfirmed"]],
    ["privacy not accepted", { privacyAccepted: false }, ["privacyAccepted"]],
    ["bad email", { email: "luca" }, ["email"]],
  ])("rejects %s without calling Medusa", async (_label, override, fields) => {
    expect(await register({ ...valid, ...override })).toEqual({ ok: false, error: "invalid_input", fields });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("removes the auth cookie and the cart cookie (the cart may hold personal data)", async () => {
    jar.set("cantina_auth", { value: LOGIN_TOKEN });
    jar.set("cantina_cart_id", { value: "cart_GUEST" });

    await logout();

    expect(jar.has("cantina_auth")).toBe(false);
    expect(jar.has("cantina_cart_id")).toBe(false);
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});

describe("getCurrentCustomer", () => {
  it("is null for guests, without calling Medusa", async () => {
    expect(await getCurrentCustomer()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ignores a cookie that is not a JWT, without calling Medusa", async () => {
    jar.set("cantina_auth", { value: "not a token\r\nX-Injected: 1" });
    expect(await getCurrentCustomer()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads the customer with the token from the cookie", async () => {
    jar.set("cantina_auth", { value: LOGIN_TOKEN });
    expect(await getCurrentCustomer()).toEqual({ id: "cus_1", email: "maria@example.it", firstName: "Maria", lastName: "Rossi" });
    expect(calls()).toEqual([expect.objectContaining({ path: "/store/customers/me", auth: `Bearer ${LOGIN_TOKEN}` })]);
  });

  it("treats an expired or invalid token as a guest", async () => {
    jar.set("cantina_auth", { value: "eyJ.eyJ.expired" });
    expect(await getCurrentCustomer()).toBeNull();
  });
});
