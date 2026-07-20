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

// HMH Catalog — composable-driven tier cards. Product data (name, price,
// stock) and add-to-cart come from the composable (useCatalogController +
// Salesforce services); the host only owns the merchandising overlay below
// (tier names, feature icons, includes list) and the card visuals in
// hmh-catalog.css. Configure = controller.addToCart on the shared quote.

const FEATURES = {
  pitcher: { icon: 'ac_unit', label: 'Pitcher Fits Most Fridge Doors' },
  drinking: { icon: 'water_drop', label: 'Filtered Drinking Water' },
  bathing: { icon: 'shower', label: 'Cleaner Water For Bathing' },
}

const TAGS = ['Chlorine', 'VOCs', 'Lead', 'PFAS']

// Presentation-only tier decoration, zipped in order onto the first three
// products the composable returns. Monthly is a 12-month split of the real
// Salesforce price.
const TIERS = [
  {
    id: 'silver',
    tier: 'Silver',
    features: [FEATURES.pitcher, FEATURES.drinking],
    includes: ['1 Countertop', '1 Pitcher'],
  },
  {
    id: 'platinum',
    tier: 'Platinum',
    popular: true,
    features: [FEATURES.pitcher, FEATURES.drinking, FEATURES.bathing],
    includes: ['1 Countertop', '1 Pitcher', '2 Shower Filters'],
  },
  {
    id: 'gold',
    tier: 'Gold',
    features: [FEATURES.pitcher, FEATURES.drinking, FEATURES.bathing],
    includes: ['1 Countertop', '1 Pitcher', '1 Shower Filter'],
  },
]

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

function TierCard({ tier, product, busy, onConfigure }) {
  const monthly = product.price != null ? product.price / 12 : null

  return (
    <article className={`hmh-card${tier.popular ? ' hmh-card--popular' : ''}`}>
      {tier.popular ? <span className="hmh-card__ribbon">Popular</span> : null}

      <div className="hmh-card__hero">
        <span className={`hmh-card__tier hmh-card__tier--${tier.id}`}>
          {tier.tier}
        </span>
        {product.imageUrl ? (
          <img className="hmh-card__art" src={product.imageUrl} alt="" />
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
        <h2 className="hmh-card__name">{product.name}</h2>

        <ul className="hmh-card__tags">
          {TAGS.map((tag) => (
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
          <div className="hmh-card__price-col">
            <span className="hmh-card__price-label">Monthly</span>
            <span className="hmh-card__price-value">
              {monthly != null ? formatPrice(monthly, product.currency) : '—'}
              <sup>+</sup>
            </span>
          </div>
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

function HmhCatalog({ context, cart }) {
  const service = useMemo(() => createSalesforceCatalogService(), [])
  const cartService = useMemo(() => createSalesforceCartService(), [])

  const { state, controller } = useCatalogController({
    service,
    cartService,
    userType: USER_TYPE,
    context,
    pageSize: TIERS.length,
    loadCategories: false,
    onAddToCart: (_product, quantity) => cart.bump(quantity),
    onAddedToCart: (result) => {
      if (result.quoteId) cart.setQuoteId(result.quoteId)
    },
  })

  const loading = state.loading && state.products.length === 0
  const cards = TIERS.map((tier, i) => ({ tier, product: state.products[i] }))

  return (
    <div className="hmh-catalog-page">
      <p className="hmh-catalog-page__note">
        HMH Catalog — product data + add-to-cart from the composable
        (<code>useCatalogController</code>); tier presentation is host-owned.
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

      <div className="hmh-catalog-grid">
        {cards.map(({ tier, product }) =>
          loading || !product ? (
            <TierCardSkeleton key={tier.id} tier={tier} />
          ) : (
            <TierCard
              key={tier.id}
              tier={tier}
              product={product}
              busy={state.addingToCartId === product.id}
              onConfigure={() => controller.addToCart(product.id, 1)}
            />
          ),
        )}
      </div>
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
  return <HmhCatalog context={context} cart={cart} />
}
