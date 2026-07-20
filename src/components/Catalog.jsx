import { CatalogPanel } from '@nextgen-composable/next-gen-composable'
import { useRuntimeContext } from '../hooks/useRuntimeContext'
import { USER_TYPE } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

// Salesforce-direct catalog: search/listing and add-to-cart come from the
// composable; the host only persists the quote id it hands back.
// Card layout matching the HMHConnect reference: horizontal cards showing
// Part No. + Price columns and an availability pill (from the panel's built-in
// stock flag). See catalog.css for the visual styling.
const CATALOG_CONFIG = {
  layout: 'horizontal',
  showAvailability: true,
  cardFields: [
    { field: 'sku', label: 'Part No.' },
    { field: 'price', label: 'Price' },
  ],
}

// `themed` picks the "UI Change" look: the config-as-code card fields plus the
// `.catalog-themed` scope that catalog.css hangs its palette/overrides off. Left
// off (the "Basic" demo), the panel renders with packaged defaults and styling.
export default function Catalog({ title = 'Products', pageSize = 12, themed = false }) {
  const cart = useCart()
  const { context, error } = useRuntimeContext(cart.quoteId)

  if (error) {
    return <p className="home-error">Salesforce unavailable: {error.message}</p>
  }
  if (!context) {
    return <p className="home-loading">Connecting to Salesforce...</p>
  }

  const panel = (
    <CatalogPanel
      context={context}
      userType={USER_TYPE}
      config={themed ? CATALOG_CONFIG : undefined}
      title={title}
      pageSize={pageSize}
      onAddToCart={(product, quantity) => cart.bump(quantity)}
      onAddedToCart={(result) => {
        if (result.quoteId) cart.setQuoteId(result.quoteId)
      }}
    />
  )

  return themed ? <div className="catalog-themed">{panel}</div> : panel
}
