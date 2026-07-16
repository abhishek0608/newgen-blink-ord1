import { sfApex, sendJson, readJsonBody } from '../_lib/salesforce.js'

// Proxy to a custom Apex REST endpoint (@RestResource under /services/apexrest).
// The incoming HTTP method is forwarded as-is; "path" is what follows
// /services/apexrest and must start with "/".
//
//   GET    /api/salesforce/apex?path=/OrderService/001...
//   POST   /api/salesforce/apex?path=/OrderService/     body: { ... }
//   PATCH  /api/salesforce/apex?path=/OrderService/001  body: { ... }
//   DELETE /api/salesforce/apex?path=/OrderService/001...
export default async function handler(req, res) {
  const params = new URL(req.url, 'http://localhost').searchParams
  const path = params.get('path')

  if (!path || !path.startsWith('/')) {
    return sendJson(res, 400, { error: 'Missing "path" query param (must start with "/", e.g. /MyService/123)' })
  }

  const hasBody = req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT'

  try {
    const body = hasBody ? await readJsonBody(req) : undefined
    const result = await sfApex(req.method, path, body)
    sendJson(res, 200, result ?? { success: true })
  } catch (err) {
    sendJson(res, 502, { error: err.message })
  }
}
