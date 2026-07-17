import { useState } from 'react'
import { useCart } from '../cart/CartContext'

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
}

export default function Checkout() {
  const cart = useCart()
  const [shipping, setShipping] = useState(emptyAddress)
  const [placed, setPlaced] = useState(false)

  const addressComplete =
    shipping.street.trim() &&
    shipping.city.trim() &&
    shipping.state.trim() &&
    shipping.zip.trim() &&
    shipping.country.trim()

  if (placed) {
    return (
      <div className="page" style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto' }}>
        <h1>Order placed 🎉</h1>
        <p>
          Shipping to: {shipping.street}, {shipping.city}, {shipping.state}{' '}
          {shipping.zip}, {shipping.country}
        </p>
      </div>
    )
  }

  return (
    <div
      className="page"
      style={{
        padding: '32px 24px',
        maxWidth: 1080,
        margin: '0 auto',
        display: 'flex',
        gap: 32,
      }}
    >
      <div style={{ flex: 2 }}>
        <h1>Checkout</h1>
        <h2 style={{ fontSize: 18, marginTop: 24 }}>Shipping address</h2>
        <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
          {[
            ['street', 'Street'],
            ['city', 'City'],
            ['state', 'State'],
            ['zip', 'ZIP'],
            ['country', 'Country'],
          ].map(([key, label]) => (
            <label key={key} style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
              <input
                value={shipping[key]}
                onChange={(e) =>
                  setShipping((prev) => ({ ...prev, [key]: e.target.value }))
                }
                style={{ padding: '8px 12px', border: '1px solid #dbdbdb', borderRadius: 4 }}
              />
            </label>
          ))}
        </div>
      </div>

      <aside
        style={{
          flex: 1,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 20,
          height: 'fit-content',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Order summary</h3>
        {cart.lines.length === 0 && <p>Cart is empty.</p>}
        {cart.lines.map(({ product, quantity }) => (
          <div
            key={product.id}
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}
          >
            <span>
              {quantity} × {product.name}
            </span>
            <span>{fmt(product.price * quantity)}</span>
          </div>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total</span>
          <span>{fmt(cart.total)}</span>
        </div>
        <button
          type="button"
          disabled={!addressComplete || cart.lines.length === 0}
          onClick={() => {
            setPlaced(true)
            cart.clear()
          }}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '10px 0',
            background:
              !addressComplete || cart.lines.length === 0 ? '#d1d5db' : '#c2703e',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
            cursor:
              !addressComplete || cart.lines.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Place order
        </button>
        {!addressComplete && (
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            Enter a complete shipping address first.
          </p>
        )}
      </aside>
    </div>
  )
}
