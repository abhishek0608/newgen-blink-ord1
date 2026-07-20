import { useEffect, useMemo, useState } from 'react'
import {
  useCatalogController,
  createSalesforceCatalogService,
  createSalesforceCartService,
  formatPrice,
} from '@nextgen-composable/next-gen-composable'
import { useRuntimeContext } from '../hooks/useRuntimeContext'
import { USER_TYPE } from '../lib/appContext'
import { useCart } from '../cart/CartContext'
import { HMH_CATALOG_CONFIG } from '../lib/hmhCatalogConfig'

// HMH Catalog — config-as-code over the headless composable. All knobs live
// in lib/hmhCatalogConfig.js: the `data` section drives the composable's
// Salesforce calls (sort/query/category/page size), the `card` section picks
// which DTO fields and merchandising decorations each card renders.

const SKELETON_COUNT = 6

function PitcherArt() {
  return (
    <svg
      className="hmh-card__art"
      viewBox="0 0 120 130"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="pitcher-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f7f9" />
          <stop offset="100%" stopColor="#d7dde3" />
        </linearGradient>
      </defs>
      {/* handle */}
      <path
        d="M86 38c14 2 22 12 20 26-2 15-12 24-24 26l-2-9c9-2 15-8 16-18 1-9-4-15-12-16Z"
        fill="#c6cdd4"
      />
      {/* body */}
      <path
        d="M34 22h46l-6 96c-.4 5-4 8-9 8H49c-5 0-8.6-3-9-8Z"
        fill="url(#pitcher-body)"
        stroke="#b8c0c8"
        strokeWidth="2"
      />
      {/* lid */}
      <path
        d="M30 22c0-5 4-9 9-9h36c5 0 9 4 9 9v2H30Z"
        fill="#e3e8ec"
        stroke="#b8c0c8"
        strokeWidth="2"
      />
      {/* spout */}
      <path d="M30 13 22 20l10 6Z" fill="#e3e8ec" stroke="#b8c0c8" strokeWidth="2" />
      {/* inner filter cup */}
      <path
        d="M44 30h26l-3 34c-.3 4-3 6-7 6h-6c-4 0-6.7-2-7-6Z"
        fill="#ffffff"
        opacity="0.75"
      />
    </svg>
  )
}

