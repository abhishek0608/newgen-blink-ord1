import { sfQuery, sendJson } from '../_lib/salesforce.js'

// POST /api/salesforce/query  { "soql": "SELECT Id, Name FROM Account LIMIT 10" }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed — use POST with { soql }' })
  }
  try {
    const { soql } = await readJsonBody(req)
    if (!soql || typeof soql !== 'string') {
      return sendJson(res, 400, { error: 'Missing "soql" string in request body' })
    }
    const result = await sfQuery(soql)
    sendJson(res, 200, result)
  } catch (err) {
    sendJson(res, 502, { error: err.message })
  }
}

async function readJsonBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}
