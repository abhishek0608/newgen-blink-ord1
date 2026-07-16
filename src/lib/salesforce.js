// Frontend Salesforce client. Talks to the /api/salesforce/* routes — the
// browser never sees Salesforce credentials or tokens.
//
//   import { sf } from '../lib/salesforce'
//
//   const { records } = await sf.query('SELECT Id, Name FROM Account LIMIT 10')
//   const { id } = await sf.create('Account', { Name: 'Acme' })
//   const acct = await sf.retrieve('Account', id, ['Name', 'Industry'])
//   await sf.update('Account', id, { Industry: 'Retail' })
//   await sf.remove('Account', id)
//   const meta = await sf.describe('Account')
//   const info = await sf.connection()
//   const out = await sf.apex('POST', '/OrderService/', { accountId: '001...' })

async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/salesforce/${path}`, {
    method,
    ...(body !== undefined && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}

const sobjectPath = (type, id, extra = {}) => {
  const params = new URLSearchParams({ type, ...(id && { id }), ...extra })
  return `sobject?${params}`
}

export const sf = {
  connection: () => call('connection'),

  // query('SELECT ...') → one page; query(soql, { all: true }) → every record
  query: (soql, { all = false } = {}) =>
    call('query', { method: 'POST', body: { soql, all } }),

  create: (type, fields) => call(sobjectPath(type), { method: 'POST', body: fields }),

  retrieve: (type, id, fields) =>
    call(sobjectPath(type, id, fields?.length ? { fields: fields.join(',') } : {})),

  update: (type, id, fields) =>
    call(sobjectPath(type, id), { method: 'PATCH', body: fields }),

  remove: (type, id) => call(sobjectPath(type, id), { method: 'DELETE' }),

  describe: (type) => call(sobjectPath(type, null, { describe: 1 })),

  // Call a custom Apex REST endpoint (@RestResource). path is what follows
  // /services/apexrest and must start with "/". body is sent on POST/PATCH/PUT.
  apex: (method, path, body) =>
    call(`apex?path=${encodeURIComponent(path)}`, { method, body }),
}
