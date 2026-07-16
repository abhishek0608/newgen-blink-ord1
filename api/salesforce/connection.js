import { getSalesforceAuth, sfQuery, sendJson } from '../_lib/salesforce.js'

// GET /api/salesforce/connection — authenticates with Salesforce and returns org info
export default async function handler(req, res) {
  try {
    const { instanceUrl } = await getSalesforceAuth()
    const result = await sfQuery('SELECT Id, Name, OrganizationType, IsSandbox FROM Organization')
    const org = result.records[0]
    sendJson(res, 200, {
      connected: true,
      instanceUrl,
      orgId: org.Id,
      orgName: org.Name,
      orgType: org.OrganizationType,
      isSandbox: org.IsSandbox,
    })
  } catch (err) {
    sendJson(res, 502, { connected: false, error: err.message })
  }
}
