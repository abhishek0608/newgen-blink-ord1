import Catalog from '../components/Catalog.jsx'

// "Basic" consumption pattern: drop in the packaged CatalogPanel with no host
// styling. `themed` is omitted, so no `.catalog-themed` wrapper and no config
// overrides — the component renders exactly as it ships.
export default function ProductsBasic() {
  return (
    <div className="page" style={{ padding: '32px 24px', maxWidth: 1080, margin: '0 auto' }}>
      <p
        style={{
          margin: '0 0 20px',
          color: '#8a94a3',
          fontFamily: 'Roboto, sans-serif',
          fontSize: 13,
        }}
      >
        Basic — the packaged <code>CatalogPanel</code> with no UI changes.
      </p>
      <Catalog title="Products" pageSize={12} />
    </div>
  )
}
