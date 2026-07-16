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

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}
