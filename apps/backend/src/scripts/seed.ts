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
  updateRegionsWorkflow,
  updateStoresWorkflow,
  updateTaxRegionsWorkflow,
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
  if (store) {
    // Idempotent. EUR prices are consumer prices, IVA included (ADR 027). Seed prices are
    // currency prices (no region rule), so Medusa applies the EUR currency preference.
    logger.info(`Setting store name and EUR (IVA included) as the only currency...`)
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          name: "Cantina de Li Chiai",
          supported_currencies: [
            { currency_code: "eur", is_default: true, is_tax_inclusive: true },
          ],
        },
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
  // Prices are entered IVA included (consumer prices), so the region is tax-inclusive (ADR 027).
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
            is_tax_inclusive: true,
          },
        ],
      },
    })
    region = regionResult[0]
  } else {
    // Idempotent: also fixes databases seeded before ADR 027.
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { is_tax_inclusive: true },
      },
    })
  }

  // ── 4. Tax Region (Italy 22% IVA) ─────────────────────────────────────────
  // A tax region needs a tax provider, otherwise Medusa cannot compute taxes and every
  // price/cart request with a country fails ("tax provider with id: null"). ADR 027.
  const TAX_PROVIDER_ID = "tp_system"
  const existingTaxRegions = await taxModuleService.listTaxRegions({ country_code: "it" })
  if (existingTaxRegions.length === 0) {
    logger.info("Creating Tax Region for Italy with default 22% IVA...")
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "it",
          provider_id: TAX_PROVIDER_ID,
          default_tax_rate: {
            rate: 22,
            name: "IVA 22%",
            code: "IVA22",
          },
        },
      ],
    })
  } else {
    const missingProvider = existingTaxRegions.filter((tr) => tr.provider_id !== TAX_PROVIDER_ID)
    if (missingProvider.length > 0) {
      logger.info(`Setting tax provider '${TAX_PROVIDER_ID}' on the Italy tax region...`)
      await updateTaxRegionsWorkflow(container).run({
        input: missingProvider.map((tr) => ({ id: tr.id, provider_id: TAX_PROVIDER_ID })),
      })
    }
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
              city: "Parco Nazionale del Cilento",
              country_code: "it",
              postal_code: "84078",
              province: "SA",
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
  const existingCatNames = new Set(categories.map((c) => c.name))

  const categoriesToCreate = [
    { name: "Vini" },
    { name: "Insaccati" },
    { name: "Carne fresca" },
    { name: "Olio EVO" },
  ].filter((c) => !existingCatNames.has(c.name))

  if (categoriesToCreate.length > 0) {
    logger.info("Creating authentic estate categories (Vini, Insaccati, Carne fresca, Olio EVO)...")
    const { result: catResult } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: categoriesToCreate,
      },
    })
    categories = [...categories, ...catResult]
  }

  const viniCat = categories.find((c) => c.name === "Vini" || c.name === "Vini Rossi")
  const insaccatiCat = categories.find((c) => c.name === "Insaccati")
  const carneCat = categories.find((c) => c.name === "Carne fresca")
  const olioCat = categories.find((c) => c.name === "Olio EVO")

  // ── 7. Clean Obsolete Legacy Wines ─────────────────────────────────────────
  const oldLegacyWines = await productModuleService.listProducts({
    handle: [
      "vermentino-di-gallura-docg-superiore",
      "cannonau-di-sardegna-doc-riserva",
      "cagnulari-isola-dei-nuraghi-igt",
      "fiano-del-cilento-doc",
      "aglianico-del-cilento-doc-riserva",
      "cilento-doc-rosso-paestum-igt",
    ],
  })

  if (oldLegacyWines.length > 0) {
    logger.info("Removing obsolete products from Medusa database...")
    await productModuleService.deleteProducts(oldLegacyWines.map((p) => p.id))
  }

  // ── 8. Seed 14 Authentic Products (DeLalla Archive) ───────────────────────
  const existingProducts = await productModuleService.listProducts({
    handle: [
      "chiai-rosso",
      "rosso-vecchio",
      "chiai-bianco",
      "bianco-dolce",
      "salsiccia-dolce-stagionata",
      "salsiccia-piccante-stagionata",
      "salsiccia-di-cinghiale-stagionata",
      "soppressata-dolce-cilentana",
      "soppressata-di-cinghiale",
      "misto-cinghiale",
      "salsicce-fresche-di-cinghiale",
      "bistecche-di-cinghiale",
      "olio-extravergine-oliva-cilento-075",
      "olio-extravergine-oliva-cilento-latta-3l",
    ],
  })

  if (existingProducts.length === 0) {
    logger.info("Creating authentic 14 estate products across 4 categories...")
    await createProductsWorkflow(container).run({
      input: {
        products: [
          // Vini
          {
            title: "Chiai Rosso",
            handle: "chiai-rosso",
            description: "Il nostro rosso di famiglia, sincero e quotidiano. Vinificato artigianalmente da uve Aglianico coltivate sulle colline di Abatemarco.",
            category_ids: viniCat ? [viniCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "CHIAI-ROSSO-750",
              manage_inventory: false,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 9.0 }],
            }],
          },
          {
            title: "Rosso Vecchio",
            handle: "rosso-vecchio",
            description: "Il rosso importante della cantina. È rimasto a lungo in botte: austero, profondo e avvolgente con note di marasca matura e carruba.",
            category_ids: viniCat ? [viniCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "ROSSO-VECCHIO-750",
              manage_inventory: false,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 15.0 }],
            }],
          },
          {
            title: "Chiai Bianco",
            handle: "chiai-bianco",
            description: "Vino bianco fresco, sapido e minerale. Profumi di ginestra e agrumi cilentani, perfetta espressione del flysch e delle brezze marine.",
            category_ids: viniCat ? [viniCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "CHIAI-BIANCO-750",
              manage_inventory: false,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 8.0 }],
            }],
          },
          {
            title: "Bianco Dolce",
            handle: "bianco-dolce",
            description: "Vino da fine pasto dolce e aromatico, con sentori di fico bianco del Cilento, miele millefiori e mandorla tostata.",
            category_ids: viniCat ? [viniCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "BIANCO-DOLCE-750",
              manage_inventory: false,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 10.0 }],
            }],
          },

          // Insaccati
          {
            title: "Salsiccia Dolce Stagionata",
            handle: "salsiccia-dolce-stagionata",
            description: "Salsiccia artigianale cilentana dolce stagionata naturalmente all'aria di collina. Taglio a punta di coltello e finocchietto selvatico.",
            category_ids: insaccatiCat ? [insaccatiCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Pezzatura", values: ["Trancio ~400g"] }],
            variants: [{
              title: "Trancio ~400g",
              sku: "SALS-DOLCE-400",
              manage_inventory: false,
              options: { Pezzatura: "Trancio ~400g" },
              prices: [{ currency_code: "eur", amount: 7.0 }],
            }],
          },
          {
            title: "Salsiccia Piccante Stagionata",
            handle: "salsiccia-piccante-stagionata",
            description: "Salsiccia tradizionale preparata con peperoncino rosso campano macinato ed essiccato. Gusto deciso e affumicatura naturale.",
            category_ids: insaccatiCat ? [insaccatiCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Pezzatura", values: ["Trancio ~400g"] }],
            variants: [{
              title: "Trancio ~400g",
              sku: "SALS-PICC-400",
              manage_inventory: false,
              options: { Pezzatura: "Trancio ~400g" },
              prices: [{ currency_code: "eur", amount: 7.0 }],
            }],
          },
          {
            title: "Salsiccia di Cinghiale Stagionata",
            handle: "salsiccia-di-cinghiale-stagionata",
            description: "Pregiata salsiccia con carne scelta di cinghiale cilentano dei boschi di Abatemarco. Gusto nobile, selvatico e speziato.",
            category_ids: insaccatiCat ? [insaccatiCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Pezzatura", values: ["Trancio ~400g"] }],
            variants: [{
              title: "Trancio ~400g",
              sku: "SALS-CINGH-400",
              manage_inventory: false,
              options: { Pezzatura: "Trancio ~400g" },
              prices: [{ currency_code: "eur", amount: 10.0 }],
            }],
          },
          {
            title: "Soppressata Dolce Cilentana",
            handle: "soppressata-dolce-cilentana",
            description: "Il salume principe del Cilento: solo le parti nobili del prosciutto e filetto con lardello centrale aromatizzato e pressato a mano.",
            category_ids: insaccatiCat ? [insaccatiCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Pezzatura", values: ["Pezzo intero ~500g"] }],
            variants: [{
              title: "Pezzo intero ~500g",
              sku: "SOPP-DOLCE-500",
              manage_inventory: false,
              options: { Pezzatura: "Pezzo intero ~500g" },
              prices: [{ currency_code: "eur", amount: 11.0 }],
            }],
          },
          {
            title: "Soppressata di Cinghiale",
            handle: "soppressata-di-cinghiale",
            description: "Rarità gastronomica della nostra salumeria: soppressata di cinghiale stagionata lentamente in cantina di pietra naturale.",
            category_ids: insaccatiCat ? [insaccatiCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Pezzatura", values: ["Pezzo intero ~500g"] }],
            variants: [{
              title: "Pezzo intero ~500g",
              sku: "SOPP-CINGH-500",
              manage_inventory: false,
              options: { Pezzatura: "Pezzo intero ~500g" },
              prices: [{ currency_code: "eur", amount: 13.0 }],
            }],
          },

          // Carne fresca
          {
            title: "Misto Cinghiale per Ragù e Spezzatino",
            handle: "misto-cinghiale",
            description: "Tagli selezionati di polpa di cinghiale ideali per spezzatini saporiti e per il tradizionale ragù cilentano a cottura lenta.",
            category_ids: carneCat ? [carneCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Confezione", values: ["Confezione sottovuoto ~1 kg"] }],
            variants: [{
              title: "Confezione sottovuoto ~1 kg",
              sku: "CARN-MIST-1KG",
              manage_inventory: false,
              options: { Confezione: "Confezione sottovuoto ~1 kg" },
              prices: [{ currency_code: "eur", amount: 18.0 }],
            }],
          },
          {
            title: "Salsicce Fresche di Cinghiale",
            handle: "salsicce-fresche-di-cinghiale",
            description: "Salsicce fresche da cuocere alla brace o in padella con vino rosso Chiai. Gusto succoso e autentico.",
            category_ids: carneCat ? [carneCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Confezione", values: ["Confezione sottovuoto ~500g"] }],
            variants: [{
              title: "Confezione sottovuoto ~500g",
              sku: "CARN-SALS-500",
              manage_inventory: false,
              options: { Confezione: "Confezione sottovuoto ~500g" },
              prices: [{ currency_code: "eur", amount: 8.0 }],
            }],
          },
          {
            title: "Bistecche di Cinghiale",
            handle: "bistecche-di-cinghiale",
            description: "Bistecche fresche di cinghiale tagliate spesse, ideali per grigliate all'aperto sui carboni di legna d'ulivo.",
            category_ids: carneCat ? [carneCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Confezione", values: ["Confezione sottovuoto ~600g"] }],
            variants: [{
              title: "Confezione sottovuoto ~600g",
              sku: "CARN-BIST-600",
              manage_inventory: false,
              options: { Confezione: "Confezione sottovuoto ~600g" },
              prices: [{ currency_code: "eur", amount: 15.0 }],
            }],
          },

          // Olio EVO
          {
            title: "Olio Extra Vergine di Oliva - Bottiglia",
            handle: "olio-extravergine-oliva-cilento-075",
            description: "Olio EVO biologico di categoria superiore estratto a freddo da olive Rotondella e Pisciottana di Abatemarco.",
            category_ids: olioCat ? [olioCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia in vetro scuro 0,75 l"] }],
            variants: [{
              title: "Bottiglia in vetro scuro 0,75 l",
              sku: "OLIO-EVO-750",
              manage_inventory: false,
              options: { Formato: "Bottiglia in vetro scuro 0,75 l" },
              prices: [{ currency_code: "eur", amount: 12.0 }],
            }],
          },
          {
            title: "Olio Extra Vergine di Oliva - Latta 3L",
            handle: "olio-extravergine-oliva-cilento-latta-3l",
            description: "La tradizionale latta salva-freschezza da 3 litri, ideale per la scorta familiare di olio extra vergine artigianale del Cilento.",
            category_ids: olioCat ? [olioCat.id] : [],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Latta serigrafata 3 Litri"] }],
            variants: [{
              title: "Latta serigrafata 3 Litri",
              sku: "OLIO-EVO-3L",
              manage_inventory: false,
              options: { Formato: "Latta serigrafata 3 Litri" },
              prices: [{ currency_code: "eur", amount: 34.0 }],
            }],
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
