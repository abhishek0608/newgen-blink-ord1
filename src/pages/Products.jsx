import { CatalogPanel } from '@expedite-commerce/next-gen-composable'
import { createSalesforceCatalogService } from '@expedite-commerce/next-gen-composable/salesforce'
import '@expedite-commerce/next-gen-composable/styles.css'
import { getBaseUrl, tokenProvider } from '../lib/sfSession'
import { APP_CONTEXT } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

// The whole Salesforce wiring: baseUrl + token. SOQL, schema mapping, and
// transport live inside the package's /salesforce adapter.
const service = createSalesforceCatalogService({ baseUrl: getBaseUrl, tokenProvider })

export default function Products() {
  const cart = useCart()
  return (
    <div className="page">
      <CatalogPanel
        context={APP_CONTEXT}
        service={service}
        title="Products"
        pageSize={6}
        onAddToCart={(product, quantity) => cart.add(product, quantity)}
      />
    </div>
  )
}
