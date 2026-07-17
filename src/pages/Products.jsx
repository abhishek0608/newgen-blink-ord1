import Catalog from '../components/Catalog.jsx'

export default function Products() {
  return (
    <div className="page" style={{ padding: '32px 24px', maxWidth: 1080, margin: '0 auto' }}>
      <Catalog title="Products" pageSize={12} />
    </div>
  )
}
