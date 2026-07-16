import { createSalesforceCatalogHandler } from '../vendor/next-gen-composable/dist/salesforce.js'
import { getSalesforceAuth } from './_lib/salesforce.js'

// POST /api/catalog — the composable package's server-side catalog handler.
// All SOQL, schema mapping, and the wire protocol live in the package; this
// file only supplies the Connected App credentials (server-side, from env).
export default createSalesforceCatalogHandler({
  baseUrl: async () => (await getSalesforceAuth()).instanceUrl,
  tokenProvider: async () => (await getSalesforceAuth()).accessToken,
})
