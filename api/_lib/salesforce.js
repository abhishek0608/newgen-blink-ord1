// Server-side Salesforce client (OAuth 2.0 Client Credentials flow).
// Credentials come from env vars — never import this from frontend code.

const API_VERSION = 'v62.0'

// Module-level token cache; Salesforce access tokens live well past 25 min,
// and serverless instances are recycled anyway.
let cached = null

export async function getSalesforceAuth() {
  if (cached && Date.now() < cached.expiresAt) return cached

  const { SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET } = process.env
  if (!SF_LOGIN_URL || !SF_CLIENT_ID || !SF_CLIENT_SECRET) {
    throw new Error('Missing SF_LOGIN_URL / SF_CLIENT_ID / SF_CLIENT_SECRET env vars')
  }

  const res = await fetch(`${SF_LOGIN_URL.replace(/\/$/, '')}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Salesforce auth failed (${res.status}): ${data.error} — ${data.error_description}`)
  }

  cached = {
    accessToken: data.access_token,
    instanceUrl: data.instance_url,
    expiresAt: Date.now() + 25 * 60 * 1000,
  }
  return cached
}

export async function sfRequest(path, options = {}) {
  const { accessToken, instanceUrl } = await getSalesforceAuth()
  const res = await fetch(`${instanceUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // Token revoked/expired early — drop cache so the next call re-authenticates
    cached = null
  }

  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) {
    const msg = Array.isArray(body) ? body.map((e) => e.message).join('; ') : text
    throw new Error(`Salesforce API error (${res.status}): ${msg}`)
  }
  return body
}

export function sfQuery(soql) {
  return sfRequest(`/services/data/${API_VERSION}/query?q=${encodeURIComponent(soql)}`)
}

// Follows nextRecordsUrl until all pages are fetched. Use for result sets
// that may exceed the ~2000-record page limit.
export async function sfQueryAll(soql) {
  let page = await sfQuery(soql)
  const records = [...page.records]
  while (!page.done && page.nextRecordsUrl) {
    page = await sfRequest(page.nextRecordsUrl)
    records.push(...page.records)
  }
  return { totalSize: records.length, done: true, records }
}

export function sfCreate(type, fields) {
  return sfRequest(`/services/data/${API_VERSION}/sobjects/${type}`, {
    method: 'POST',
    body: JSON.stringify(fields),
  })
}

export function sfRetrieve(type, id, fields) {
  const qs = fields?.length ? `?fields=${encodeURIComponent(fields.join(','))}` : ''
  return sfRequest(`/services/data/${API_VERSION}/sobjects/${type}/${id}${qs}`)
}

export function sfUpdate(type, id, fields) {
  return sfRequest(`/services/data/${API_VERSION}/sobjects/${type}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

export function sfDelete(type, id) {
  return sfRequest(`/services/data/${API_VERSION}/sobjects/${type}/${id}`, {
    method: 'DELETE',
  })
}

export function sfDescribe(type) {
  return sfRequest(`/services/data/${API_VERSION}/sobjects/${type}/describe`)
}

// Call a custom Apex REST endpoint (@RestResource). path is what follows
// /services/apexrest, e.g. sfApex('GET', '/MyService/123')
export function sfApex(method, path, body) {
  return sfRequest(`/services/apexrest${path}`, {
    method,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export async function readJsonBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}
