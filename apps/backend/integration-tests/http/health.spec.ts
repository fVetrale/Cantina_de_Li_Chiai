import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(60 * 1000)

// Smoke test: boots the Medusa app against a temporary database and
// checks that the HTTP layer responds. Requires local Postgres (infra/).
medusaIntegrationTestRunner({
  env: {},
  testSuite: ({ api }) => {
    describe("GET /health", () => {
      it("responds with 200", async () => {
        const response = await api.get("/health")
        expect(response.status).toEqual(200)
      })
    })
  },
})
