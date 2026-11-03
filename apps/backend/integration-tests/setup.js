// Clears MikroORM metadata between test files (from the official Medusa v2 starter).
const { MetadataStorage } = require("@mikro-orm/core")

MetadataStorage.clear()
