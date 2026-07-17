import { useEffect, useMemo, useState } from 'react'
import { getSession } from '../lib/sfSession'
import { IDENTITY } from '../lib/appContext'

// Token access stays behind sfSession — one cached token for the whole app,
// refreshed automatically before expiry.
const tokenProvider = async () => (await getSession()).accessToken

/**
 * RuntimeContext for the composable panels. security.baseUrl comes from the
 * token gateway, so the context is null until the first session resolves.
 * Returns { context, error }.
 */
export function useRuntimeContext(quoteId) {
  const [baseUrl, setBaseUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getSession().then(
      (session) => !cancelled && setBaseUrl(session.baseUrl),
      (err) => !cancelled && setError(err),
    )
    return () => {
      cancelled = true
    }
  }, [])

  const context = useMemo(() => {
    if (!baseUrl) return null
    return {
      runtime: 'custom',
      identity: IDENTITY,
      session: {
        origin: 'REACT_STOREFRONT',
        ...(quoteId ? { quoteId } : {}),
      },
      security: { baseUrl, tokenProvider },
    }
  }, [baseUrl, quoteId])

  return { context, error }
}
