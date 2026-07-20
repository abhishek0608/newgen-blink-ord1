import Catalog from '../components/Catalog.jsx'

export default function Products() {
  return (
    <div className="catalog-page">
      <div className="catalog-page__accent" aria-hidden="true" />

      <div className="catalog-context-bar">
        <div className="catalog-context-bar__item">
          <span className="catalog-context-bar__label">Location</span>
          <span className="catalog-context-bar__value">USA – Houston</span>
          <button type="button" className="catalog-context-bar__change">
            Change
          </button>
        </div>
        <div className="catalog-context-bar__item">
          <span className="catalog-context-bar__label">Sold To</span>
          <span className="catalog-context-bar__value">
            HMH Prospective Client
          </span>
          <button type="button" className="catalog-context-bar__change">
            Change
          </button>
        </div>
      </div>

      <div className="catalog-main">
        <p
          style={{
            margin: '0 0 20px',
            color: '#8a94a3',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
          }}
        >
          UI Change — the same <code>CatalogPanel</code>, themed with host style
          overrides.
        </p>
        <Catalog title="All Products" pageSize={12} themed />
      </div>
    </div>
  )
}
