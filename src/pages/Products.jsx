import { CatalogPanel, createExecutorCatalogService } from '@expedite-commerce/next-gen-composable'
import '@expedite-commerce/next-gen-composable/styles.css'
import { createSalesforceCatalogExecutor } from '../lib/salesforceCatalogExecutor'

// Host wiring: the executor gets { baseUrl, token } from the gateway's token
// endpoint and calls Salesforce directly; the composable only sees DTOs.
const service = createExecutorCatalogService(createSalesforceCatalogExecutor())

const context = {
  runtime: 'custom',
  identity: { organizationId: 'ec-ord1-dev-ed' },
  session: { origin: 'REACT_STOREFRONT' },
}

export default function Products() {
  return (
    <div className="page">
      <CatalogPanel
        context={context}
        service={service}
        title="Products"
        pageSize={6}
        onProductSelected={(product) => console.log('selected', product)}
        onAddToCart={(product, quantity) => console.log('add to cart', quantity, product)}
      />
    </div>
  )
}
