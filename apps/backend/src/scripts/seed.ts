import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
  deleteShippingOptionsWorkflow,
  deleteShippingProfileWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductCategoriesWorkflow,
  updateProductVariantsWorkflow,
  updateProductsWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
  updateTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

// ── Shipping & inventory settings (ADR 033, 043) ─────────────────────────────
// PROVISIONAL values: to be confirmed with the client. Amounts are EUR, IVA included (ADR 027).
const STANDARD_SHIPPING_EUR = 9.9
const FREE_SHIPPING_FROM_EUR = 90 // also FREE_SHIPPING_THRESHOLD_EUR in apps/storefront/lib/data/cart.ts (ADR 036)
const FULFILLMENT_PROVIDER_ID = "manual_manual"
const SHIPPING_FULFILLMENT_SET_NAME = "Spedizioni Italia"
const PICKUP_FULFILLMENT_SET_NAME = "Ritiro in cantina"
const SHIPPING_OPTION_STANDARD = "Spedizione standard"
const SHIPPING_OPTION_PICKUP = "Ritiro in cantina"

// ── Wine-only catalog (ADR 043) ──────────────────────────────────────────────
// The 4 wines created by this seed, each in exactly one category.
const SEED_PRODUCT_HANDLES = ["chiai-rosso", "rosso-vecchio", "chiai-bianco", "bianco-dolce"]
const WINE_CATEGORIES = [
  { name: "Vini Rossi", handle: "vini-rossi" },
  { name: "Vini Bianchi", handle: "vini-bianchi" },
  { name: "Vini Dolci", handle: "vini-dolci" },
]
const WINE_CATEGORY_BY_PRODUCT: Record<string, string> = {
  "chiai-rosso": "vini-rossi",
  "rosso-vecchio": "vini-rossi",
  "chiai-bianco": "vini-bianchi",
  "bianco-dolce": "vini-dolci",
}
// Initial stock per wine (PROVISIONAL), set ONLY when a variant has no stock level yet:
// re-running the seed never overwrites quantities managed from the admin.
const INITIAL_STOCK_PER_WINE = 60

// Leftovers of the old mixed catalog (wine + cured meats + fresh meat + oil), removed by this
// seed from databases created before ADR 043.
const REMOVED_NON_WINE_HANDLES = [
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
]
const OBSOLETE_CATEGORY_HANDLES = ["vini", "riserve", "insaccati", "carne-fresca", "olio-evo"]
const LEGACY_MEAT_PROFILE_NAME = "Carne fresca (solo ritiro)"
const LEGACY_MEAT_PICKUP_OPTION = "Ritiro in cantina (carne fresca)"

