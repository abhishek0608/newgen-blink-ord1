// Host-owned transport glue for the catalog composable.
//
// Pattern: token broker. The gateway (/api/salesforce/token) vends the
// Connected App's { accessToken, baseUrl }; this executor then calls the
// Salesforce REST API DIRECTLY with the Bearer token — the per-call proxy
// endpoints are not involved. Requires this app's origin in the org's CORS
// allowlist (Setup → CORS).
//
// Salesforce mapping: product = PricebookEntry joined to Product2 (standard
// pricebook); category = Product2.Family.
import { CATALOG_EXECUTOR_METHODS } from '@expedite-commerce/next-gen-composable'

const API_VERSION = 'v62.0'

const PRODUCT_FIELDS =
  'UnitPrice, Product2.Id, Product2.Name, Product2.ProductCode, Product2.Description, Product2.Family, Product2.DisplayUrl, Product2.IsActive'
const PRODUCT_FROM =
  'FROM PricebookEntry WHERE Pricebook2.IsStandard = true AND IsActive = true AND Product2.IsActive = true'

const ORDER_BY = {
  relevance: 'Product2.Name ASC',
  name: 'Product2.Name ASC',
  'price-asc': 'UnitPrice ASC',
  'price-desc': 'UnitPrice DESC',
}

const escapeSoql = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const toProduct = (entry) => ({
  id: entry.Product2.Id,
  sku: entry.Product2.ProductCode ?? '',
  name: entry.Product2.Name,
  description: entry.Product2.Description ?? '',
  price: entry.UnitPrice ?? 0,
  currency: 'USD',
  categoryId: entry.Product2.Family ?? undefined,
  imageUrl: entry.Product2.DisplayUrl ?? undefined,
  inStock: entry.Product2.IsActive,
})

export function createSalesforceCatalogExecutor({ tokenUrl = '/api/salesforce/token' } = {}) {
  // Cache the in-flight promise (not just the result) so concurrent calls
  // share one token request instead of each firing their own.
  let sessionPromise = null

  const getSession = () => {
    sessionPromise ??= (async () => {
      const res = await fetch(tokenUrl)
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? `Token request failed (${res.status})`)
      return data // { accessToken, baseUrl, expiresAt }
    })().catch((err) => {
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

  const soql = async (query) => {
    const { accessToken, baseUrl } = await getSession()
    const res = await fetch(
      `${baseUrl}/services/data/${API_VERSION}/query?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (res.status === 401) sessionPromise = null // token revoked early — refetch next call
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const msg = Array.isArray(data) ? data.map((e) => e.message).join('; ') : `HTTP ${res.status}`
      throw new Error(`Salesforce query failed: ${msg}`)
    }
    return data
  }

  const searchProducts = async ({ text = '', sort = 'relevance', page = 1, pageSize = 12, categoryId }) => {
    const filters = []
    const trimmed = String(text).trim()
    if (trimmed) {
      const like = `'%${escapeSoql(trimmed)}%'`
      filters.push(`(Product2.Name LIKE ${like} OR Product2.ProductCode LIKE ${like})`)
    }
    if (categoryId) filters.push(`Product2.Family = '${escapeSoql(categoryId)}'`)
    const where = filters.length ? ` AND ${filters.join(' AND ')}` : ''

    const [count, pageResult] = await Promise.all([
      soql(`SELECT COUNT() ${PRODUCT_FROM}${where}`),
      soql(
        `SELECT ${PRODUCT_FIELDS} ${PRODUCT_FROM}${where} ORDER BY ${ORDER_BY[sort] ?? ORDER_BY.relevance}` +
          ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
      ),
    ])
    return { status: 'success', products: pageResult.records.map(toProduct), totalCount: count.totalSize }
  }

  const getProduct = async ({ productId }) => {
    const result = await soql(
      `SELECT ${PRODUCT_FIELDS} ${PRODUCT_FROM} AND Product2.Id = '${escapeSoql(String(productId))}' LIMIT 1`,
    )
    const entry = result.records[0]
    if (!entry) return { status: 'error', errorMessage: `Unknown product ${productId}` }
    return { status: 'success', product: toProduct(entry) }
  }

  const listCategories = async () => {
    const result = await soql(
      `SELECT Product2.Family Family ${PRODUCT_FROM} AND Product2.Family != null GROUP BY Product2.Family`,
    )
    return {
      status: 'success',
      categories: result.records
        .filter((record) => record.Family)
        .map((record) => ({ id: record.Family, label: record.Family })),
    }
  }

  return async (method, payload) => {
    switch (method) {
      case CATALOG_EXECUTOR_METHODS.searchProducts:
        return searchProducts(payload)
      case CATALOG_EXECUTOR_METHODS.getProduct:
        return getProduct(payload)
      case CATALOG_EXECUTOR_METHODS.listCategories:
        return listCategories()
      default:
        throw new Error(`Salesforce executor: unsupported method ${method}`)
    }
  }
}
