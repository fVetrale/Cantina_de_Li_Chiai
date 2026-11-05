import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import {
  AGE_VERIFICATION_REQUIRED_MESSAGE,
  validateAgeDeclaration,
} from "../../modules/age-verification"

/**
 * Refuses to turn a cart into an order without a valid age declaration (ADR 038).
 * Runs inside Medusa's completeCartWorkflow, so it also applies to direct Store API calls
 * that bypass the storefront. Nothing personal is logged.
 */
completeCartWorkflow.hooks.validate(async ({ cart }) => {
  const result = validateAgeDeclaration(cart.metadata, new Date())
  if (!result.ok) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, AGE_VERIFICATION_REQUIRED_MESSAGE)
  }
})
