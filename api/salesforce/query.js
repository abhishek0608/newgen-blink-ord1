import { sfQuery, sfQueryAll, sendJson, readJsonBody } from '../_lib/salesforce.js'

// POST /api/salesforce/query  { "soql": "SELECT Id, Name FROM Account LIMIT 10", "all": false }
// Set "all": true to auto-paginate past the ~2000-record page limit.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed — use POST with { soql }' })
  }
  try {
    const { soql, all } = await readJsonBody(req)
    if (!soql || typeof soql !== 'string') {
      return sendJson(res, 400, { error: 'Missing "soql" string in request body' })
    }
    const result = all ? await sfQueryAll(soql) : await sfQuery(soql)
    sendJson(res, 200, result)
  } catch (err) {
    sendJson(res, 502, { error: err.message })
  }
}
