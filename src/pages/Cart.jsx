import { Link } from 'react-router-dom'
import { CartPanel } from '@expedite-commerce/composable-cart'
import '@expedite-commerce/composable-cart/styles.css'
import { useCart } from '../cart/CartContext'

// Cart composable renders the whole page (line table, promo code, quote
// summary, empty state) against the host's CartService; the host keeps only
// the checkout hand-off, per the contract.
export default function Cart() {
  const cart = useCart()

  return (
    <div className="page" style={{ padding: '32px 24px', maxWidth: 960, margin: '0 auto' }}>
      <CartPanel
        context={cart.context}
        service={cart.service}
        onCartChange={cart.sync}
        title="Cart"
        summaryTitle="Order Summary"
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        {cart.itemCount > 0 ? (
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
        ) : (
          <Link to="/products" style={{ color: '#c2703e' }}>
            Browse products →
          </Link>
        )}
      </div>
    </div>
  )
}
