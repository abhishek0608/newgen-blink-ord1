import {
  sfCreate,
  sfRetrieve,
  sfUpdate,
  sfDelete,
  sfDescribe,
  sendJson,
  readJsonBody,
} from '../_lib/salesforce.js'

// Generic sObject CRUD, keyed on HTTP method + query params:
//   GET    /api/salesforce/sobject?type=Account&id=001...&fields=Name,Industry
//   GET    /api/salesforce/sobject?type=Account&describe=1
//   POST   /api/salesforce/sobject?type=Account            body: { Name: "Acme" }
//   PATCH  /api/salesforce/sobject?type=Account&id=001...  body: { Name: "Acme 2" }
//   DELETE /api/salesforce/sobject?type=Account&id=001...
export default async function handler(req, res) {
  const params = new URL(req.url, 'http://localhost').searchParams
  const type = params.get('type')
  const id = params.get('id')

  if (!type || !/^[A-Za-z][A-Za-z0-9_]*$/.test(type)) {
    return sendJson(res, 400, { error: 'Missing or invalid "type" query param (sObject API name)' })
  }

  try {
    switch (req.method) {
      case 'GET': {
        if (params.has('describe')) return sendJson(res, 200, await sfDescribe(type))
        if (!id) return sendJson(res, 400, { error: 'Missing "id" query param' })
        const fields = params.get('fields')?.split(',').filter(Boolean)
        return sendJson(res, 200, await sfRetrieve(type, id, fields))
      }
      case 'POST':
        return sendJson(res, 201, await sfCreate(type, await readJsonBody(req)))
      case 'PATCH': {
        if (!id) return sendJson(res, 400, { error: 'Missing "id" query param' })
        await sfUpdate(type, id, await readJsonBody(req))
        return sendJson(res, 200, { id, success: true })
      }
      case 'DELETE': {
        if (!id) return sendJson(res, 400, { error: 'Missing "id" query param' })
        await sfDelete(type, id)
        return sendJson(res, 200, { id, success: true })
      }
      default:
        return sendJson(res, 405, { error: `Method ${req.method} not allowed` })
    }
  } catch (err) {
    sendJson(res, 502, { error: err.message })
  }
}
