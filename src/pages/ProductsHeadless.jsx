import { useMemo } from 'react'
import {
  useCatalogController,
  createSalesforceCatalogService,
  createSalesforceCartService,
  formatPrice,
} from '@nextgen-composable/next-gen-composable'
import { useRuntimeContext } from '../hooks/useRuntimeContext'
import { USER_TYPE } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name (A–Z)' },
]

// "Headless" consumption pattern: the composable serves only backend/logic/data
// (useCatalogController + the Salesforce services); the UI below is entirely
// host-owned — a different look from the packaged CatalogPanel, driving the same
// controller methods (setQuery / setCategory / setSort / setPage / addToCart).
export default function ProductsHeadless() {
  const cart = useCart()
  const { context, error } = useRuntimeContext(cart.quoteId)

  if (error) {
    return (
      <div className="hl">
        <div className="hl__banner hl__banner--error">
          Salesforce unavailable: {error.message}
        </div>
      </div>
    )
  }
  if (!context) {
    return (
      <div className="hl">
        <p className="hl__loading">Connecting to Salesforce…</p>
      </div>
    )
  }
  // Child mounts only with a resolved context — the controller is created once
  // per mount and needs a non-null context.
  return <HeadlessCatalog context={context} cart={cart} />
}

function HeadlessCatalog({ context, cart }) {
  const service = useMemo(() => createSalesforceCatalogService(), [])
  const cartService = useMemo(() => createSalesforceCartService(), [])

  const { state, controller } = useCatalogController({
    service,
    cartService,
    userType: USER_TYPE,
    context,
    pageSize: 12,
    loadCategories: false,
    onAddToCart: (_product, quantity) => cart.bump(quantity),
    onAddedToCart: (result) => {
      if (result.quoteId) cart.setQuoteId(result.quoteId)
    },
  })

  const showSkeleton = state.loading && state.products.length === 0
  const empty =
    state.loaded && !state.loading && state.products.length === 0 && !state.degraded

  return (
    <div className="hl">
      <p
        style={{
          margin: '0 0 20px',
          color: '#8a94a3',
          fontFamily: 'Roboto, sans-serif',
          fontSize: 13,
        }}
      >
        Headless — the composable supplies data + logic only; this UI is
        host-owned.
      </p>
      <header className="hl__toolbar">
        <div className="hl__toolbar-titles">
          <h1 className="hl__title">Headless Catalog</h1>
          <p className="hl__subtitle">
            Custom UI · composable data via <code>useCatalogController</code>
          </p>
        </div>

        <div className="hl__search">
          <span className="hl__search-icon material-symbols-outlined">search</span>
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search parts…"
            value={state.query}
            onChange={(e) => controller.setQuery(e.target.value)}
          />
        </div>

        <label className="hl__sort">
          <span className="hl__sort-label">Sort</span>
          <select
            value={state.sort}
            onChange={(e) => controller.setSort(e.target.value)}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="hl__body">
        <main className="hl__main">
          {state.errorMessage ? (
            <div className="hl__banner hl__banner--error">
              <span>{state.errorMessage}</span>
              {state.degraded ? (
                <button
                  type="button"
                  className="hl__retry"
                  onClick={() => void controller.refresh()}
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}
          {state.cartError ? (
            <div className="hl__banner hl__banner--error">{state.cartError}</div>
          ) : null}

          <div className="hl__count">
            {state.loaded ? `${state.totalCount} results` : 'Loading…'}
          </div>

          <div className="hl__table-wrap">
            <table className="hl__table">
              <thead>
                <tr>
                  <th className="hl__col-product">Product</th>
                  <th className="hl__col-sku">Part No.</th>
                  <th className="hl__col-price">Price</th>
                  <th className="hl__col-stock">Availability</th>
                  <th className="hl__col-qty">Qty</th>
                </tr>
              </thead>
              <tbody>
                {showSkeleton
                  ? Array.from({ length: 6 }, (_, i) => (
                      <tr key={`sk-${i}`} className="hl__row" aria-hidden="true">
                        <td className="hl__cell-product">
                          <div className="hl__thumb hl__skeleton" />
                          <div className="hl__skeleton hl__skeleton--line" />
                        </td>
                        <td><div className="hl__skeleton hl__skeleton--sm" /></td>
                        <td><div className="hl__skeleton hl__skeleton--sm" /></td>
                        <td><div className="hl__skeleton hl__skeleton--sm" /></td>
                        <td><div className="hl__skeleton hl__skeleton--sm" /></td>
                      </tr>
                    ))
                  : state.products.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        quantity={state.cartQuantities[p.id] ?? 0}
                        busy={state.addingToCartId === p.id}
                        controller={controller}
                      />
                    ))}
              </tbody>
            </table>

            {empty ? <p className="hl__empty">No products match your search.</p> : null}
          </div>

          {state.pageCount > 1 ? (
            <nav className="hl__pager" aria-label="Pagination">
              <button
                type="button"
                className="hl__pager-btn"
                disabled={state.page <= 1}
                onClick={() => controller.setPage(state.page - 1)}
              >
                Previous
              </button>
              <span className="hl__pager-status">
                Page {state.page} of {state.pageCount}
              </span>
              <button
                type="button"
                className="hl__pager-btn"
                disabled={state.page >= state.pageCount}
                onClick={() => controller.setPage(state.page + 1)}
              >
                Next
              </button>
            </nav>
          ) : null}
        </main>
      </div>
    </div>
  )
}

function ProductRow({ product, quantity, busy, controller }) {
  return (
    <tr className="hl__row" data-in-stock={product.inStock}>
      <td className="hl__cell-product">
        <div className="hl__thumb">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" loading="lazy" />
          ) : (
            <span className="hl__thumb-sku">{product.sku}</span>
          )}
        </div>
        <div className="hl__prod-text">
          <button
            type="button"
            className="hl__prod-name"
            onClick={() => controller.selectProduct(product.id)}
          >
            {product.name}
          </button>
          {product.description ? (
            <span className="hl__prod-desc">{product.description}</span>
          ) : null}
        </div>
      </td>
      <td className="hl__cell-sku">{product.sku}</td>
      <td className="hl__cell-price">{formatPrice(product.price, product.currency)}</td>
      <td>
        <span
          className={`hl__badge${product.inStock ? ' hl__badge--in' : ' hl__badge--out'}`}
        >
          {product.inStock ? 'In stock' : 'Out of stock'}
        </span>
      </td>
      <td className="hl__cell-qty">
        {!product.inStock ? (
          <span className="hl__unavailable">—</span>
        ) : quantity > 0 ? (
          <div className="hl__stepper" data-busy={busy}>
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={busy}
              onClick={() => controller.setCartQuantity(product.id, quantity - 1)}
            >
              −
            </button>
            <span className="hl__stepper-value">{busy ? '…' : quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={busy}
              onClick={() => controller.setCartQuantity(product.id, quantity + 1)}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="hl__add"
            disabled={busy}
            onClick={() => controller.addToCart(product.id, 1)}
          >
            {busy ? 'Adding…' : 'Add'}
          </button>
        )}
      </td>
    </tr>
  )
}
