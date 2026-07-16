import { CatalogPanel } from '@expedite-commerce/next-gen-composable'
import { createHttpCatalogService } from '@expedite-commerce/next-gen-composable/http'
import '@expedite-commerce/next-gen-composable/styles.css'
import { APP_CONTEXT } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

// All catalog ops go through the same-origin /api/catalog BFF (the package's
// own server handler) — the browser never talks to Salesforce or holds a token.
const service = createHttpCatalogService()

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
