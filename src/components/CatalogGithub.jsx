import { CatalogPanel } from '@expeditecommerce/github-next-gen-composables'
import { useRuntimeContext } from '../hooks/useRuntimeContext'
import { USER_TYPE } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

// Same Salesforce-direct catalog as ../components/Catalog.jsx, but the panel is
// sourced from the GitHub-published package
// (@expeditecommerce/github-next-gen-composables) instead of the npm
// @nextgen-composable/next-gen-composable build. The API surface is identical —
// host supplies context + userType, the panel owns search/listing/add-to-cart.
const CATALOG_CONFIG = {
  layout: 'horizontal',
  showAvailability: true,
  cardFields: [
    { field: 'sku', label: 'Part No.' },
    { field: 'price', label: 'Price' },
  ],
}

export default function CatalogGithub({ title = 'Products', pageSize = 12, themed = false }) {
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
