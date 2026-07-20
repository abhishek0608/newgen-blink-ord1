import { useNavigate } from 'react-router-dom'

// Bundle/tier catalog page — host-owned presentation layer showing curated
// bundles as pricing-tier cards (hero, wave band with feature icons, upfront +
// monthly pricing, includes list). Styling lives in bundles.css.

const FEATURES = {
  pitcher: { icon: 'ac_unit', label: 'Pitcher Fits Most Fridge Doors' },
  drinking: { icon: 'water_drop', label: 'Filtered Drinking Water' },
  bathing: { icon: 'shower', label: 'Cleaner Water For Bathing' },
}

const TAGS = ['Chlorine', 'VOCs', 'Lead', 'PFAS']

const BUNDLES = [
  {
    id: 'silver',
    tier: 'Silver',
    name: 'Silver - Countertop Bundle - Self Install',
    upfront: 228.99,
    monthly: 19.94,
    features: [FEATURES.pitcher, FEATURES.drinking],
    includes: ['1 Countertop', '1 Pitcher'],
  },
  {
    id: 'platinum',
    tier: 'Platinum',
    name: 'Platinum - Countertop Bundle - Self Install',
    upfront: 348.97,
    monthly: 24.44,
    popular: true,
    features: [FEATURES.pitcher, FEATURES.drinking, FEATURES.bathing],
    includes: ['1 Countertop', '1 Pitcher', '2 Shower Filters'],
  },
  {
    id: 'gold',
    tier: 'Gold',
    name: 'Gold - Countertop Bundle - Self Install',
    upfront: 288.98,
    monthly: 22.19,
    features: [FEATURES.pitcher, FEATURES.drinking, FEATURES.bathing],
    includes: ['1 Countertop', '1 Pitcher', '1 Shower Filter'],
  },
]

const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function PitcherArt() {
  return (
    <svg
      className="bundle-card__art"
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

function BundleCard({ bundle, onConfigure }) {
  return (
    <article
      className={`bundle-card${bundle.popular ? ' bundle-card--popular' : ''}`}
    >
      {bundle.popular ? (
        <span className="bundle-card__ribbon">Popular</span>
      ) : null}

      <div className="bundle-card__hero">
        <span
          className={`bundle-card__tier bundle-card__tier--${bundle.id}`}
        >
          {bundle.tier}
        </span>
        <PitcherArt />
      </div>

      <div className="bundle-card__wave-band">
        <svg
          className="bundle-card__wave"
          viewBox="0 0 400 28"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 28V14C60 2 140 0 200 10s140 12 200-4v18Z"
            fill="currentColor"
          />
        </svg>
        <ul className="bundle-card__features">
          {bundle.features.map((f) => (
            <li key={f.label} className="bundle-card__feature">
              <span className="bundle-card__feature-icon">
                <span className="material-symbols-outlined">{f.icon}</span>
              </span>
              <span className="bundle-card__feature-label">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bundle-card__body">
        <h2 className="bundle-card__name">{bundle.name}</h2>

        <ul className="bundle-card__tags">
          {TAGS.map((tag) => (
            <li key={tag} className="bundle-card__tag">
              {tag}
            </li>
          ))}
        </ul>

        <div className="bundle-card__pricing">
          <div className="bundle-card__price-col">
            <span className="bundle-card__price-label">Upfront</span>
            <span className="bundle-card__price-value">
              {money(bundle.upfront)}
            </span>
          </div>
          <div className="bundle-card__price-col">
            <span className="bundle-card__price-label">Monthly</span>
            <span className="bundle-card__price-value">
              {money(bundle.monthly)}
              <sup>+</sup>
            </span>
          </div>
        </div>

        <ul className="bundle-card__includes">
          {bundle.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <button
          type="button"
          className="bundle-card__configure"
          onClick={() => onConfigure(bundle)}
        >
          Configure
        </button>
      </div>
    </article>
  )
}

export default function ProductsBundles() {
  const navigate = useNavigate()

  return (
    <div className="bundles-page">
      <p className="bundles-page__note">
        Bundles — host-owned tier cards; Configure hands off to the catalog.
      </p>
      <div className="bundles-grid">
        {BUNDLES.map((bundle) => (
          <BundleCard
            key={bundle.id}
            bundle={bundle}
            onConfigure={() => navigate('/products')}
          />
        ))}
      </div>
    </div>
  )
}
