// Shared Salesforce session for the whole app — ONE token fetch, reused by
// every page and composable. The gateway (/api/salesforce/token) vends the
// Connected App's { accessToken, baseUrl, expiresAt }; everything else calls
// Salesforce directly with it.
//
//   import { tokenProvider, getBaseUrl, soql } from './sfSession'
//
//   const service = createSalesforceCatalogService({ baseUrl: getBaseUrl, tokenProvider })
//   const result  = await soql('SELECT Id FROM Account LIMIT 5')   // host pages

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

export const tokenProvider = async () => (await getSession()).accessToken

export const getBaseUrl = async () => (await getSession()).baseUrl

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
