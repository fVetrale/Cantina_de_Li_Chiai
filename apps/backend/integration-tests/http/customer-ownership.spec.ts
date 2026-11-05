import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createApiKeysWorkflow } from "@medusajs/medusa/core-flows"

jest.setTimeout(120 * 1000)

/**
 * Ownership (IDOR) tests for customer data used by the reserved area (ADR 041).
 * They run against Medusa's built-in Store API on a temporary database and prove that:
 * - customer data is not readable without authentication (401);
 * - a customer cannot read, change or delete another customer's address (404);
 * - the order list is always scoped to the authenticated customer.
 */
medusaIntegrationTestRunner({
  env: {},
  testSuite: ({ api, getContainer }) => {
    let publishableKey: string

    const storeHeaders = (token?: string) => ({
      headers: {
        "x-publishable-api-key": publishableKey,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })

    /** Registers a customer through the real auth flow and returns a login token. */
    async function createCustomer(email: string): Promise<string> {
      const password = "Una-password-lunga!"
      const registration = await api.post("/auth/customer/emailpass/register", { email, password })
      await api.post(
        "/store/customers",
        { email, first_name: "Test", last_name: "Cliente" },
        storeHeaders(registration.data.token)
      )
      const login = await api.post("/auth/customer/emailpass", { email, password })
      return login.data.token
    }

    /** Status of a request that may fail (axios throws on 4xx). */
    async function statusOf(request: Promise<unknown>): Promise<number> {
      try {
        const response = (await request) as { status: number }
        return response.status
      } catch (error) {
        return (error as { response?: { status: number } }).response?.status ?? 0
      }
    }

    beforeEach(async () => {
      const { result } = await createApiKeysWorkflow(getContainer()).run({
        input: { api_keys: [{ title: "Test storefront", type: "publishable", created_by: "test" }] },
      })
      publishableKey = result[0].token
    })

    it("refuses customer data without authentication (401)", async () => {
      expect(await statusOf(api.get("/store/customers/me", storeHeaders()))).toEqual(401)
      expect(await statusOf(api.get("/store/customers/me/addresses", storeHeaders()))).toEqual(401)
      expect(await statusOf(api.get("/store/orders", storeHeaders()))).toEqual(401)
    })

    it("refuses an invalid token (401)", async () => {
      expect(await statusOf(api.get("/store/customers/me", storeHeaders("eyJ.eyJ.forged")))).toEqual(401)
    })

    it("does not let customer B read, change or delete customer A's address (404)", async () => {
      const tokenA = await createCustomer("cliente-a@example.it")
      const tokenB = await createCustomer("cliente-b@example.it")

      const created = await api.post(
        "/store/customers/me/addresses",
        {
          first_name: "Anna",
          last_name: "A",
          address_1: "Via Segreta 1",
          city: "Salerno",
          postal_code: "84100",
          country_code: "it",
        },
        storeHeaders(tokenA)
      )
      const addressId = created.data.customer.addresses[0].id as string

      // B's own address book does not contain A's address.
      const listB = await api.get("/store/customers/me/addresses", storeHeaders(tokenB))
      expect(listB.data.addresses.map((a: { id: string }) => a.id)).not.toContain(addressId)

      const path = `/store/customers/me/addresses/${addressId}`
      expect(await statusOf(api.get(path, storeHeaders(tokenB)))).toEqual(404)
      expect(await statusOf(api.post(path, { city: "Hacked" }, storeHeaders(tokenB)))).toEqual(404)
      expect(await statusOf(api.delete(path, storeHeaders(tokenB)))).toEqual(404)

      // A's address is untouched.
      const own = await api.get(path, storeHeaders(tokenA))
      expect(own.status).toEqual(200)
      expect(own.data.address.city).toEqual("Salerno")
    })

    it("scopes the order list to the authenticated customer, even when filtering by id", async () => {
      const tokenB = await createCustomer("cliente-c@example.it")

      const all = await api.get("/store/orders", storeHeaders(tokenB))
      expect(all.status).toEqual(200)
      expect(all.data.orders).toEqual([])

      const byForeignId = await api.get("/store/orders?id=order_01FOREIGN000000000000000", storeHeaders(tokenB))
      expect(byForeignId.data.orders).toEqual([])
    })
  },
})
