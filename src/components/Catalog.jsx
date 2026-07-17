import { CatalogPanel } from '@nextgen-composable/next-gen-composable'
import { useRuntimeContext } from '../hooks/useRuntimeContext'
import { USER_TYPE } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

// Salesforce-direct catalog: search/listing and add-to-cart come from the
// composable; the host only persists the quote id it hands back.
export default function Catalog({ title = 'Products', pageSize = 12 }) {
  const cart = useCart()
  const { context, error } = useRuntimeContext(cart.quoteId)

  if (error) {
    return <p className="home-error">Salesforce unavailable: {error.message}</p>
  }
  if (!context) {
    return <p className="home-loading">Connecting to Salesforce...</p>
  }

  return (
    <CatalogPanel
      context={context}
      userType={USER_TYPE}
      title={title}
      pageSize={pageSize}
      onAddToCart={(product, quantity) => cart.bump(quantity)}
      onAddedToCart={(result) => {
        if (result.quoteId) cart.setQuoteId(result.quoteId)
      }}
    />
  )
}
