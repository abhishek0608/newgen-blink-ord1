// Shared Salesforce session for the whole app — ONE token fetch, reused by
// every page. The gateway (/api/salesforce/token) vends the Connected App's
// { accessToken, baseUrl, expiresAt }; everything else calls Salesforce
// directly with it.
//
//   import { soql } from './sfSession'
//   const result = await soql('SELECT Id FROM Account LIMIT 5')

const API_VERSION = 'v62.0'

let sessionPromise = null

function fetchSession() {
  return fetch('/api/salesforce/token').then(async (res) => {
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.error ?? `Token request failed (${res.status})`)
    return data // { accessToken, baseUrl, expiresAt }
  })
}

/** Cached session; concurrent callers share one request, refreshes 1 min before expiry. */
export function getSession() {
  sessionPromise ??= fetchSession().catch((err) => {
    sessionPromise = null // don't cache failures
    throw err
  })
  return sessionPromise.then((session) => {
    if (Date.now() >= session.expiresAt - 60_000) {
      sessionPromise = null
      return getSession()
    }
    return session
  })
}

/** Direct SOQL against Salesforce (token + baseUrl handled invisibly). */
export async function soql(query) {
  const { accessToken, baseUrl } = await getSession()
  const res = await fetch(
    `${baseUrl}/services/data/${API_VERSION}/query?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (res.status === 401) sessionPromise = null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = Array.isArray(data) ? data.map((e) => e.message).join('; ') : `HTTP ${res.status}`
    throw new Error(`Salesforce query failed: ${msg}`)
  }
  return data
}
