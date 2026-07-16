import { useState } from 'react'
import { AddressPanel } from '@expedite-commerce/next-gen-composable'
import { createSalesforceAddressService } from '@expedite-commerce/next-gen-composable/salesforce'
import '@expedite-commerce/next-gen-composable/styles.css'
import { getBaseUrl, tokenProvider } from '../lib/sfSession'
import { APP_CONTEXT } from '../lib/appContext'
import { useCart } from '../cart/CartContext'

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// Address composable, Salesforce-backed: saved addresses come from the
// signed-in account's Billing/Shipping fields; typeahead degrades to manual
// entry (no address provider wired), so checkout is never blocked.
const addressService = createSalesforceAddressService({ baseUrl: getBaseUrl, tokenProvider })

export default function Checkout() {
  const cart = useCart()
  const [shipping, setShipping] = useState(null)
  const [placed, setPlaced] = useState(false)

  if (placed) {
    return (
      <div className="page" style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto' }}>
        <h1>Order placed 🎉</h1>
        <p>
          Shipping to: {shipping.street}, {shipping.city}, {shipping.state} {shipping.zip},{' '}
          {shipping.country}
        </p>
      </div>
    )
  }

  return (
    <div
      className="page"
      style={{ padding: '32px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', gap: 32 }}
    >
      <div style={{ flex: 2 }}>
        <h1>Checkout</h1>
        <AddressPanel
          context={APP_CONTEXT}
          service={addressService}
          addressType="shipping"
          onAddressSelected={setShipping}
        />
      </div>

      <aside style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, height: 'fit-content' }}>
        <h3 style={{ marginTop: 0 }}>Order summary</h3>
        {cart.lines.length === 0 && <p>Cart is empty.</p>}
        {cart.lines.map(({ product, quantity }) => (
          <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
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
          disabled={!shipping || cart.lines.length === 0}
          onClick={() => {
            setPlaced(true)
            cart.clear()
          }}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '10px 0',
            background: !shipping || cart.lines.length === 0 ? '#d1d5db' : '#c2703e',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
            cursor: !shipping || cart.lines.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Place order
        </button>
        {!shipping && <p style={{ color: '#6b7280', fontSize: 13 }}>Select or enter a shipping address first.</p>}
      </aside>
    </div>
  )
}
