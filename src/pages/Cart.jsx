import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function Cart() {
  const cart = useCart()

  if (cart.lines.length === 0) {
    return (
      <div className="page" style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto' }}>
        <h1>Cart</h1>
        <p>
          Your cart is empty.{' '}
          <Link to="/products" style={{ color: '#c2703e' }}>
            Browse products →
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="page" style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto' }}>
      <h1>Cart</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: 8 }}>Product</th>
            <th style={{ padding: 8 }}>Qty</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Price</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Line total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cart.lines.map(({ product, quantity }) => (
            <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: 8 }}>
                <strong>{product.name}</strong>
                {product.sku && (
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{product.sku}</div>
                )}
              </td>
              <td style={{ padding: 8 }}>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) =>
                    cart.setQuantity(product.id, Number(e.target.value))
                  }
                  style={{ width: 60, padding: 4 }}
                />
              </td>
              <td style={{ padding: 8, textAlign: 'right' }}>{fmt(product.price)}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>
                {fmt(product.price * quantity)}
              </td>
              <td style={{ padding: 8 }}>
                <button
                  type="button"
                  onClick={() => cart.remove(product.id)}
                  style={{ cursor: 'pointer' }}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <strong style={{ fontSize: 18 }}>Total: {fmt(cart.total)}</strong>
        <Link
          to="/checkout"
          style={{
            background: '#c2703e',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 4,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  )
}