function TierCard({ tier, product, popular, busy, cardConfig, onConfigure }) {
  const { titleField, subtitleField, tags, showMonthly, monthlyTermMonths } =
    cardConfig
  // Broken/missing product images fall back to the pitcher illustration.
  const [imageFailed, setImageFailed] = useState(false)
  const monthly =
    showMonthly && product.price != null
      ? product.price / monthlyTermMonths
      : null

  return (
    <article className={`hmh-card${popular ? ' hmh-card--popular' : ''}`}>
      {popular ? <span className="hmh-card__ribbon">Popular</span> : null}

      <div className="hmh-card__hero">
        <span className={`hmh-card__tier hmh-card__tier--${tier.id}`}>
          {tier.tier}
        </span>
        {product.imageUrl && !imageFailed ? (
          <img
            className="hmh-card__art"
            src={product.imageUrl}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <PitcherArt />
        )}
      </div>

      <div className="hmh-card__wave-band">
        <svg
          className="hmh-card__wave"
          viewBox="0 0 400 28"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 28V14C60 2 140 0 200 10s140 12 200-4v18Z"
            fill="currentColor"
          />
        </svg>
        <ul className="hmh-card__features">
          {tier.features.map((f) => (
            <li key={f.label} className="hmh-card__feature">
              <span className="hmh-card__feature-icon">
                <span className="material-symbols-outlined">{f.icon}</span>
              </span>
              <span className="hmh-card__feature-label">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hmh-card__body">
        <h2 className="hmh-card__name">{product[titleField]}</h2>
        {subtitleField && product[subtitleField] ? (
          <p className="hmh-card__subtitle">{product[subtitleField]}</p>
        ) : null}

        <ul className="hmh-card__tags">
          {tags.map((tag) => (
            <li key={tag} className="hmh-card__tag">
              {tag}
            </li>
          ))}
        </ul>

        <div className="hmh-card__pricing">
          <div className="hmh-card__price-col">
            <span className="hmh-card__price-label">Upfront</span>
            <span className="hmh-card__price-value">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
          {monthly != null ? (
            <div className="hmh-card__price-col">
              <span className="hmh-card__price-label">Monthly</span>
              <span className="hmh-card__price-value">
                {formatPrice(monthly, product.currency)}
                <sup>+</sup>
              </span>
            </div>
          ) : null}
        </div>

        <ul className="hmh-card__includes">
          {tier.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <button
          type="button"
          className="hmh-card__configure"
          disabled={busy || !product.inStock}
          onClick={onConfigure}
        >
          {busy ? 'Adding…' : product.inStock ? 'Configure' : 'Out of stock'}
        </button>
      </div>
    </article>
  )
}

function TierCardSkeleton({ tier }) {
  return (
    <article className="hmh-card hmh-card--skeleton" aria-hidden="true">
      <div className="hmh-card__hero">
        <span className={`hmh-card__tier hmh-card__tier--${tier.id}`}>
          {tier.tier}
        </span>
        <PitcherArt />
      </div>
      <div className="hmh-card__body">
        <div className="hmh-skeleton hmh-skeleton--title" />
        <div className="hmh-skeleton hmh-skeleton--block" />
        <div className="hmh-skeleton hmh-skeleton--cta" />
      </div>
    </article>
  )
}

function HmhCatalog({ context, cart, config }) {
  const service = useMemo(() => createSalesforceCatalogService(), [])
  const cartService = useMemo(() => createSalesforceCartService(), [])
  const { data, card } = config

  const { state, controller } = useCatalogController({
    service,
    cartService,
    userType: USER_TYPE,
    context,
    pageSize: data.pageSize,
    loadCategories: data.loadCategories,
    onAddToCart: (_product, quantity) => cart.bump(quantity),
    onAddedToCart: (result) => {
      if (result.quoteId) cart.setQuoteId(result.quoteId)
    },
  })

  // Push the config's search parameters into the controller — each one
  // re-runs the Salesforce search with the new server-side params.
  useEffect(() => {
    if (data.sort && data.sort !== 'relevance') controller.setSort(data.sort)
    if (data.query) controller.setQuery(data.query)
    if (data.categoryId) controller.setCategory(data.categoryId)
  }, [controller, data.sort, data.query, data.categoryId])

  const loading = state.loading && state.products.length === 0
  const empty =
    state.loaded && !state.loading && state.products.length === 0 && !state.degraded

  return (
    <div className="hmh-catalog-page">
      <p className="hmh-catalog-page__note">
        HMH Catalog — <code>HMH_CATALOG_CONFIG.data</code> drives the
        composable&apos;s Salesforce calls (sort, query, page size);
        <code>.card</code> picks what each card displays.
      </p>

      {state.errorMessage ? (
        <div className="hmh-catalog-page__banner">
          <span>{state.errorMessage}</span>
          {state.degraded ? (
            <button type="button" onClick={() => void controller.refresh()}>
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
      {state.cartError ? (
        <div className="hmh-catalog-page__banner">{state.cartError}</div>
      ) : null}

      <div className="hmh-catalog-page__count">
        {state.loaded
          ? `${state.totalCount} products · sorted by ${state.sort}`
          : 'Loading…'}
      </div>

      <div className="hmh-catalog-grid">
        {loading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <TierCardSkeleton
                key={`sk-${i}`}
                tier={card.tiers[i % card.tiers.length]}
              />
            ))
          : state.products.map((product, i) => (
              <TierCard
                key={product.id}
                tier={card.tiers[i % card.tiers.length]}
                product={product}
                popular={i === card.popularIndex}
                busy={state.addingToCartId === product.id}
                cardConfig={card}
                onConfigure={() => controller.addToCart(product.id, 1)}
              />
            ))}
      </div>

      {empty ? (
        <p className="hmh-catalog-page__note">No products found.</p>
      ) : null}

      {state.pageCount > 1 ? (
        <nav className="hmh-catalog-page__pager" aria-label="Pagination">
          <button
            type="button"
            disabled={state.page <= 1}
            onClick={() => controller.setPage(state.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {state.page} of {state.pageCount}
          </span>
          <button
            type="button"
            disabled={state.page >= state.pageCount}
            onClick={() => controller.setPage(state.page + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  )
}

export default function ProductsHmhCatalog() {
  const cart = useCart()
  const { context, error } = useRuntimeContext(cart.quoteId)

  if (error) {
    return (
      <div className="hmh-catalog-page">
        <div className="hmh-catalog-page__banner">
          Salesforce unavailable: {error.message}
        </div>
      </div>
    )
  }
  if (!context) {
    return (
      <div className="hmh-catalog-page">
        <p className="hmh-catalog-page__note">Connecting to Salesforce…</p>
      </div>
    )
  }
  // Child mounts only with a resolved context — the controller is created
  // once per mount and needs a non-null context.
  return <HmhCatalog context={context} cart={cart} config={HMH_CATALOG_CONFIG} />
}