// Shapes of the query.graph results used below (no generated Medusa types in this project).
type SeedProductRow = {
  id: string
  variants?: { id: string; manage_inventory: boolean }[] | null
}
type StockedVariantRow = {
  id: string
  inventory_items?: { inventory_item_id: string }[] | null
}
type WineRow = {
  id: string
  handle: string
  categories?: { id: string }[] | null
}
type NonWineProductRow = {
  id: string
  handle: string
  status: string
  variants?:
    | { inventory_items?: { inventory?: { reserved_quantity?: number } | null }[] | null }[]
    | null
}
type ObsoleteCategoryRow = {
  id: string
  handle: string
  products?: { id: string }[] | null
}
type LocationLinksRow = {
  id: string
  fulfillment_providers?: { id: string }[] | null
  fulfillment_sets?: { id: string }[] | null
}

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const inventoryModuleService = container.resolve(Modules.INVENTORY)
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

  // ── 6. Wine categories (ADR 043) ─────────────────────────────────────────
  // Idempotent: matched by handle, so the existing "Vini Rossi" / "Vini Bianchi" are reused.
  const existingWineCategories = await productModuleService.listProductCategories({
    handle: WINE_CATEGORIES.map((c) => c.handle),
  })
  const existingWineHandles = new Set(existingWineCategories.map((c) => c.handle))
  const wineCategoriesToCreate = WINE_CATEGORIES.filter((c) => !existingWineHandles.has(c.handle))
  let wineCategories = existingWineCategories
  if (wineCategoriesToCreate.length > 0) {
    logger.info(`Creating wine categories: ${wineCategoriesToCreate.map((c) => c.name).join(", ")}...`)
    const { result: catResult } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: wineCategoriesToCreate.map((c) => ({ ...c, is_active: true })),
      },
    })
    wineCategories = [...wineCategories, ...catResult]
  }
  // Older databases have them inactive or internal (not listed by the Store API).
  const hiddenWineCategories = wineCategories.filter((c) => !c.is_active || c.is_internal)
  if (hiddenWineCategories.length > 0) {
    logger.info(`Activating wine categories: ${hiddenWineCategories.map((c) => c.name).join(", ")}...`)
    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { id: hiddenWineCategories.map((c) => c.id) },
        update: { is_active: true, is_internal: false },
      },
    })
  }
  const categoryIdByHandle = new Map(wineCategories.map((c) => [c.handle, c.id]))

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

  // ── 7b. Wine only: remove cured meats, fresh meat and olive oil (ADR 043) ──
  // The shop sells only wine. Orders keep their own copy of titles and prices, so past
  // orders stay readable. Medusa refuses to delete inventory that is reserved by an open
  // order: those products are hidden (draft) instead, and the next run deletes them once
  // the orders are canceled or fulfilled.
  const { data: nonWineRows } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status", "variants.inventory_items.inventory.reserved_quantity"],
    filters: { handle: REMOVED_NON_WINE_HANDLES },
  })
  const nonWineProducts = nonWineRows as NonWineProductRow[]
  const isReserved = (p: NonWineProductRow) =>
    (p.variants ?? []).some((v) =>
      (v.inventory_items ?? []).some((i) => (i.inventory?.reserved_quantity ?? 0) > 0)
    )
  const deletable = nonWineProducts.filter((p) => !isReserved(p))
  const blocked = nonWineProducts.filter(isReserved)
  if (deletable.length > 0) {
    logger.info(`Deleting ${deletable.length} non-wine products: ${deletable.map((p) => p.handle).join(", ")}...`)
    await deleteProductsWorkflow(container).run({ input: { ids: deletable.map((p) => p.id) } })
  }
  const blockedToHide = blocked.filter((p) => p.status !== "draft")
  if (blockedToHide.length > 0) {
    await updateProductsWorkflow(container).run({
      input: { selector: { id: blockedToHide.map((p) => p.id) }, update: { status: "draft" } },
    })
  }
  if (blocked.length > 0) {
    logger.warn(
      `Hidden (draft), not deleted, because open orders reserve their stock: ` +
        `${blocked.map((p) => p.handle).join(", ")}. Cancel or fulfill those orders, then re-run the seed.`
    )
  }

  // Categories of the old catalog: deleted only when no product is left in them.
  const { data: obsoleteCategoryRows } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "products.id"],
    filters: { handle: OBSOLETE_CATEGORY_HANDLES },
  })
  const obsoleteCategories = obsoleteCategoryRows as ObsoleteCategoryRow[]
  const emptyObsolete = obsoleteCategories.filter((c) => (c.products ?? []).length === 0)
  if (emptyObsolete.length > 0) {
    logger.info(`Deleting obsolete categories: ${emptyObsolete.map((c) => c.handle).join(", ")}...`)
    await deleteProductCategoriesWorkflow(container).run({ input: emptyObsolete.map((c) => c.id) })
  }
  // Still holding hidden products: deactivated, so the Store API no longer lists them.
  const stillUsedObsolete = obsoleteCategories.filter((c) => (c.products ?? []).length > 0)
  if (stillUsedObsolete.length > 0) {
    await updateProductCategoriesWorkflow(container).run({
      input: { selector: { id: stillUsedObsolete.map((c) => c.id) }, update: { is_active: false } },
    })
  }

  // The fresh-meat pickup option and its shipping profile (ADR 033, superseded by ADR 043).
  const legacyMeatOptions = await fulfillmentModuleService.listShippingOptions({
    name: LEGACY_MEAT_PICKUP_OPTION,
  })
  if (legacyMeatOptions.length > 0) {
    logger.info(`Deleting shipping option '${LEGACY_MEAT_PICKUP_OPTION}'...`)
    await deleteShippingOptionsWorkflow(container).run({
      input: { ids: legacyMeatOptions.map((o) => o.id) },
    })
  }
  const [legacyMeatProfile] = await fulfillmentModuleService.listShippingProfiles({
    name: LEGACY_MEAT_PROFILE_NAME,
  })
  if (legacyMeatProfile && blocked.length === 0) {
    logger.info(`Deleting shipping profile '${LEGACY_MEAT_PROFILE_NAME}'...`)
    await deleteShippingProfileWorkflow(container).run({ input: { ids: [legacyMeatProfile.id] } })
  }

  // ── 8. Seed the 4 wines ───────────────────────────────────────────────────
  const existingProducts = await productModuleService.listProducts({
    handle: SEED_PRODUCT_HANDLES,
  })

  if (existingProducts.length === 0) {
    logger.info("Creating the 4 estate wines...")
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Chiai Rosso",
            handle: "chiai-rosso",
            description: "Il nostro rosso di famiglia, sincero e quotidiano. Vinificato artigianalmente da uve Aglianico coltivate sulle colline di Abatemarco.",
            category_ids: [categoryIdByHandle.get("vini-rossi")!],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "CHIAI-ROSSO-750",
              manage_inventory: true,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 9.0 }],
            }],
          },
          {
            title: "Rosso Vecchio",
            handle: "rosso-vecchio",
            description: "Il rosso importante della cantina. È rimasto a lungo in botte: austero, profondo e avvolgente con note di marasca matura e carruba.",
            category_ids: [categoryIdByHandle.get("vini-rossi")!],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "ROSSO-VECCHIO-750",
              manage_inventory: true,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 15.0 }],
            }],
          },
          {
            title: "Chiai Bianco",
            handle: "chiai-bianco",
            description: "Vino bianco fresco, sapido e minerale. Profumi di ginestra e agrumi cilentani, perfetta espressione del flysch e delle brezze marine.",
            category_ids: [categoryIdByHandle.get("vini-bianchi")!],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "CHIAI-BIANCO-750",
              manage_inventory: true,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 8.0 }],
            }],
          },
          {
            title: "Bianco Dolce",
            handle: "bianco-dolce",
            description: "Vino da fine pasto dolce e aromatico, con sentori di fico bianco del Cilento, miele millefiori e mandorla tostata.",
            category_ids: [categoryIdByHandle.get("vini-dolci")!],
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            status: "published",
            options: [{ title: "Formato", values: ["Bottiglia 0,75 l"] }],
            variants: [{
              title: "Bottiglia 0,75 l",
              sku: "BIANCO-DOLCE-750",
              manage_inventory: true,
              options: { Formato: "Bottiglia 0,75 l" },
              prices: [{ currency_code: "eur", amount: 10.0 }],
            }],
          },
        ],
      },
    })
  }

  // Idempotent: puts every existing wine in its own category (fixes the legacy "Vini Rossi" for all).
  const { data: wineRows } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "categories.id"],
    filters: { handle: SEED_PRODUCT_HANDLES },
  })
  for (const wine of wineRows as WineRow[]) {
    const target = categoryIdByHandle.get(WINE_CATEGORY_BY_PRODUCT[wine.handle])
    const current = (wine.categories ?? []).map((c) => c.id)
    if (target && (current.length !== 1 || current[0] !== target)) {
      logger.info(`Moving '${wine.handle}' to category '${WINE_CATEGORY_BY_PRODUCT[wine.handle]}'...`)
      await updateProductsWorkflow(container).run({
        input: { selector: { id: wine.id }, update: { category_ids: [target] } },
      })
    }
  }

  
  // ── 9. Inventory (ADR 034) ───────────────────────────────────────────────
  // Real stock in Medusa: every seed variant is inventory-managed and stocked at the cellar.
  // Idempotent: also converts databases seeded with manage_inventory: false.
  const { data: seedProductRows } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id", "variants.manage_inventory"],
    filters: { handle: SEED_PRODUCT_HANDLES },
  })
  const seedProducts = seedProductRows as SeedProductRow[]

  const unmanagedVariantIds = seedProducts.flatMap((p) =>
    (p.variants ?? []).filter((v) => !v.manage_inventory).map((v) => v.id)
  )
  if (unmanagedVariantIds.length > 0) {
    logger.info(`Enabling inventory management on ${unmanagedVariantIds.length} variants...`)
    // Medusa creates the default inventory item for each variant switched to managed.
    await updateProductVariantsWorkflow(container).run({
      input: {
        selector: { id: unmanagedVariantIds },
        update: { manage_inventory: true },
      },
    })
  }

  const { data: stockedVariantRows } = await query.graph({
    entity: "product_variant",
    fields: ["id", "inventory_items.inventory_item_id"],
    filters: { product_id: seedProducts.map((p) => p.id) },
  })
  const stockedVariants = stockedVariantRows as StockedVariantRow[]
  const inventoryItemQty = new Map<string, number>()
  for (const variant of stockedVariants) {
    for (const item of variant.inventory_items ?? []) {
      if (item.inventory_item_id) {
        inventoryItemQty.set(item.inventory_item_id, INITIAL_STOCK_PER_WINE)
      }
    }
  }
  const existingLevels = await inventoryModuleService.listInventoryLevels({
    inventory_item_id: [...inventoryItemQty.keys()],
    location_id: stockLocation.id,
  })
  const itemsWithLevel = new Set(existingLevels.map((l) => l.inventory_item_id))
  const levelsToCreate = [...inventoryItemQty.entries()]
    .filter(([itemId]) => !itemsWithLevel.has(itemId))
    .map(([itemId, qty]) => ({
      inventory_item_id: itemId,
      location_id: stockLocation.id,
      stocked_quantity: qty,
    }))
  if (levelsToCreate.length > 0) {
    logger.info(`Creating initial stock levels for ${levelsToCreate.length} inventory items...`)
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: levelsToCreate },
    })
  }

  // ── 10. Fulfillment: home delivery in Italy + pickup at the cellar (ADR 033) ─
  const { data: locationLinkRows } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_providers.id", "fulfillment_sets.id"],
    filters: { id: stockLocation.id },
  })
  const locationLinks = (locationLinkRows as LocationLinksRow[])[0]
  const linkedProviderIds = new Set((locationLinks?.fulfillment_providers ?? []).map((fp) => fp.id))
  const linkedSetIds = new Set((locationLinks?.fulfillment_sets ?? []).map((fs) => fs.id))

  if (!linkedProviderIds.has(FULFILLMENT_PROVIDER_ID)) {
    logger.info(`Linking fulfillment provider '${FULFILLMENT_PROVIDER_ID}' to the cellar...`)
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: FULFILLMENT_PROVIDER_ID },
    })
  }

  const ensureFulfillmentSet = async (
    name: string,
    type: "shipping" | "pickup",
    zoneName: string
  ) => {
    let [set] = await fulfillmentModuleService.listFulfillmentSets(
      { name },
      { relations: ["service_zones"] }
    )
    if (!set) {
      logger.info(`Creating fulfillment set '${name}' (${type})...`)
      set = await fulfillmentModuleService.createFulfillmentSets({
        name,
        type,
        service_zones: [{ name: zoneName, geo_zones: [{ type: "country", country_code: "it" }] }],
      })
      set = (
        await fulfillmentModuleService.listFulfillmentSets(
          { id: set.id },
          { relations: ["service_zones"] }
        )
      )[0]
    }
    if (!linkedSetIds.has(set.id)) {
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
        [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
      })
    }
    const zone = set.service_zones?.[0]
    if (!zone) {
      throw new Error(`Fulfillment set '${name}' has no service zone.`)
    }
    return zone
  }

  const deliveryZone = await ensureFulfillmentSet(SHIPPING_FULFILLMENT_SET_NAME, "shipping", "Italia")
  const pickupZone = await ensureFulfillmentSet(
    PICKUP_FULFILLMENT_SET_NAME,
    "pickup",
    "Cantina di Abatemarco"
  )

  const storeRules = [
    { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
    { attribute: "is_return", value: "false", operator: "eq" as const },
  ]
  const shippingOptions = [
    {
      name: SHIPPING_OPTION_STANDARD,
      price_type: "flat" as const,
      provider_id: FULFILLMENT_PROVIDER_ID,
      service_zone_id: deliveryZone.id,
      shipping_profile_id: defaultShippingProfile.id,
      type: {
        label: "Standard",
        description: `Corriere espresso in Italia, gratuita da ${FREE_SHIPPING_FROM_EUR} €.`,
        code: "standard",
      },
      prices: [
        { currency_code: "eur", amount: STANDARD_SHIPPING_EUR },
        {
          currency_code: "eur",
          amount: 0,
          rules: [{ attribute: "item_total", operator: "gte" as const, value: FREE_SHIPPING_FROM_EUR }],
        },
      ],
      rules: storeRules,
    },
    {
      name: SHIPPING_OPTION_PICKUP,
      price_type: "flat" as const,
      provider_id: FULFILLMENT_PROVIDER_ID,
      service_zone_id: pickupZone.id,
      shipping_profile_id: defaultShippingProfile.id,
      type: {
        label: "Ritiro",
        description: "Ritiro gratuito in cantina ad Abatemarco (lun-ven 11-13, 15-18).",
        code: "pickup",
      },
      prices: [{ currency_code: "eur", amount: 0 }],
      rules: storeRules,
    },
  ]
  const existingOptions = await fulfillmentModuleService.listShippingOptions({
    name: shippingOptions.map((o) => o.name),
  })
  const existingOptionNames = new Set(existingOptions.map((o) => o.name))
  const optionsToCreate = shippingOptions.filter((o) => !existingOptionNames.has(o.name))
  if (optionsToCreate.length > 0) {
    logger.info(`Creating shipping options: ${optionsToCreate.map((o) => o.name).join(", ")}...`)
    await createShippingOptionsWorkflow(container).run({ input: optionsToCreate })
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
