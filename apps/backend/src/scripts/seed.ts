import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModuleService = container.resolve(Modules.STORE)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const regionModuleService = container.resolve(Modules.REGION)
  const taxModuleService = container.resolve(Modules.TAX)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const apiKeyModuleService = container.resolve(Modules.API_KEY)
  const userModuleService = container.resolve(Modules.USER)

  logger.info("🌱 Starting database seeding for Cantina de Li Chiai...")

  // ── 1. Store Identity ─────────────────────────────────────────────────────
  const [store] = await storeModuleService.listStores()
  if (store && store.name !== "Cantina de Li Chiai") {
    logger.info(`Updating store name to 'Cantina de Li Chiai'...`)
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { name: "Cantina de Li Chiai" },
      },
    })
  }

  // ── 2. Sales Channel & Shipping Profile ───────────────────────────────────
  const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })

  if (!defaultSalesChannel) {
    throw new Error("Default Sales Channel not found. Ensure migrations have completed.")
  }

  const [defaultShippingProfile] = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })

  if (!defaultShippingProfile) {
    throw new Error("Default Shipping Profile not found. Ensure migrations have completed.")
  }

  // ── 3. Region (Italy / EUR) ───────────────────────────────────────────────
  const existingRegions = await regionModuleService.listRegions({ name: "Italy" })
  let region = existingRegions[0]

  if (!region) {
    logger.info("Creating Region 'Italy' (EUR)...")
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Italy",
            currency_code: "eur",
            countries: ["it"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = regionResult[0]
  }

  // ── 4. Tax Region (Italy 22% IVA) ─────────────────────────────────────────
  const existingTaxRegions = await taxModuleService.listTaxRegions({ country_code: "it" })
  if (existingTaxRegions.length === 0) {
    logger.info("Creating Tax Region for Italy with default 22% IVA...")
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "it",
          default_tax_rate: {
            rate: 22,
            name: "IVA 22%",
            code: "IVA22",
          },
        },
      ],
    })
  }

  // ── 5. Stock Location ─────────────────────────────────────────────────────
  const existingLocations = await stockLocationModuleService.listStockLocations({
    name: "Magazzino Cantina de Li Chiai",
  })
  let stockLocation = existingLocations[0]

  if (!stockLocation) {
    logger.info("Creating Stock Location 'Magazzino Cantina de Li Chiai'...")
    const { result: locationResult } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Magazzino Cantina de Li Chiai",
            address: {
              address_1: "Località Li Chiai",
              city: "Tempio Pausania",
              country_code: "it",
              postal_code: "07029",
              province: "SS",
            },
          },
        ],
      },
    })
    stockLocation = locationResult[0]

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel.id],
      },
    })
  }

  // ── 6. Categories ─────────────────────────────────────────────────────────
  let categories = await productModuleService.listProductCategories()
  if (categories.length === 0) {
    logger.info("Creating wine categories (Vini Bianchi, Vini Rossi, Riserve)...")
    const { result: catResult } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          { name: "Vini Bianchi" },
          { name: "Vini Rossi" },
          { name: "Riserve" },
        ],
      },
    })
    categories = catResult
  }

  const whiteCategory = categories.find((c) => c.name === "Vini Bianchi")
  const redCategory = categories.find((c) => c.name === "Vini Rossi")
  const riservaCategory = categories.find((c) => c.name === "Riserve")

  // ── 7. Wine Products ──────────────────────────────────────────────────────
  const existingWines = await productModuleService.listProducts({
    handle: [
      "vermentino-di-gallura-docg-superiore",
      "cannonau-di-sardegna-doc-riserva",
      "cagnulari-isola-dei-nuraghi-igt",
    ],
  })

  if (existingWines.length === 0) {
    logger.info("Creating wine products (Vermentino, Cannonau, Cagnulari)...")
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Vermentino di Gallura DOCG Superiore",
            handle: "vermentino-di-gallura-docg-superiore",
            description:
              "Vino bianco sardo di straordinaria eleganza, sapido, fresco e minerale, prodotto dai vigneti storici della Gallura. Gradazione alcolica 13.5% vol.",
            category_ids: whiteCategory ? [whiteCategory.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [
              {
                title: "Formato",
                values: ["Bottiglia 750ml"],
              },
            ],
            variants: [
              {
                title: "Bottiglia 750ml",
                sku: "VERM-DOCG-750",
                manage_inventory: false,
                options: {
                  Formato: "Bottiglia 750ml",
                },
                prices: [
                  {
                    currency_code: "eur",
                    amount: 18.5,
                  },
                ],
              },
            ],
          },
          {
            title: "Cannonau di Sardegna DOC Riserva",
            handle: "cannonau-di-sardegna-doc-riserva",
            description:
              "Vino rosso profondo, caldo e avvolgente. Note di frutti di bosco maturi, macchia mediterranea e spezie, affinato in botti di rovere. Gradazione alcolica 14.5% vol.",
            category_ids: [redCategory?.id, riservaCategory?.id].filter(Boolean) as string[],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [
              {
                title: "Formato",
                values: ["Bottiglia 750ml"],
              },
            ],
            variants: [
              {
                title: "Bottiglia 750ml",
                sku: "CANN-RIS-750",
                manage_inventory: false,
                options: {
                  Formato: "Bottiglia 750ml",
                },
                prices: [
                  {
                    currency_code: "eur",
                    amount: 24.0,
                  },
                ],
              },
            ],
          },
          {
            title: "Cagnulari Isola dei Nuraghi IGT",
            handle: "cagnulari-isola-dei-nuraghi-igt",
            description:
              "Autentico gioiello della viticoltura sarda. Vitigno autoctono dal profilo aromatico complesso, con note balsamiche e tannini setosi. Gradazione alcolica 14.0% vol.",
            category_ids: redCategory ? [redCategory.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [
              {
                title: "Formato",
                values: ["Bottiglia 750ml"],
              },
            ],
            variants: [
              {
                title: "Bottiglia 750ml",
                sku: "CAGN-IGT-750",
                manage_inventory: false,
                options: {
                  Formato: "Bottiglia 750ml",
                },
                prices: [
                  {
                    currency_code: "eur",
                    amount: 21.0,
                  },
                ],
              },
            ],
          },
        ],
      },
    })
  }

  // ── 8. Publishable API Key ────────────────────────────────────────────────
  const existingApiKeys = await apiKeyModuleService.listApiKeys({
    title: "Web Storefront Key",
  })

  let publishableKey = existingApiKeys[0]
  if (!publishableKey) {
    logger.info("Generating Publishable API Key for Web Storefront...")
    const users = await userModuleService.listUsers({}, { take: 1 })
    const createdBy = users[0]?.id || "system"

    const { result: apiKeysResult } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Web Storefront Key",
            type: "publishable",
            created_by: createdBy,
          },
        ],
      },
    })
    publishableKey = apiKeysResult[0]

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableKey.id,
        add: [defaultSalesChannel.id],
      },
    })
  }

  logger.info("════════════════════════════════════════════════════════════════")
  logger.info("✨ Database seeding completed successfully for Cantina de Li Chiai!")
  logger.info(`🔑 Publishable API Key (Storefront Token): ${publishableKey.token}`)
  logger.info("👉 Use this token in apps/storefront as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
  logger.info("════════════════════════════════════════════════════════════════")
}
