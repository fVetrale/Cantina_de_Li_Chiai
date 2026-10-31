import { defineConfig, loadEnv } from "@medusajs/framework/utils"

// Load environment variables from the root .env file (resolved relative to cwd)
loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    // ── Database ────────────────────────────────────────────────────────────
    databaseUrl: process.env.DATABASE_URL,

    // ── Cache / Queue ───────────────────────────────────────────────────────
    redisUrl: process.env.REDIS_URL,

    // ── HTTP ────────────────────────────────────────────────────────────────
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },

  // ── Admin panel ──────────────────────────────────────────────────────────
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },

  // ── Custom modules ───────────────────────────────────────────────────────
  // Add domain modules here (e.g. Stripe plugin, custom workflows).
  // Keep this list empty until a module is actually needed.
  modules: [],
})
