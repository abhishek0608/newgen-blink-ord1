import { getSalesforceAuth, sendJson } from '../_lib/salesforce.js'

// GET /api/salesforce/token — vends the Connected App's access token so
// trusted consumers can call the Salesforce REST API directly:
//   { accessToken, baseUrl, expiresAt }
//
// The token carries the full permissions of the Connected App's Run As user.
// Browser consumers additionally need their origin in the org's CORS
// allowlist (Setup → CORS). Gate this route before exposing it beyond a
// dev org.
export default async function handler(req, res) {
  try {
    const { accessToken, instanceUrl, expiresAt } = await getSalesforceAuth()
    sendJson(res, 200, { accessToken, baseUrl: instanceUrl, expiresAt })
  } catch (err) {
    sendJson(res, 502, { error: err.message })
  }
}
